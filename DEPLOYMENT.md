# Deployment Guide

The app is **PostgreSQL-first in production and zero-config SQLite locally**:

- **Local development** — nothing to set up. `cp .env.example .env` (SQLite), `bun install`, `bun run dev`. The bundled, seeded `db/custom.db` just works.
- **Production** — set one environment variable, `DATABASE_URL`, to a PostgreSQL connection string (Prisma Postgres `prisma://…`, Neon, Supabase, RDS…). There is **no migration step**: on the first request after deploy, the app creates all 22 tables and seeds the demo dataset automatically (see *Runtime auto-provisioning* below).

---

## Option A — Vercel (recommended, ~5 minutes)

1. **Import the repository.** Fork/clone [github.com/gadda00/kip-college-system](https://github.com/gadda00/kip-college-system) and import it at [vercel.com/new](https://vercel.com/new) (or use the Deploy button in the README). Vercel auto-detects Next.js — keep the default build command.
2. **Add the database env var.** Project → **Settings → Environment Variables**:
   - Name: `DATABASE_URL`
   - Value: your PostgreSQL connection string, e.g.
     `prisma://…` (Prisma Postgres) or `postgresql://user:password@host/db?sslmode=require` (Neon / Supabase / any Postgres)
   - Apply it to **Production, Preview and Development**.
3. **Deploy.** The build regenerates the Prisma client for PostgreSQL automatically (`scripts/prisma-generate.mjs` reads `DATABASE_URL`).
4. **Wait for the first request to provision the database.** Cold-start provisioning (22 tables + demo seed, inside one transaction) takes a few seconds. Poll until it turns healthy:

   ```bash
   curl https://your-app.vercel.app/api/health
   # → {"ok":true,"status":"healthy","db":"up",…}
   ```

Optional: set `NEXT_PUBLIC_DEMO_MODE=1` (Production/Preview/Development) to show the demo-account helper on the login screen — handy while evaluating, off for go-live.

### Deploying with the Vercel CLI instead

```bash
npm i -g vercel
vercel login
vercel link
vercel env add DATABASE_URL production preview development   # paste the Postgres URL when prompted
vercel --prod
```

---

## Option B — Netlify

1. Import the repo at [app.netlify.com](https://app.netlify.com); Next.js is auto-detected.
2. **Add `DATABASE_URL`** (same PostgreSQL URL as above) under Site settings → Environment variables — production **and** the deploy contexts you use.
3. Deploy, then check `https://<site>.netlify.app/api/health` until it returns `{"ok":true}`.

Without `DATABASE_URL` on a serverless host, the app falls back to the bundled SQLite file — which is **read-only** in the function sandbox — so the health endpoint will report `503`. Set the variable and redeploy.

---

## Option C — Self-hosting (standalone build)

```bash
bun install
DATABASE_URL='postgresql://user:password@host/db' bun run build:standalone
DATABASE_URL='postgresql://user:password@host/db' NODE_ENV=production \
  bun .next/standalone/server.js        # listens on $PORT or 3000
```

The standalone output (`.next/standalone/`) bundles the server plus `static/` and `public/` — run it behind any reverse proxy (nginx, Caddy…) or in a container. Put a load balancer/PM2-style supervisor in front for availability.

---

## Runtime auto-provisioning (no migrate step)

On PostgreSQL, the first model query on each server instance awaits `ensureProvisioned()` (`src/lib/provision.ts`):

1. a transaction-scoped **advisory lock** serializes concurrent cold starts (several lambdas booting at once cannot double-provision);
2. inside that transaction the **22 tables** are created with raw DDL (idempotent — guarded by a schema probe);
3. the **demo dataset** is seeded (idempotent — guarded by a data probe).

Subsequent calls are no-ops. This replaces a deploy-time `prisma migrate` / `db push` step entirely: point `DATABASE_URL` at an empty PostgreSQL database and the app provisions itself on first request. (Prefer classic migrations anyway? `bun run db:migrate` / `bun run db:reset` operate on the PostgreSQL schema — they are optional, not required.)

---

## Custom domain

1. In Vercel/Netlify project settings, add your domain (e.g. `kipskitui.com`).
2. Follow the DNS instructions (an `A` record / `CNAME` pointing at the platform).
3. HTTPS certificates are provisioned automatically.

## Backups

- **PostgreSQL (production):** take regular dumps —
  ```bash
  pg_dump "$DATABASE_URL" -Fc -f kip-college-$(date +%F).dump
  ```
  Managed providers (Prisma Postgres, Neon, Supabase) also offer point-in-time restore on paid tiers; verify what your plan includes before go-live.
- **SQLite (local):** `db/custom.db` is a single file — copy it. It is demo data only.

## Environment variables reference

| Variable | Purpose | Example |
|---|---|---|
| `DATABASE_URL` | Database connection. SQLite `file:` path locally; PostgreSQL/Prisma Postgres URL in production — **required on serverless hosts** | `file:./db/custom.db` · `prisma://…` · `postgresql://user:pass@host/db?sslmode=require` |
| `NEXT_PUBLIC_DEMO_MODE` | `1` shows the demo login helper | `0` |

Optional: the AI assistant endpoints (public assistant and student Study Buddy) use a server-side LLM SDK; without credentials they return a friendly fallback reply, and every other feature is unaffected.

---

## Troubleshooting

| Symptom | Meaning | Fix |
|---|---|---|
| `/api/health` → `503`, error mentions SQLite / `read-only` / `unable to open database file` | `DATABASE_URL` is not set on the host, so the app fell back to the bundled SQLite file, which is read-only in the serverless sandbox | Add `DATABASE_URL` (PostgreSQL URL) to the host's env vars for all environments, then **redeploy** |
| `/api/health` → `503`, error mentions connection / auth / timeout | The `DATABASE_URL` value is wrong, expired, or the database firewall blocks the host | Re-copy the connection string; for Neon/Supabase check the compute is running and IP allow-listing |
| `/api/health` → `503`, error contains `P2010` (raw query error) | Old build: pre-fix code took the advisory lock via `$queryRawUnsafe`, which Prisma cannot deserialize on PostgreSQL | Update to the latest `main` — fixed by routing that statement through `$executeRawUnsafe` |
| First request after deploy is slow / times out | Cold-start auto-provisioning (22 tables + seed) is still running | Wait a few seconds and retry — provisioning is one-time per database; afterwards it is a no-op |
| Logins stopped working after many attempts | In-memory login rate limiting (10 attempts / 15 min / IP) | Wait 15 minutes; rate limits reset automatically |
| Data looks reset locally | Local dev uses the bundled SQLite demo database | Expected for local/demo use — production PostgreSQL is persistent |

Every failure above is observable via `GET /api/health`, which returns a scrubbed, one-line `error` field (no credentials/connection strings).
