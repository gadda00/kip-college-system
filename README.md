# KIP College — Website & College Management System

A complete, production-ready digital platform for **KIP College (Kitui Institute of Professionals)** — a tertiary learning institution in Kitui Town, Kenya with three campuses, offering Technical, Business and KASNEB courses.

One platform, four experiences: a modern **public website**, a self-service **student portal**, a **lecturer workspace**, and a full **administrative console** — with AI assistants embedded throughout.

![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)
![Tests](https://img.shields.io/badge/tests-bun%20test-14151A)

> **Engineering standards:** strict TypeScript (`tsc --noEmit` clean, no suppressed errors), ESLint clean, React strict mode, server-side authorization on every protected route, Zod-validated mutations, rate limiting, audit logging, and an automated test suite (unit + integration smoke + real-PostgreSQL E2E). See [docs/product-audit.md](./docs/product-audit.md) for the full architecture map, risk register and roadmap.

---

## Deploy in one click

| Platform | Button | What you need |
|---|---|---|
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgadda00%2Fkip-college-system&project-name=kip-college&repository-name=kip-college) | One env var: `DATABASE_URL` — a PostgreSQL connection string (Prisma Postgres, Neon, Supabase…). The **first request after deploy auto-creates all 22 tables and seeds the demo dataset** — no migration step. |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/gadda00/kip-college-system) | Same as Vercel — set `DATABASE_URL` to a PostgreSQL URL. |

Full walk-through (including the health check to watch for) in [DEPLOYMENT.md](./DEPLOYMENT.md).

## Features

### Public website
- Full catalogue of 28 programmes (Technical / Business / KASNEB) with search + category filters, fees, durations, intakes and entry requirements
- Multi-step online admissions application with Zod validation, duplicate prevention, reference number and confirmation screen
- News & events, downloadable resources (system proposal PDF + presentation), FAQ, campus profiles and contact pages
- 24/7 AI assistant answering course, fee and campus questions **grounded in live database content** (never invents fees; hands off to human admissions)

### Student portal
- Personal "today" dashboard: course, year, term, classes, deadlines, announcements, fee balance, results summary
- Fee statement + payments (M-PESA / bank) with cents-exact balances and instant updates
- Official printable fee statements, academic transcripts and student ID cards
- Weekly timetable and lecturer-uploaded learning materials
- AI Study Buddy that **only** uses the authenticated student's own units and materials

### Lecturer workspace
- Class rosters and today's teaching schedule
- Marks entry with validation, **draft saves and an explicit publish step** — students never see results until publication
- Class analytics: averages, pass rates and grade distribution charts
- Server-side authorization: lecturers can only touch units they teach

### Admin console
- Live KPIs and interactive charts: enrolment, fee collection, applications funnel, payment trends
- Admissions queue → review → accept (auto-creates student account, admission number, term fee items) or reject, with notes
- Student records management, payments ledger, results moderation & publication
- Announcements to students, staff or everyone
- One-click CSV exports (students, payments, applications, results, outstanding balances) — all export actions audit-logged

## Demo accounts

Only shown in-app when `NEXT_PUBLIC_DEMO_MODE=1` (never in production).

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@kipskitui.com` | `Admin@123` |
| Lecturer | `lecturer@kipskitui.com` | `Lecturer@123` |
| Student | `student@kipskitui.com` | `Student@123` |

These accounts are seeded automatically — on the bundled local SQLite database *and* on a freshly provisioned production PostgreSQL database.

## Quick start (local)

**Package manager: [Bun](https://bun.sh)** — the single documented workflow. (`npm`/`pnpm` also work; use the matching `npx` instead of `bunx`.)

```bash
# 1. Configure the environment FIRST (so postinstall picks the right Prisma client)
cp .env.example .env        # → DATABASE_URL=file:./db/custom.db (SQLite, zero-config)

# 2. Install dependencies (postinstall generates the SQLite Prisma client)
bun install
#    (installed before creating .env? run `bun run db:generate` once afterwards)

# 3. Start the dev server
bun run dev                 # http://localhost:3000
```

Local development runs on **SQLite with zero configuration**: the repository ships a fully seeded database (`db/custom.db`) — 17 users, 12 students, 28 courses, 321 units, fee items, payments, results and announcements — so every feature works immediately. No database server, no migrations, no seeding step.

## Dual-database architecture

| Environment | Database | Schema | Setup |
|---|---|---|---|
| Local development | SQLite (file `db/custom.db`) | `prisma/schema.sqlite.prisma` | None — bundled & seeded |
| Production (Vercel etc.) | PostgreSQL (incl. Prisma Postgres `prisma://`) | `prisma/schema.prisma` | Set `DATABASE_URL`, deploy — done |

- **Client generation** — `scripts/prisma-generate.mjs` inspects `DATABASE_URL` (`file:` → SQLite schema, `postgres://` / `postgresql://` / `prisma://` → PostgreSQL schema) and generates the matching Prisma client. It runs automatically on `postinstall` and before every `build`.
- **Runtime auto-provisioning** — on PostgreSQL, the very first database request triggers `ensureProvisioned()` (`src/lib/provision.ts`): inside one transaction it takes a transaction-scoped advisory lock (safe for concurrent serverless cold starts), creates all **22 tables** with raw DDL, and seeds the full demo dataset. Every model operation goes through an extended client that awaits this one-time step (`src/lib/db.ts`). **There is no deploy-time migration step** — point `DATABASE_URL` at an empty Postgres database and the app provisions itself.
- **Idempotent** — provisioning is guarded and re-entrant; a second call is a no-op, and concurrent lambdas serialize on the advisory lock.

### Scripts

| Command | Purpose |
|---|---|
| `bun run dev` | Dev server on port 3000 (SQLite local by default) |
| `bun run build` | Production build (regenerates the Prisma client for your `DATABASE_URL` first) |
| `bun run build:standalone` | Self-hosted build → `.next/standalone/server.js` |
| `bun run start` | Start the production build on port 3000 |
| `bun run start:standalone` | Start the standalone build |
| `bun run lint` | ESLint — must be clean |
| `bun run typecheck` | `tsc --noEmit`, strict — must be clean |
| `bun run test` | Unit tests (money math, grading, GPA, rate limiting) |
| `bun run test:smoke` | 24 integration checks against a running dev server |
| `bun run db:push` | (Re)create the SQLite schema locally |
| `bun run db:seed` | Reload demo data into SQLite |
| `bun run db:generate` | Regenerate the Prisma client for the current `DATABASE_URL` |
| `bun run db:migrate` | Prisma migrate dev against the PostgreSQL schema (optional — runtime auto-provisioning replaces this) |
| `bun run db:reset` | Prisma migrate reset against the PostgreSQL schema (optional) |

### Verify your install (quality gates)

```bash
bun run lint           # ESLint — must be clean
bun run typecheck      # tsc --noEmit, strict — must be clean
bun run test           # unit tests (money math, grading, rate limiting)
bun run test:smoke     # end-to-end smoke vs a running dev server (24 checks)
bash scripts/pg-e2e-run.sh   # full PostgreSQL E2E: boots an embedded PG,
                             # exercises auto-provisioning + verifies the dataset (30 checks)
```

> The smoke suite logs in as all three roles and runs ~5 auth calls — if you run it repeatedly within 15 minutes, restart the dev server first (login rate limiting is in-memory: 10 attempts / 15 min / IP).

### Reseed local SQLite from scratch

```bash
bun run db:push        # recreate the schema
bun run db:seed        # reload demo data
```

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | `file:./db/custom.db` for local SQLite; a `postgresql://` / `prisma://` URL for production. **On serverless hosts it must be set** — without it the app falls back to the bundled SQLite file, which is read-only there (health returns 503). |
| `NEXT_PUBLIC_DEMO_MODE` | no | `1` shows the demo-account helper on the login screen. Default `0`. |

## Testing

- **Unit tests** (`tests/*.test.ts`, `bun test`): money arithmetic (integer cents), grading scale boundaries, GPA mapping, timetable time parsing, rate-limiter sliding window.
- **Integration smoke** (`scripts/smoke-test.ts`, `bun run test:smoke`): runs against the live dev server and verifies — health endpoint, public data, authentication (success / wrong password / invalid payload / HttpOnly+SameSite cookie flags), role-based authorization (401 anonymous, 403 cross-role), the admissions application flow (validation, reference number, duplicate rejection), cents-exact fee-balance math, the **results draft→publish visibility workflow**, and login rate limiting (429 after 10 failures).
- **PostgreSQL E2E** (`scripts/pg-e2e-run.sh`): boots a user-space embedded PostgreSQL, generates the production client, runs the *real* `ensureProvisioned()` code path, and verifies 30 checks — 20 model counts, the three demo logins (bcrypt), demo-student fee math (KES 84,500 charged / 74,000 paid), published results, download URLs, and idempotent re-provisioning. Afterwards it restores the local SQLite client and restarts the dev server.
- All state mutated by the smoke suite is restored automatically; it is safe to re-run. Both suites are safe to re-run.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router) with a hash-routed single-page app (`src/components/kip`), TypeScript 5 (strict), Tailwind CSS 4, shadcn/ui |
| Backend | Next.js API routes (server-side only) |
| Database | Prisma ORM — SQLite locally (zero-config) / PostgreSQL in production (runtime auto-provisioned: 22 tables + seed on first request) |
| Auth | HTTP-only session cookies (`secure` in production), bcrypt hashing, server-side role guards, expired-session cleanup, origin protection on mutations |
| Validation | Zod schemas on every public + authenticated mutation |
| Security | rate limiting (login/apply/contact/AI), audit log, security headers, `EducationalOrganization` structured data, sitemap + robots |
| AI | Server-side LLM SDK (website assistant + student Study Buddy), grounded in DB content, rate-limited, with graceful fallback |
| Charts & reporting | Recharts dashboards, CSV exports, print-ready documents |
| Money | Integer-cents arithmetic (`src/lib/money.ts`) — no floating-point drift |

## Project structure

```
prisma/             Dual schemas — schema.prisma (PostgreSQL) + schema.sqlite.prisma (SQLite),
                   seed.ts + seed-data.ts (demo dataset: 28 courses, 3 campuses, 17 users)
db/                 SQLite database file (pre-seeded demo data for local dev)
docs/               product-audit.md — architecture, risks, roadmap
scripts/            prisma-generate.mjs (dual-schema client picker) · smoke-test.ts (24 integration
                   checks) · pg-e2e-run.sh + pg-e2e-test.ts (embedded-PostgreSQL E2E)
tests/              unit tests (money, grading, rate limiting)
src/app/           Single-page app shell, health endpoint + all API routes
src/components/kip  Public site, student portal, lecturer workspace, admin console
src/lib/           auth, db (auto-provisioning-aware client), provision (runtime DDL + seed),
                   audit, money, rate-limit, fees, results, roles
public/downloads/  System proposal PDF + presentation PPTX (served at /downloads/**)
proposal-build/    Regeneration sources for the two deliverables (see its README)
public/            Brand imagery, OG share image
```

## Deliverables

Client-facing documents, served live from this deployment:

- **System Proposal (PDF, 11 pages)** — <https://kip-college-system.vercel.app/downloads/KIP-College-System-Proposal.pdf>
- **Presentation (PPTX, 14 slides)** — <https://kip-college-system.vercel.app/downloads/KIP-College-System-Presentation.pptx>

Both are also listed in the site's Downloads section. Regeneration sources live in [`proposal-build/`](./proposal-build/README.md).

## Documentation

- [docs/product-audit.md](./docs/product-audit.md) — full product audit: architecture, role capabilities, security posture, risk register, owner-verification checklist, roadmap
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Vercel / Netlify / self-hosting guides, backups, troubleshooting
- [LICENSE](./LICENSE) — MIT

> **Facts pending owner verification:** the phone number +254 703 710 879 and all fee figures shown in the proposal, presentation and platform content are carried as *to be confirmed by the college owner*. See the owner-verification checklist in [docs/product-audit.md](./docs/product-audit.md) before publishing externally.

---

Built for KIP College — *Training for Excellence.*
