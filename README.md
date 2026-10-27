# KIP College — Website & College Management System

A complete, production-ready digital platform for **KIP College (Kitui Institute of Professionals)** — a tertiary learning institution in Kitui Town, Kenya with three campuses, offering Technical, Business and KASNEB courses.

One platform, four experiences: a modern **public website**, a self-service **student portal**, a **lecturer workspace**, and a full **administrative console** — with AI assistants embedded throughout.

![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)

---

## Deploy in one click

| Platform | Button | What you get |
|---|---|---|
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgadda00%2Fkip-college-system&env=DATABASE_URL&project-name=kip-college&repository-name=kip-college) | Demo deployment (SQLite in `/tmp` — see note below) |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/gadda00/kip-college-system) | Demo deployment (same demo mode) |

> **Demo mode on serverless:** the site renders and all accounts work, but data writes (logins, new applications) live in the function's ephemeral `/tmp` storage and reset on cold starts. For a persistent production deployment, follow the 10-minute guide in [DEPLOYMENT.md](./DEPLOYMENT.md) (Neon PostgreSQL, free tier).

## Features

### Public website
- Full catalogue of 28 programmes (Technical / Business / KASNEB) with fees, durations, intakes and entry requirements
- Online admissions applications flowing straight into the admin console
- News & events, downloadable resources, FAQ, campus profiles and contact pages
- 24/7 AI assistant answering course, fee and campus questions from live data

### Student portal
- Personal dashboard: course, year, today's classes, fee balance, results summary
- Fee payments (M-PESA / bank) with instant balance updates
- Official printable fee statements, academic transcripts and student ID cards
- Weekly timetable and lecturer-uploaded learning materials
- AI Study Buddy that knows the student's actual units and syllabus

### Lecturer workspace
- Class rosters and today's teaching schedule
- Guided marks entry with automatic grading
- Class analytics: averages, pass rates and grade distribution charts

### Admin console
- Live KPIs and interactive charts: enrolment, fee collection, applications funnel, payment trends
- Student records management, admissions workflow, payments ledger
- Announcements to students, staff or everyone
- One-click CSV exports (students, payments, applications, results, outstanding balances)
- Student ID card printing

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@kipskitui.com` | `Admin@123` |
| Lecturer | `lecturer@kipskitui.com` | `Lecturer@123` |
| Student | `student@kipskitui.com` | `Student@123` |

## Quick start (local)

```bash
# 1. Install dependencies
bun install          # or: npm install

# 2. Configure the database
cp .env.example .env
# → edit .env and set DATABASE_URL to the ABSOLUTE path of db/custom.db in your clone

# 3. Generate the Prisma client
bunx prisma generate

# 4. Start the dev server
bun run dev          # or: npm run dev
```

Open http://localhost:3000 and sign in with any demo account above. The repository ships with a fully seeded SQLite database (`db/custom.db`) — 17 users, 12 students, 28 courses, fee items, payments, results and announcements — so every feature works immediately.

To reseed from scratch:

```bash
bun run db:push       # recreate the schema
bun prisma/seed.ts    # reload demo data
```

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript 5, Tailwind CSS 4, shadcn/ui |
| Backend | Next.js API routes (server-side only) |
| Database | Prisma ORM — SQLite (demo) / PostgreSQL (production) |
| Auth | Session cookies, bcrypt hashing, role-based access (Admin / Lecturer / Student) |
| AI | Server-side LLM SDK (website assistant + student Study Buddy) |
| Charts & reporting | Recharts dashboards, CSV exports, print-ready documents |

## Project structure

```
prisma/            Schema + demo seed (28 courses, 3 campuses, 17 users)
db/                SQLite database file (pre-seeded demo data)
src/app/           Single-page app shell + all API routes
src/components/    UI components (public site, portals, admin console)
src/lib/           Auth, database client, API helpers
public/images/     Brand imagery
```

## Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) — Vercel, Netlify and production PostgreSQL guides
- [LICENSE](./LICENSE) — MIT

---

Built for KIP College — *Training for Excellence.*
