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
