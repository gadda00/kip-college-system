#!/usr/bin/env bash
# check-schema-drift.sh — guard against prisma/schema.prisma and
# prisma/schema.sqlite.prisma drifting apart.
#
# The two schema files must stay identical apart from provider-specific lines
# (datasource `provider`, generator `binaryTargets`, comments/notes and the
# LOCAL marker on the SQLite schema). Whitespace-only differences (blank lines
# and trailing spaces in the headers) are ignored — any other difference is
# drift: existing databases provisioned by src/lib/provision.ts would then
# diverge from what `prisma db push` / the Prisma client expects locally.
#
# Usage: bun run schema:check   (or: bash scripts/check-schema-drift.sh)
set -uo pipefail
cd "$(dirname "$0")/.."

PG=prisma/schema.prisma
SQLITE=prisma/schema.sqlite.prisma

if [[ ! -f "$PG" || ! -f "$SQLITE" ]]; then
  echo "schema:check — missing schema file(s): expected $PG and $SQLITE" >&2
  exit 2
fi

# Strip provider/binaryTargets/comment-only lines, trailing whitespace and
# blank lines — what remains is the actual model/field/index definition.
normalize() {
  grep -vE 'provider|binaryTargets|//|NOTE|LOCAL' "$1" \
    | sed -E 's/[[:space:]]+$//' \
    | sed -E '/^[[:space:]]*$/d'
}

if diff <(normalize "$PG") <(normalize "$SQLITE") > /dev/null; then
  echo "schema:check — OK: prisma/schema.prisma and prisma/schema.sqlite.prisma are in sync."
  exit 0
else
  echo "schema:check — DRIFT DETECTED between $PG and $SQLITE." >&2
  echo "" >&2
  echo "The two Prisma schemas must differ ONLY in provider/binaryTargets lines." >&2
  echo "Every model/field/index change must be applied to BOTH files (and, for" >&2
  echo "changes that must reach existing databases, to IN_PLACE_MIGRATIONS in" >&2
  echo "src/lib/provision.ts — see DEPLOYMENT.md 'Schema change contract')." >&2
  echo "" >&2
  echo "Diff (ignoring provider/binaryTargets/comment-only lines):" >&2
  diff <(normalize "$PG") <(normalize "$SQLITE") >&2 || true
  exit 1
fi
