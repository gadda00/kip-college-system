# Task 3 — Data Layer Agent (schema + auth + seed)

Task ID: 3
Agent: data-layer-agent (Z.ai Code)
Status: COMPLETE ✅
Scope: prisma/schema.prisma, src/lib/auth.ts, prisma/seed.ts, DB push + seed + verification. No API routes, no frontend.

## Artifacts
- `prisma/schema.prisma` — 18 models + Role enum (ADMIN/LECTURER/STUDENT), pushed to SQLite (db/custom.db, force-reset wiped old bookshop tables).
- `src/lib/auth.ts` — SESSION_COOKIE='kip_session', createSession/destroySession, getCurrentUser → SafeUser (role-aware nested profiles), requireUser, requireRole(...roles), HttpError{status,message}.
- `prisma/seed.ts` — full realistic Kenyan college seed; idempotent (wipes then re-creates). Run: `bun prisma/seed.ts` after `bun run db:push` (needs `--force-reset` if old tables persist).

## Verified seed counts (2026-10-26)
users 17 (1 ADMIN / 4 LECTURER / 12 STUDENT) · campuses 3 · courses 21 (KASNEB 5 / BUSINESS 7 / TECHNICAL 9; featured 5) · units 250 · feeItems 45 · payments 24 (all CONFIRMED) · results 52 (all published) · timetableEntries 17 · applications 8 (6 PENDING / 1 ACCEPTED / 1 REJECTED) · announcements 5 · newsPosts 4 · events 4 (all future-dated) · galleryItems 9 · testimonials 6 · contactMessages 3 · studyMaterials 8 · sessions 0.

## Demo accounts (bcrypt-verified)
- admin@kipcollege.ac.ke / Admin@123 — Alice Mwangi (ADMIN)
- lecturer@kipcollege.ac.ke / Lecturer@123 — Eng. David Kilonzo, KIP/STF/011, Electrical & ICT
- student@kipcollege.ac.ke / Student@123 — Brian Mutua, KIP/2023/0458, DIP-ICT @ MAIN, Y2 T6, charges 84,500 / paid 74,000 / balance 10,500
- mutune@kipcollege.ac.ke / Student@123 — Faith Mutune, KIP/2024/0121, CPA @ TOWN, Y1 T2, charges 46,200 / paid 12,000 / balance 34,200
- 10 supporting students share password Student@123 (emails @students.kipcollege.ac.ke); 3 extra lecturers share Lecturer@123.

## Key decisions Task 4 must know
- Grade scale: A≥80, B 65–79, C 50–64, D 40–49, E<40; remarks Distinction/Credit/Pass/Fail.
- `Result` has `@@unique([studentId, unitId])` → use prisma upsert for batch results entry.
- `Unit` has `@@unique([courseId, code])`; unit codes follow `{COURSECODE}-{stage}.{n}` (e.g. DIP-ICT-4.2).
- Term label format: `"2025/2026 T1"`. Brian's current stage 6 ↔ term "2024/2025 T3"; Faith's Level II ↔ "2024/2025 T2".
- Full worklog entry with complete field lists: see /home/z/my-project/worklog.md → "Task ID: 3" section.
