# KIP College — Website & College Management System

A complete, production-ready digital platform for **KIP College (Kitui Institute of Professionals)** — a tertiary learning institution in Kitui Town, Kenya with three campuses, offering Technical, Business and KASNEB courses.

One platform, four experiences: a modern **public website**, a self-service **student portal**, a **lecturer workspace**, and a full **administrative console** — with AI assistants embedded throughout.

![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)
![Tests](https://img.shields.io/badge/tests-bun%20test-14151A)

> **Engineering standards:** strict TypeScript (`tsc --noEmit` clean, no suppressed errors), ESLint clean, React strict mode, server-side authorization on every protected route, Zod-validated mutations, rate limiting, audit logging, and an automated test suite (unit + end-to-end smoke). See [docs/product-audit.md](./docs/product-audit.md) for the full architecture map, risk register and roadmap.

---

## Deploy in one click

| Platform | Button | What you get |
|---|---|---|
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgadda00%2Fkip-college-system&project-name=kip-college&repository-name=kip-college) | Demo deployment — **zero configuration** (seeded SQLite auto-bootstraps in `/tmp`) |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/gadda00/kip-college-system) | Demo deployment (same demo mode) |

> **Demo mode on serverless:** the site renders and all accounts work, but data writes (logins, new applications) live in the function's ephemeral `/tmp` storage and reset on cold starts. For a persistent production deployment, follow the 10-minute guide in [DEPLOYMENT.md](./DEPLOYMENT.md) (Neon PostgreSQL, free tier). Set `NEXT_PUBLIC_DEMO_MODE=1` in the hosting dashboard to show the demo login helper.

## Features

### Public website
- Full catalogue of 28 programmes (Technical / Business / KASNEB) with search + category filters, fees, durations, intakes and entry requirements
- Multi-step online admissions application with Zod validation, duplicate prevention, reference number and confirmation screen
- News & events, downloadable resources, FAQ, campus profiles and contact pages
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

## Quick start (local)

**Package manager: [Bun](https://bun.sh)** — the single documented workflow. (`npm`/`pnpm` also work; use the matching `npx` instead of `bunx`.)

```bash
# 1. Install dependencies
bun install

# 2. Configure the environment
cp .env.example .env
#    → DATABASE_URL defaults to the bundled seeded SQLite database.
#    → set NEXT_PUBLIC_DEMO_MODE=1 to show demo credentials on the login page.

# 3. Generate the Prisma client
bunx prisma generate

# 4. Start the dev server
bun run dev            # http://localhost:3000
```

The repository ships with a fully seeded SQLite database (`db/custom.db`) — 17 users, 12 students, 28 courses, fee items, payments, results and announcements — so every feature works immediately.

### Verify your install (quality gates)

```bash
bun run lint           # ESLint — must be clean
bun run typecheck      # tsc --noEmit, strict — must be clean
bun run test           # unit tests (money math, grading, rate limiting)
bun run test:smoke     # end-to-end smoke vs a running dev server (24 checks)
bun run build          # production build (or see DEPLOYMENT.md for serverless)
```

> The smoke suite logs in as all three roles and runs ~5 auth calls — if you run it repeatedly within 15 minutes, restart the dev server first (login rate limiting is in-memory: 10 attempts / 15 min / IP).

### Reseed from scratch

```bash
bun run db:push        # recreate the schema
bun prisma/seed.ts     # reload demo data
```

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | SQLite path (demo) or PostgreSQL URL (production). Unset on Vercel/Netlify = automatic `/tmp` demo bootstrap. |
| `NEXT_PUBLIC_DEMO_MODE` | no | `1` shows the demo-account helper on the login screen. Default `0`. |

## Testing

- **Unit tests** (`tests/*.test.ts`, `bun test`): money arithmetic (integer cents), grading scale boundaries, GPA mapping, timetable time parsing, rate-limiter sliding window.
- **Integration smoke** (`scripts/smoke-test.ts`, `bun run test:smoke`): runs against the live dev server and verifies — health endpoint, public data, authentication (success / wrong password / invalid payload / HttpOnly+SameSite cookie flags), role-based authorization (401 anonymous, 403 cross-role), the admissions application flow (validation, reference number, duplicate rejection), cents-exact fee-balance math, the **results draft→publish visibility workflow**, and login rate limiting (429 after 10 failures).
- All state mutated by the smoke suite is restored automatically; it is safe to re-run.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript 5 (strict), Tailwind CSS 4, shadcn/ui |
| Backend | Next.js API routes (server-side only) |
| Database | Prisma ORM — SQLite (demo) / PostgreSQL (production) |
| Auth | HTTP-only session cookies (`secure` in production), bcrypt hashing, server-side role guards, expired-session cleanup, origin protection on mutations |
| Validation | Zod schemas on every public + authenticated mutation |
| Security | rate limiting (login/apply/contact/AI), audit log, security headers, `EducationalOrganization` structured data, sitemap + robots |
| AI | Server-side LLM SDK (website assistant + student Study Buddy), grounded in DB content, rate-limited, with graceful fallback |
| Charts & reporting | Recharts dashboards, CSV exports, print-ready documents |
| Money | Integer-cents arithmetic (`src/lib/money.ts`) — no floating-point drift |

## Project structure

```
prisma/            Schema + demo seed (28 courses, 3 campuses, 17 users)
db/                SQLite database file (pre-seeded demo data)
docs/              product-audit.md — architecture, risks, roadmap
scripts/           smoke-test.ts — end-to-end integration suite
tests/             unit tests (money, grading, rate limiting)
src/app/           Single-page app shell, health endpoint + all API routes
src/components/kip Public site, student portal, lecturer workspace, admin console
src/lib/           auth, db, money, rate-limit, audit, fees, results, roles
public/            Brand imagery, OG share image
```

## Documentation

- [docs/product-audit.md](./docs/product-audit.md) — full product audit: architecture, role capabilities, security posture, risk register, owner-verification checklist, roadmap
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Vercel, Netlify and production PostgreSQL guides
- [LICENSE](./LICENSE) — MIT

---

Built for KIP College — *Training for Excellence.*
