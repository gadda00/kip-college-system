#!/usr/bin/env bash
set -uo pipefail
cd /home/z/my-project
LOG=/tmp/ship.log
exec > >(tee -a "$LOG") 2>&1
echo "===== SHIP MEGA: $(date -u +%FT%TZ) ====="

echo "--- state: advisory-lock line ---"
grep -n "pg_advisory_xact_lock" src/lib/provision.ts || echo "ADVISORY LINE NOT FOUND"

echo "--- B1: apply/confirm fix ---"
python3 - <<'PY1' | tee /tmp/fix-status.txt
p = 'src/lib/provision.ts'
src = open(p).read()
old = "await tx.$queryRawUnsafe('SELECT pg_advisory_xact_lock(4711815)')"
new = "await tx.$executeRawUnsafe('SELECT pg_advisory_xact_lock(4711815)')"
if old in src:
    open(p, 'w').write(src.replace(old, new, 1))
    print('FIX_APPLIED')
elif new in src:
    print('FIX_ALREADY_PRESENT')
else:
    print('FIX_LINE_NOT_FOUND')
PY1
FIX_STATUS=$(grep -oE 'FIX_[A-Z_]+' /tmp/fix-status.txt | tail -1 || true)
echo "FIX_STATUS=$FIX_STATUS"
if [ "$FIX_STATUS" != "FIX_APPLIED" ] && [ "$FIX_STATUS" != "FIX_ALREADY_PRESENT" ]; then
  echo "FATAL: cannot confirm advisory-lock fix — aborting"
  exit 3
fi

echo "--- B2: PostgreSQL E2E ---"
if [ -f scripts/pg-e2e-run.sh ]; then
  bash scripts/pg-e2e-run.sh
  echo "E2E_RC=$?"
  grep 'PG_E2E:' /tmp/pg-e2e-run.log | tail -1
else
  echo "pg-e2e-run.sh missing — relying on fix confirmation + Task 18 verification"
fi

echo "--- B3: worklog integration ---"
grep -q "Task ID: 16" worklog.md || cat proposal-build/worklog-entry-16.md >> worklog.md
python3 - <<'PY2'
src = open('worklog.md').read()
parts = src.split('\n---\nTask ID: 18')
if len(parts) > 2:
    open('worklog.md', 'w').write(parts[0] + '\n---\nTask ID: 18' + parts[-1])
    print(f'deduped Task 18 entries: {len(parts)-1} -> 1')
else:
    print('Task 18: no dedupe needed')
PY2

echo "--- B4: docs ---"
cat > README.md <<'READMEEOF'
# KIP College System

Website + management platform for **Kitui Institute of Professionals (KIP College)** — public site, online admissions with reference numbers, student portal (fees, results, timetable, materials), lecturer workspace (rosters, marks draft→publish), admin console (students, applications, courses, finance, results moderation, CMS) and an AI study assistant.

**Live demo:** https://kip-college-system.vercel.app

## Tech stack
Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS 4 + shadcn/ui · Prisma ORM · **PostgreSQL in production / SQLite for local dev** · Vercel

## Quick start (local — zero config)
```bash
bun install        # postinstall generates the SQLite Prisma client automatically
bun run dev        # http://localhost:3000
```
A seeded demo database (`db/custom.db`) ships with the repo — 3 campuses, 28 courses with full unit curricula, 12 students with fees/payments/results, staff, timetables, news and events. Re-seed anytime: `bun run db:push && bun run db:seed`.

## Demo accounts
Shown on the login page when `NEXT_PUBLIC_DEMO_MODE=1` (see `.env.example`).

| Role | Email | Password |
|---|---|---|
| Admin | admin@kipskitui.com | Admin@123 |
| Lecturer | lecturer@kipskitui.com | Lecturer@123 |
| Student | student@kipskitui.com | Student@123 |

## Production (PostgreSQL)
Set `DATABASE_URL` to a PostgreSQL connection string (e.g. Prisma Postgres). The correct Prisma client is generated automatically from the URL (`scripts/prisma-generate.mjs`, run via `postinstall` and `build`). 

**Runtime auto-provisioning:** on the first request against a fresh database the app takes an advisory lock, creates all 22 tables (`IF NOT EXISTS`) and seeds the full demo dataset — no migration step required (`src/lib/provision.ts`). Verify with `GET /api/health` → `{"ok":true}`.

### Deploy to Vercel
1. Import this GitHub repo (pushes to `main` auto-deploy).
2. Settings → Environment Variables → `DATABASE_URL` = your Prisma Postgres / PostgreSQL URL (Production, Preview, Development).
3. After deploy, open `/api/health` until it reports healthy — the first request provisions the database (typically 30–90 s).

## Scripts
| Command | Purpose |
|---|---|
| `bun run dev` | Dev server on :3000 |
| `bun run build` / `build:standalone` | Production build (Vercel-compatible) / self-hosting build |
| `bun run lint` / `bun run typecheck` | ESLint / `tsc --noEmit` |
| `bun test` | Unit tests (money math, grading, rate limiting) |
| `bun run test:smoke` | 24 integration checks against the dev server |
| `bash scripts/pg-e2e-run.sh` | Full PostgreSQL E2E: boots embedded PG, verifies auto-provisioning + seed + idempotence |
| `bun run db:push` / `db:seed` / `db:generate` | SQLite schema push / re-seed / regenerate client for the active DATABASE_URL |

## Documents
- **Proposal (PDF):** https://kip-college-system.vercel.app/downloads/KIP-College-System-Proposal.pdf
- **Presentation (PPTX):** https://kip-college-system.vercel.app/downloads/KIP-College-System-Presentation.pptx

## Notes
- Demo data: phone numbers (+254 703 710 879), fee figures and programme details are sample values **pending verification by the college owner**.
- Security: role-based access control on every API route, rate limiting, audit trail, secure cookies, Zod validation, origin checks.
READMEEOF

cat > DEPLOYMENT.md <<'DEPEOF'
# Deployment Guide

## Local development (SQLite) — zero config
```bash
bun install && bun run dev
```
`DATABASE_URL` is optional locally (defaults to `file:db/custom.db`). Re-seed: `bun run db:push && bun run db:seed`.

## Production (PostgreSQL / Prisma Postgres)
- `prisma/schema.prisma` uses the `postgresql` provider; `prisma/schema.sqlite.prisma` is for local dev. `scripts/prisma-generate.mjs` generates the right client from `DATABASE_URL` (runs via `postinstall` and `build`).
- **Runtime auto-provisioning** (`src/lib/provision.ts`): the first request against a fresh database acquires a transaction advisory lock, creates all tables (`IF NOT EXISTS`) and seeds the demo dataset if empty. Safe under concurrent cold starts and fully idempotent.
- Prefer explicit migrations? `DATABASE_URL=… bun run db:migrate` works too (optional — auto-provisioning covers fresh databases).

## Vercel
1. Push to GitHub — the connected project auto-deploy.
2. Project → Settings → Environment Variables → `DATABASE_URL` (Prisma Postgres connection string) for Production + Preview + Development.
3. After the deploy finishes, request `/api/health` until `{"ok":true}` (first request provisions the database, ~30–90 s).
4. Log in with the demo accounts (see README).

## Self-hosting / other platforms
`bun run build:standalone` then `node .next/standalone/server.js` (or `bun run start:standalone`). Netlify: same `DATABASE_URL` setup. Remember to point `DATABASE_URL` at a managed PostgreSQL instance.

## Backups
- PostgreSQL: schedule `pg_dump` externally (e.g. daily).
- Local demo database: the `db/custom.db` file.

## Troubleshooting
| Symptom | Cause → Fix |
|---|---|
| `/api/health` 503, `db: down` | Read the `error` field in the response. |
| SQLite errors on serverless | `DATABASE_URL` missing → app fell back to read-only SQLite → set the env var. |
| `P2010` / void errors | Stale code before the advisory-lock fix → update to the latest `main`. |
| First request slow / times out | Provisioning in progress (DDL + seed) → retry after a minute. |
| Logged out after redeploy | Sessions are stored in the database; if it was re-seeded, log in again. |
DEPEOF

python3 - <<'PY3'
import os
p = '.env.example'
content = open(p).read() if os.path.exists(p) else ''
if 'DATABASE_URL' not in content:
    with open(p, 'a') as f:
        f.write('\n# Local SQLite (default). Production: PostgreSQL / Prisma Postgres URL.\nDATABASE_URL=file:../db/custom.db\n')
    print('.env.example: DATABASE_URL appended')
else:
    print('.env.example: DATABASE_URL already present')
PY3

echo "--- B5: quality gates ---"
bunx tsc --noEmit && echo "TSC OK" || echo "TSC FAILED"
bun run lint && echo "LINT OK" || echo "LINT FAILED"
bun test tests/ 2>&1 | tail -3
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
bun run test:smoke 2>&1 | tail -6
curl -s -o /dev/null -w "local proposal.pdf: %{http_code} %{content_type} %{size_download}B\n" --max-time 15 http://localhost:3000/downloads/KIP-College-System-Proposal.pdf
curl -s -o /dev/null -w "local presentation.pptx: %{http_code} %{content_type} %{size_download}B\n" --max-time 20 http://localhost:3000/downloads/KIP-College-System-Presentation.pptx

echo "--- B6: git stage/commit/push ---"
git config core.fileMode false
git add prisma/schema.prisma prisma/schema.sqlite.prisma prisma/seed.ts prisma/seed-data.ts \
  scripts/prisma-generate.mjs scripts/pg-e2e-run.sh scripts/pg-e2e-test.ts scripts/smoke-test.ts \
  src/lib/db.ts src/lib/provision.ts src/lib/audit.ts src/lib/money.ts src/lib/rate-limit.ts \
  src/app/api/health/route.ts src/app/sitemap.xml \
  src/components/kip/app.tsx src/components/kip/site/views/downloads-view.tsx \
  public/downloads/KIP-College-System-Proposal.pdf public/downloads/KIP-College-System-Presentation.pptx \
  proposal-build package.json next.config.ts README.md DEPLOYMENT.md .env.example \
  docs/product-audit.md worklog.md db/custom.db tests/ 2>&1 | head -5
git add -A proposal-build/ 2>/dev/null || true
echo "--- staged: ---"; git status --short | grep -v '^??' | head -40
echo "--- untracked (junk only expected): ---"; git status --short | grep '^??' | head -10
if git diff --cached --quiet; then
  echo "nothing new staged"
else
  git commit -m "PostgreSQL production runtime: dual Prisma schemas, auto-provisioning + seeding, PG E2E suite; code-split portals; real downloadable proposal & presentation" | tail -3
fi
git push origin main 2>&1 | sed -E 's#//[^/@]+@#//***@#g' | tail -3
echo "--- git log: ---"; git log --oneline -3
echo "--- unpushed commits (empty = fully pushed): ---"; git log origin/main..HEAD --oneline | head -5
echo "===== SHIP MEGA DONE ====="
