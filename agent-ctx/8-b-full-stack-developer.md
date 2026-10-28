# Task 8-b — full-stack-developer subagent — Student & lecturer portal features

Task: Student ID card, printable fee statement + academic transcript, AI study assistant (Study Buddy), lecturer class analytics. (Read this alongside the Task 8-b section in `/home/z/my-project/worklog.md` — the worklog is authoritative for verification evidence.)

## Scope respected
- Owned: `src/components/kip/portal/**`, `src/app/api/student/**`, `src/app/api/lecturer/**`, plus a clearly-marked print-CSS append in `src/app/globals.css` (needed for @media print isolation; not on the do-not-touch list).
- Not touched: site/**, admin/**, app.tsx (no change needed — `#/portal/id-card` flows through the existing `sub` param), components/** shared, api/public|admin|auth|assistant, prisma/seed.ts, src/lib/**.

## Files created
| File | Purpose |
|---|---|
| `src/components/kip/portal/print-doc.tsx` | `usePrintDoc(render)` hook: mounts the doc in a body-level `createPortal` (`.kip-print-portal`, DIRECT `<body>` child), calls `window.print()` after 150ms, unmounts on `afterprint` (+120s safety). |
| `src/components/kip/portal/student/views/print-docs.tsx` | `PrintSheet`, `DocLetterhead`, `DocStudentBlock`, `DocFooter`, `buildStatementRows` (+`StatementRow` type), `FeeStatementDoc`, `TranscriptDoc`. Fixed print-safe navy/royal/sky colours. |
| `src/components/kip/portal/student/views/id-card-view.tsx` | `IdCardView` (#/portal/id-card) + `StudentIdCard` (navy→royal gradient, crest, initials photo, ACTIVE green badge, valid-through, CSS barcode + motto). |
| `src/components/kip/portal/student/views/study-buddy.tsx` | `StudyBuddy({unitNames})` inline collapsible AI chat card (multi-turn client state, markdown replies, typing dots, suggested prompts). |
| `src/app/api/student/study-assistant/route.ts` | POST, STUDENT-guarded (`currentStudent()`), 30 req/min/IP rate limit, zod, DB-aware system prompt (course/level/campus/year-term + current-stage units + study-material titles + examBody), ZAI server-side, fallback reply. Mirrors `api/assistant/route.ts` structure. |

## Files modified
| File | Change |
|---|---|
| `src/app/globals.css` | `@page { margin: 10mm }` + `@media print { body > *:not(.kip-print-portal) { display:none !important } … }` print isolation block. |
| `src/components/kip/portal/student/StudentPortal.tsx` | Nav item `{key:'id-card', label:'ID Card', icon:IdCard, to:'/portal/id-card'}` + `<IdCardView/>` render (SUB_VIEWS derives automatically). |
| `student/views/fees-view.tsx` | Profile query; "Print / download statement" button → `FeeStatementDoc` print; statement-row builder now shared from print-docs.tsx (screen table newest-first via `.reverse()`). |
| `student/views/results-view.tsx` | Profile query; "Print academic transcript" button → `TranscriptDoc` print. |
| `student/views/learning-view.tsx` | `<StudyBuddy unitNames={…}/>` appended after Study Materials. |
| `src/components/kip/portal/types.ts` | `LecturerClassAnalytics` type; `LecturerClassDetail.analytics`. |
| `src/app/api/lecturer/classes/[unitId]/route.ts` | `analytics` block: totalStudents, withResults, average/highest/lowest, passRate (≥50), gradeCounts A–E. |
| `lecturer/views/class-detail-view.tsx` | `ClassAnalytics` card: progress (x/y results), 4 KPI tiles, recharts BarChart (brand `#1a4fd0`, currentColor axes, navy tooltip, aria summary), EmptyState when 0 results. |

## Print isolation pattern (reusable for future printables)
```
const { print, printDoc } = usePrintDoc(() => <MyDoc data={data} />)
<Button onClick={print}>Print</Button>
{printDoc}
```
CSS guarantees ONLY the portal prints — validated by generating actual PDFs (`agent-browser pdf`) whose text contains just the document.

## Verification highlights (full evidence in worklog Task 8-b)
- **AI Study Buddy LIVE**: TCP/UDP question → real reply in ~3s ("…core networking concept from your Data Communication & Networks unit", greets Brian); follow-up quiz question → E-Commerce quiz. dev.log: `POST /api/student/study-assistant 200 ×3 (2.6–3.1s)`; unauth → 401.
- **Print PDFs**: ID card only-card output; fee statement (84,500/74,000/10,500 totals + Paybill 522 890 footer); transcript (20 units, 71.3%, GPA 3.00, B — Good, Examiner: KNEC).
- **Analytics**: E-Commerce class 78.0% avg / 100% pass / 1/1 results / brand-blue bar chart (test result deleted afterwards; DB back to seed: 52 results, 12 students, 17 users).
- Mobile 375px no-overflow; dark-mode fixed navy card; lint + `tsc --noEmit` clean; only pre-existing header hydration warnings in agent-browser errors.
- Screenshots in `/home/z/my-project/screenshots/` (task8b-*).

## Gotchas for future agents
1. `agent-browser set media print` did NOT emulate print media (matchMedia('print') stayed false) — use `agent-browser pdf` to test real print rendering instead.
2. The print portal MUST be a direct `<body>` child (`createPortal(..., document.body)`), otherwise `body > *:not(.kip-print-portal)` cannot protect it from being hidden with the app root.
3. `agent-browser click @ref` was unreliable on React buttons in this app — prefer `eval` DOM `.click()` (also noted by earlier agents).
4. Mock `window.print` via eval (`window.print = () => {...}`) to test the print trigger without dialogs; afterprint never fires for the mock, so reload to clear the portal.
5. Result is `@@unique([studentId, unitId])` — one result per student per unit; class analytics can safely count raw rows.
