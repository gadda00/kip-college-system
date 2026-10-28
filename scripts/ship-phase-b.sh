#!/usr/bin/env bash
# Task ID 19 (SHIPPER) — Phase B: fix + verify + sweep + ship.
# Safe to re-run: every step is idempotent or guarded (see comments).
set -uo pipefail
cd /home/z/my-project
LOG=/tmp/ship.log
exec > >(tee -a "$LOG") 2>&1
echo "===== SHIP PHASE B: $(date -u +%FT%TZ) ====="

redact() { sed 's|//[^/@]*@|//***@|g'; }

echo "--- B0: reconcile git history with origin/main (keep working tree) ---"
# Local main contains auto-committed sandbox junk (skills/, tool-results/) in
# its history; origin/main is the clean 238-file push. Re-point the branch to
# origin/main WITHOUT touching the working tree, so the curated stage in B6
# produces one clean fast-forward commit with zero junk.
for i in 1 2 3; do
  if git fetch origin main 2>&1 | redact | tail -2; then FETCH_OK=1; break; fi
  echo "fetch attempt $i failed — retrying"; sleep 3
done
[ "${FETCH_OK:-0}" = "1" ] || { echo "FATAL: cannot fetch origin/main"; exit 1; }
echo "HEAD before: $(git rev-parse --short HEAD) · origin/main: $(git rev-parse --short origin/main)"
if [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]; then
  git reset origin/main   # MIXED reset — working tree fully preserved
  echo "branch re-pointed to origin/main (mixed reset, working tree preserved)"
else
  echo "HEAD already at origin/main — nothing to reconcile"
fi
echo "modified/untracked vs origin/main (first 20):"
git status --short | head -20

echo "--- B1: apply advisory-lock fix in src/lib/provision.ts (idempotent) ---"
python3 - <<'PYEOF'
import sys
p = 'src/lib/provision.ts'
src = open(p).read()
old = "await tx.$queryRawUnsafe('SELECT pg_advisory_xact_lock(4711815)')"
new = "await tx.$executeRawUnsafe('SELECT pg_advisory_xact_lock(4711815)')"
if old in src:
    src = src.replace(old, new, 1)
    open(p, 'w').write(src)
    print('fix applied: $queryRawUnsafe → $executeRawUnsafe (void-returning advisory lock)')
elif new in src:
    print('fix already applied — skipping (idempotent re-run)')
else:
    print('FATAL: advisory-lock statement not found in either form')
    sys.exit(1)
PYEOF
B1_RC=$?
[ $B1_RC -ne 0 ] && { echo "FATAL: B1 failed"; exit 1; }

echo "--- B2: re-run PostgreSQL E2E (pristine path must now pass) ---"
bash scripts/pg-e2e-run.sh
E2E_RC=$?
echo "E2E_RC=$E2E_RC"
grep 'PG_E2E:' /tmp/pg-e2e-run.log | tail -1

echo "--- B3: integrate deliverables worklog entry + dedupe Task 18 entries ---"
if grep -q 'Task ID: 16' worklog.md; then
  echo "Task 16 entry already integrated — skipping append (idempotent re-run)"
else
  cat proposal-build/worklog-entry-16.md >> worklog.md
  echo "Task 16 deliverables entry appended to worklog.md"
fi
python3 - <<'PYEOF'
# keep only the LAST 'Task ID: 18' section in worklog.md
src = open('worklog.md').read()
parts = src.split('\n---\nTask ID: 18')
if len(parts) > 2:
    keep = parts[0] + '\n---\nTask ID: 18' + parts[-1]
    open('worklog.md', 'w').write(keep)
    print(f'deduped Task 18 entries: {len(parts)-1} → 1')
else:
    print(f'Task 18 entries: {len(parts)-1} (no dedupe needed)')
PYEOF

echo "--- B4: quality gates ---"
bunx tsc --noEmit; TSC_RC=$?; echo "TSC_RC=$TSC_RC"
bun run lint > /tmp/lint.out 2>&1; LINT_RC=$?; echo "LINT_RC=$LINT_RC"; tail -3 /tmp/lint.out
bun test tests/ 2>&1 | tail -3; UNIT_RC=${PIPESTATUS[0]}; echo "UNIT_RC=$UNIT_RC"
echo "--- B4b: Vercel-exact production build (type-checked) ---"
VERCEL=1 bun run build > /tmp/build.out 2>&1; BUILD_RC=$?; echo "BUILD_RC=$BUILD_RC"; tail -6 /tmp/build.out

echo "--- B5: dev server + smoke tests ---"
H=$(curl -s --max-time 5 http://localhost:3000/api/health 2>/dev/null || true)
if ! echo "$H" | grep -q '"ok":true'; then
  pkill -f "next dev" 2>/dev/null; sleep 2
  (setsid bun run dev < /dev/null > /dev/null 2>&1 &)
  for i in $(seq 1 30); do
    H=$(curl -s --max-time 3 http://localhost:3000/api/health 2>/dev/null || true)
    echo "$H" | grep -q '"ok":true' && break
    sleep 2
  done
fi
echo "dev health: $H"
bun run test:smoke 2>&1 | tail -6; SMOKE_RC=${PIPESTATUS[0]}; echo "SMOKE_RC=$SMOKE_RC"
echo "--- deliverables served locally? ---"
curl -s -o /dev/null -w "proposal.pdf: %{http_code} %{content_type} %{size_download}B\n" --max-time 15 http://localhost:3000/downloads/KIP-College-System-Proposal.pdf
curl -s -o /dev/null -w "presentation.pptx: %{http_code} %{content_type} %{size_download}B\n" --max-time 20 http://localhost:3000/downloads/KIP-College-System-Presentation.pptx

echo "--- GATE SUMMARY ---"
echo "E2E_RC=$E2E_RC TSC_RC=$TSC_RC LINT_RC=$LINT_RC UNIT_RC=$UNIT_RC BUILD_RC=$BUILD_RC SMOKE_RC=$SMOKE_RC"
FAILED_GATES=""
[ "$E2E_RC" != "0" ] && FAILED_GATES="$FAILED_GATES pg-e2e($E2E_RC)"
[ "$TSC_RC" != "0" ] && FAILED_GATES="$FAILED_GATES tsc($TSC_RC)"
[ "$LINT_RC" != "0" ] && FAILED_GATES="$FAILED_GATES lint($LINT_RC)"
[ "$UNIT_RC" != "0" ] && FAILED_GATES="$FAILED_GATES unit($UNIT_RC)"
[ "$BUILD_RC" != "0" ] && FAILED_GATES="$FAILED_GATES build($BUILD_RC)"
[ "$SMOKE_RC" != "0" ] && FAILED_GATES="$FAILED_GATES smoke($SMOKE_RC)"
if [ -n "$FAILED_GATES" ]; then
  echo "!!!! GATE FAILURES:$FAILED_GATES — NOT committing/pushing. STOP before Phase C."
  echo "===== SHIP PHASE B ABORTED (gate failures) ====="
  exit 1
fi

echo "--- B6: git stage (curated), commit, push ---"
git config core.fileMode false
git add .gitignore prisma/schema.prisma prisma/schema.sqlite.prisma prisma/seed.ts prisma/seed-data.ts \
  scripts/prisma-generate.mjs scripts/pg-e2e-run.sh scripts/pg-e2e-test.ts scripts/smoke-test.ts \
  src/lib/db.ts src/lib/provision.ts src/lib/audit.ts src/lib/money.ts src/lib/rate-limit.ts \
  src/app/api/health/route.ts src/app/sitemap.xml \
  src/components/kip/app.tsx src/components/kip/site/views/downloads-view.tsx \
  public/downloads/KIP-College-System-Proposal.pdf public/downloads/KIP-College-System-Presentation.pptx \
  proposal-build package.json next.config.ts README.md DEPLOYMENT.md .env.example \
  docs/product-audit.md worklog.md db/custom.db tests/ 2>&1 | head -5
git add -A proposal-build/ 2>/dev/null || true
echo "--- staged (first 40): ---"
git status --short | grep -v '^??' | head -40
echo "--- untracked left out (verify no junk staged): ---"
git status --short | grep '^??' | head -10
if git diff --cached --quiet; then
  echo "nothing staged — checking if already committed"
  git log --oneline -2
else
  git commit -m "PostgreSQL production runtime: dual Prisma schemas, auto-provisioning + seeding, PG E2E suite; code-split portals; real downloadable proposal & presentation" | tail -3
fi
PUSH_RC=1
for i in 1 2 3; do
  if git push origin main 2>&1 | redact | tail -3; then PUSH_RC=0; break; fi
  echo "push attempt $i failed — retrying"; sleep 5
done
echo "PUSH_RC=$PUSH_RC"
git log --oneline -2
echo "SHIP_COMMIT=$(git rev-parse --short HEAD)"
[ $PUSH_RC -ne 0 ] && { echo "FATAL: push failed after retries"; exit 1; }

echo "===== SHIP PHASE B DONE ====="
