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
