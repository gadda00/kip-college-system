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

## Schema change contract
`prisma/schema.prisma` (PostgreSQL) and `prisma/schema.sqlite.prisma` (local dev) must stay **identical** — run `bun run schema:check` (fails on drift; ignores only provider/`binaryTargets`/comment lines). **Every schema change that must reach EXISTING databases** (new column, index, constraint, FK behaviour) must **also** be added to `IN_PLACE_MIGRATIONS` in `src/lib/provision.ts`: each entry is a probe query plus idempotent DDL steps that the first request after deploy applies safely to a live database. Fresh databases get the change for free via the full-table provisioning; existing ones rely on these entries — a schema-only edit silently skips them.

## Vercel
1. Push to GitHub — the connected project auto-deploy.
2. Project → Settings → Environment Variables → `DATABASE_URL` (Prisma Postgres connection string) for Production + Preview + Development.
3. After the deploy finishes, request `/api/health` until `{"ok":true}` (first request provisions the database, ~30–90 s).
4. Log in with the demo accounts (see README).

## Preview deployments
Vercel preview deployments run in **production mode** (`NODE_ENV=production`), so demo seeding is off by default there — a preview pointed at a fresh database starts empty. If you want seeded content on previews (e.g. to share a review link), set **`DEMO_MODE=1`** on the Preview environment (only for throwaway/preview databases — never point it at a database holding real student data; see the warning in README / `.env.example`).

## Self-hosting / other platforms
`bun run build:standalone` then `node .next/standalone/server.js` (or `bun run start:standalone`). Netlify: same `DATABASE_URL` setup. Remember to point `DATABASE_URL` at a managed PostgreSQL instance.

## Rate limiting & scale
The limiter (`src/lib/rate-limit.ts`) is **in-memory, per serverless instance** — a documented trade-off: on Vercel each lambda instance keeps its own counters, so effective limits scale with instance count. The **per-account login lockout** is also in-memory but already mitigates cross-instance brute force for accounts. When you move to multiple persistent instances (self-hosted cluster, long-running containers), swap the limiter's storage for **Upstash Redis / Vercel KV** — the `rateLimited()` signature stays the same, so it's a drop-in change.

**Fresh-database cold start:** the first request against an empty database provisions the whole schema (+ optional seed) in **one transaction**; if that request times out mid-provision it **rolls back cleanly**, and the next request simply retries from scratch — self-healing, no half-created state.

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
