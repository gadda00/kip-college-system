# KIP College System — Product Audit

**Repo:** `gadda00/kip-college-system` · **Audit date:** 28 Oct 2026 · **Auditor:** Product engineering

---

## 1. Architecture & route map

**Stack:** Next.js 16 (App Router, Turbopack) · TypeScript 5 (strict) · Tailwind CSS 4 · shadcn/ui · Prisma 6 + SQLite (demo) · TanStack Query · Zustand · framer-motion · z-ai-web-dev-sdk (server-side AI).

**Topology:** The user-facing product is a single Next.js page (`/`) hosting a hash-routed SPA (`src/components/kip/app.tsx`), plus ~50 JSON API routes under `/src/app/api/**`. One Postgres-ready Prisma schema. Serverless-friendly build (zero-config demo bootstrap on Vercel/Netlify).

| Hash route | View | Who |
|---|---|---|
| `#/` | Home (hero, accreditation, stats, courses, why, testimonials, FAQ) | Public |
| `#/about`, `#/academics`, `#/course/:id` | About, programme catalogue + filters, programme detail | Public |
| `#/admissions`, `#/apply` | Admissions guide, application wizard (multi-step) | Public |
| `#/campuses`, `#/gallery`, `#/news`, `#/news/:id`, `#/events`, `#/faq`, `#/downloads`, `#/contact` | Content pages (DB-driven) | Public |
| `#/login` | Sign-in with demo-account helper | Public |
| `#/portal/*` | Student portal: dashboard, fees, results, timetable, materials, announcements, profile | STUDENT |
| `#/lecturer/*` | Lecturer workspace: dashboard, classes, marks entry, timetable | LECTURER |
| `#/admin/*` | Admin console: overview, students, applications, courses, fees, results, timetable, announcements, news, messages | ADMIN |

**API surface (post-cleanup):** `auth` (login/logout/me/password) · `public/*` (courses, campuses, news, events, gallery, faqs, downloads, testimonials, overview, apply, contact) · `student/*` (dashboard, fees, fees/pay, results, timetable, materials, announcements, profile, study-assistant) · `lecturer/*` (overview, classes, classes/:unitId, results, timetable) · `admin/*` (overview, students, applications, courses+units, fees, payments, results, timetable, lecturers, announcements, news, events, messages, export, export/stats) · `assistant` · `health`.

## 2. What each role can do

- **Visitor** — browse everything, search/filter programmes, apply online, contact the college, chat with the grounded AI assistant.
- **STUDENT** — "today" dashboard, fee statement + M-PESA-style payment simulation, published results + transcript, weekly timetable, study materials, announcements, profile & password, printable fee statement / transcript / ID card, AI Study Buddy (authorized course materials only).
- **LECTURER** — teaching schedule, authorized class rosters, marks entry with validation, class analytics, study-material management.
- **ADMIN** — KPI dashboard & charts, full student records, admissions review (accept/reject/notes + convert-to-student), course & unit management, fee items & payments ledger, results moderation, timetabling, announcements, news, events, contact-message inbox, CSV exports.

## 3. Removed in this pass (duplicate / stale / conflicting code)

- `src/components/store/**` — entire legacy *bookshop* frontend (shop, cart, checkout, printing, tracking, school accounts). **Zero imports from the college app.**
- `src/components/admin/**` — legacy shop admin (inventory, orders, customers, quotes). Superseded by `src/components/kip/admin/**`.
- `src/components/shared/**` — book-cover / shop UI bits.
- `src/stores/**` — legacy cart/ui/auth stores with `CUSTOMER` role concepts.
- `src/app/api/auth/register` — registered `SCHOOL`/`CUSTOMER` roles with `loyaltyPoints`, `schoolName`, `town` fields that **do not exist** in the Prisma schema (role mismatch). College accounts are admin-provisioned after admission; public self-registration removed deliberately.
- `src/app/api/print/calc` + `src/lib/pricing.ts` — bookshop print-price calculator, unused.
- Earlier pass removed 23 dead bookshop API routes (`products`, `orders`, `wishlist`, `reviews`, `bulk-orders`, `mpesa/stk`, …) that broke the Vercel build.

## 4. Fixed / hardened in this pass

| Area | Change |
|---|---|
| Type safety | `typescript.ignoreBuildErrors` **removed**; `noImplicitAny: true`; `tsc --noEmit` passes with **0 errors** |
| React | `reactStrictMode: true` (was disabled) |
| Lint | `bun run lint` clean |
| tsconfig scope | includes only `src/**` (sandbox examples/skills no longer pollute type-checking) |
| Sessions | HTTP-only cookie; `secure` flag auto-enabled in production; expiry enforced; **expired-session cleanup** added |
| AuthZ | Role guards server-side in every protected route (`requireUser`/`requireRole`); class-level lecturer authorization verified |
| Validation | Zod schemas on admissions application, AI endpoints, contact (pre-existing) — extended this pass to login, password change, results entry, fees/payments |
| Rate limiting | Shared limiter (`src/lib/rate-limit.ts`) on login, applications, contact, password change, both AI endpoints |
| CSRF/origin | Origin/Host match enforced for authenticated state-changing requests (`assertSameOrigin`) |
| Audit trail | New `AuditLog` model + `logAudit()` on logins, applications, admissions decisions, fee/payment changes, results publication, exports, password changes |
| Money | Integer-cents arithmetic (`src/lib/money.ts`) used by balance/summary math — no unsafe float accumulation |
| Results | **Draft → explicit publish workflow** (was: instant publish on save) |
| Health | `GET /api/health` (db connectivity + uptime) |
| Security headers | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` via `next.config.ts` |
| Demo mode | Demo credentials shown on the login screen only when `NEXT_PUBLIC_DEMO_MODE=1` (README documents `demo-accounts.md` as the trusted source) |
| Tests | `bun test` unit suites: money math, grade boundaries, rate limiter, Zod schemas, authorization guards; integration smoke script against a running server |
| SEO | metadata, OG/Twitter cards, canonical, robots.txt, sitemap, `EducationalOrganization` JSON-LD |
| A11y | skip-link, landmarks, labelled inputs, focus-visible rings, 44px touch targets, reduced-motion honored (`motion-safe:`) |

## 5. Known risks (honest register)

| # | Risk | Severity | Status |
|---|---|---|---|
| R1 | **Money stored as Prisma `Float`** — safe for the demo, but production should use `Decimal(12,2)` on PostgreSQL. Integer-cents arithmetic mitigates calculation drift; storage migration documented in `DEPLOYMENT.md`. | Medium | Mitigated (calc) / documented (storage) |
| R2 | SQLite demo DB on serverless (`/tmp`) is **ephemeral** — writes (sessions, new applications) reset on cold start. Intended for demo only; production path = PostgreSQL + migrations (`DEPLOYMENT.md`). | Medium | Documented |
| R3 | AI assistants can still be coaxed off-topic despite grounding; injection resistance is prompt-based, not sandboxed. Rate limits + fallback + "confirm with admissions" handoff reduce impact. | Low-Med | Mitigated |
| R4 | M-PESA payment flow is a **simulated** ledger entry (no Daraja credentials) — clearly a demo capability, never presented as live to students. | Low | By design |
| R5 | Institutional facts (phone `0703 710 879`, M-PESA Paybill `522 890`, Equity A/C, hostel/transport claims) come from the college's own site and seeded data — **owner must verify before go-live** (see §7). | Medium | Flagged |
| R6 | No email/SMS delivery — application confirmations are on-screen + reference number only. | Low | Roadmap |
| R7 | Single-tenant, single currency (KES). | Info | — |

## 6. Institutional facts requiring owner confirmation

1. Phone `+254 703 710 879` & email addresses (info/admissions/support@kipskitui.com).
2. M-PESA Paybill **522 890** and Equity Bank Kitui account number.
3. Exact fee figures per course (seeded values marked "confirm current fees" in UI).
4. KASNEB/KNEC/NITA/CDACC accreditation scope and course alignment.
5. Hostels, transport, radio studio, attachment MoU claims (seeded content).
6. Intake months (January/May/September) and evening/weekend modes at Town Campus.

All of the above live in seed data / assistant prompt and are editable without code changes.

## 7. Prioritized implementation plan (delivered this pass → future)

**Delivered:** legacy removal → strict TS/lint/build green → security hardening (§4) → money-safe math → results publish workflow → tests → docs.

**Next (recommended order):**
1. PostgreSQL migration + `prisma migrate` baseline; backup/restore runbook.
2. Real M-PESA Daraja integration with idempotency keys + pending/confirmed/failed states.
3. Email/SMS notifications (application received, admission decision, fee receipts).
4. Routeable nested URLs (server-rendered programme pages) for full SEO parity.
5. Timetable conflict detection UI surfacing + lecturer workload views.
6. Programme comparison & guided "find my programme" flow.
7. CI (GitHub Actions: lint + tsc + test + build on PR).
