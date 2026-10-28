# Task 4 — API Agent Work Record

Agent: api-agent (Z.ai Code)
Scope: ALL backend API routes for KIP COLLEGE (no frontend / no page.tsx / no schema changes).

## Deliverables
- 49 route.ts files under src/app/api (auth 4, public 10, assistant 1, student 7, lecturer 5, admin 22).
- src/lib/api-helpers.ts (ok/fail/handle/readJson/nextAdmissionNo/generateCourseCode/gradeFor/gradePoints/currentTermLabel/uniqueReference/timeToMinutes/todayDow/nowMinutes/csvList/boolish)
- src/lib/fees.ts (computeBalance, computeBalances)
- src/lib/roles.ts (currentStudent, currentLecturer)
- src/lib/timetable.ts (timetableInclude + mapTimetableEntry)
- src/lib/results.ts (upsertResults shared by lecturer+admin)
- Type-only fix in src/lib/auth.ts toSafeUser param (resolves tsc error; no runtime change).
- Full API contract appended to /home/z/my-project/worklog.md (Task 4 section) — THE reference for Tasks 5-a/b/c.

## Key implementation decisions
- Uniform envelope { ok:true,data } / { ok:false,error } via handle() wrapper: HttpError→status, ZodError→400 first issue, Prisma P2002→409, P2025→404, P2003→400, else 500.
- All routes `export const dynamic = 'force-dynamic'`.
- Assistant: z-ai-web-dev-sdk server-only; system prompt (role 'assistant', first) embeds LIVE course/fee list fetched from db per request; history capped at 12; thinking disabled; fallback reply on SDK error; 20 req/min/IP in-memory rate limit → 429.
- Auto-grading A≥80/B≥65/C≥50/D≥40/E<40 remarks Excellent/Good/Credit/Pass/Fail; upsert on @@unique([studentId,unitId]).
- Accept-application transaction: user (temp pw Kip####), profile (auto admissionNo), 3 fee items (registration + tuition + exam @ currentTermLabel), app→ACCEPTED. Edge cases: existing STUDENT-without-profile user deleted; student-with-profile → 400; staff email → 400.
- nextAdmissionNo(): count+1 with collision retry loop (seed uses KIP/2023/0458-style numbers).
- currentTermLabel(): Jan–Apr T1 / May–Aug T2 / Sep–Dec T3 → "YYYY/YYYY+1 Tn".

## Incident found & fixed
- Dev server (running since BEFORE Task 3's prisma regeneration) held a stale @prisma/client in memory → db.campus undefined → 500 on first API hit. Fixed WITHOUT a second server: `touch next.config.ts` triggers Next's config-change server restart (same process/port). Documented in worklog for later agents.

## Test results (curl, live dev server :3000, cookie jars)
- PUBLIC: overview/courses(+q,+category)/courses[id](200,404)/campuses/news/news[id]/events/gallery all 200; apply 201 + duplicate 409 + bad phone/course 400; contact 201 + short 400.
- AUTH: bad creds 401, bad email 400, me null→200, login/logout/me cycles 200, password change full flow incl. 2nd-device session invalidation (me→null), old password 401, new 200.
- ASSISTANT: live-fee answer 200, multi-turn 200, off-topic steering 200, 18×400 invalid bodies, 21st request 429.
- STUDENT: dashboard/fees/results/timetable/materials/announcements 200; self-pay 201 (ref MPESA+8, balance 10500→10000); no-phone 400; negative amount 400; role guards 403/401.
- LECTURER: overview (6 units/2 courses/3 students), classes (DIP-EEE 1.x studentsCount 2, DIP-ICT 6.x count 1), class roster + results entry 2 students (82→A, 47→D), marks>100 400, not-my-unit 403, timetable 200.
- ADMIN: overview KPIs verified vs seed; students list/detail/patch + dup email 409; create student 201 (KIP/2026/0013); accept flow (tempPassword Kip2112, 3 feeItems, 18500 charged) + blocked re-review 400 + existing-student-email 400; reject 200; courses auto-code TFCC 201, dup 409, PATCH, delete-with-students 400, delete ok; units add/dup 409/delete; fees single 201 + bulk courseId 1 posted + XOR validation 400s; payments record 201 + dup reference 409; results worksheet + upsert (82→88); timetable CRUD + time validations; announcements/news/events/messages CRUD + status enum 400.
- CLEANUP: direct prisma script removed ALL test artifacts; counts restored exactly to seed (users 17, students 12/10 ACTIVE, feeItems 45, payments 24, results 52, applications 8/6 PENDING, courses 21, messages 3, announcements 5, news 4, events 4, timetable 17; Brian 84500/74000/10500).
- `bun run lint` CLEAN; `bunx tsc --noEmit` clean for src/ (template examples/ & skills/ folders have pre-existing errors only).
