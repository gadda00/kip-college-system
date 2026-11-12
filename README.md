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
A local SQLite demo database is created on demand — 3 campuses, 28 courses with full unit curricula, 12 students with fees/payments/results, staff, timetables, news and events. First run: `bun run db:push && bun run db:seed`. Re-seed anytime with the same command (it wipes and reseeds `db/custom.db`, which is git-ignored).

## Demo accounts
Shown on the login page when `NEXT_PUBLIC_DEMO_MODE=1` (see `.env.example`).

| Role | Email | Password |
|---|---|---|
| Admin | admin@kipskitui.com | Admin@123 |
| Lecturer | lecturer@kipskitui.com | Lecturer@123 |
| Student | student@kipskitui.com | Student@123 |

> **Production warning:** production deploys **no longer auto-seed the demo dataset** — a fresh production database starts empty so no publicly-known credentials exist next to real student data. Demo seeding only runs when the server-side `DEMO_MODE=1` flag is set (or outside production, e.g. local dev and preview deployments), and doing so in production logs a **loud server warning** at seed time. If you deliberately enable `DEMO_MODE=1` on a production deploy, treat it as a fire alarm: the passwords above are published in this README — **rotate all three demo passwords immediately** (Admin → Users, or via each user's portal profile page) before entering real student data, and never leave `DEMO_MODE=1` enabled once real records exist.

## Production (PostgreSQL)
Set `DATABASE_URL` to a PostgreSQL connection string (e.g. Prisma Postgres). The correct Prisma client is generated automatically from the URL (`scripts/prisma-generate.mjs`, run via `postinstall` and `build`). 

**Runtime auto-provisioning:** on the first request against a fresh database the app takes an advisory lock, creates all 22 tables (`IF NOT EXISTS`) and — only when demo seeding is enabled (`DEMO_MODE=1` or non-production `NODE_ENV`) — seeds the full demo dataset. No migration step is required (`src/lib/provision.ts`). Production databases start empty by default. Verify with `GET /api/health` → `{"ok":true}`.

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
| `bun run schema:check` | Drift guard: fails if `prisma/schema.prisma` and `prisma/schema.sqlite.prisma` disagree (see DEPLOYMENT.md) |
| `bun run db:push` / `db:seed` / `db:generate` | SQLite schema push / re-seed / regenerate client for the active DATABASE_URL |
| `DATABASE_URL="postgres://…" DEMO_MODE=1 bun run scripts/reseed-demo.ts` | **Refresh the live demo's content**: wipes + reseeds the remote Prisma Postgres (e.g. the Vercel-linked DB) with the latest `prisma/seed-data.ts` — use after content updates. Run `bun run db:generate` afterwards if you develop locally against SQLite |

## Documents
- **Proposal (PDF):** https://kip-college-system.vercel.app/downloads/KIP-College-System-Proposal.pdf
- **Presentation (PPTX):** https://kip-college-system.vercel.app/downloads/KIP-College-System-Presentation.pptx

## Notes
- Demo data: phone numbers (+254 703 710 879), fee figures and programme details are sample values **pending verification by the college owner**.
- Security: role-based access control on every API route, rate limiting, audit trail, secure cookies, Zod validation, origin checks.

### Production hardening
Beyond the baseline above, the platform now carries these hardening guarantees:

- **Headers:** CSP plus the full security-header set (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) enforced in production.
- **Abuse control:** per-IP rate limits (login, applications, contact, password change, AI, **fees/pay**) **plus a per-account login lockout** — 20 failed attempts locks the account for 15 minutes and writes an `AUTH_LOGIN_LOCKED` audit entry.
- **Password hygiene:** `mustChangePassword` is enforced **server-side** on every authenticated request (not just in the UI); new password hashes use **bcrypt cost 12**; admin-created students receive min-8 alphanumeric passwords they must rotate at first sign-in.
- **Atomicity:** payment confirm/reject is a single conditional `updateMany`; admissions enrolment is **one `$transaction`** (student + fees + orphan-user cleanup) with automatic `admissionNo`-collision retry; password change + session kill and profile writes are transactional too.
- **Academic history:** `Result` is now unique on **(student, unit, term)** — a resit adds a new row instead of overwriting history; course and unit deletion is **blocked** while admission or results history references them (FK `ON DELETE RESTRICT` + guards).
- **Applications:** `Application.reference` is a real **indexed unique column** (KIP/APP/YYYY/NNNNN) — searchable and exported as its own CSV column.
- **Query bounds:** every list endpoint is bounded (`?limit=` with hard caps); payments search runs in SQL; admin overview aggregates in SQL instead of materialising rows.
- **Responses:** API responses carry `Cache-Control: no-store`; the health endpoint no longer leaks database error text.
- **Money:** KES inputs are validated to **≤2 decimals** at every money-entry boundary, CSV exports print exact 2-dp, and session records are pruned hourly.
