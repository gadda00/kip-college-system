# Task 8-a — full-stack-developer subagent — Public website overhaul

Task: Overhaul public website (hero, accreditation strip, testimonials, FAQ, downloads) for KIP College after blue rebrand.

## What was built

### New API endpoints (src/app/api/public/)
- `testimonials/route.ts` — GET, all testimonials
- `faqs/route.ts` — GET, active FAQs ordered by sortOrder; optional `?category=` (zod-validated; invalid category falls back to full list)
- `downloads/route.ts` — GET, published DownloadResources ordered by sortOrder
- All follow handle/ok from `@/lib/api-helpers`, `export const dynamic = 'force-dynamic'`.

### New views
- `src/components/kip/site/views/faq-view.tsx` — #/faq: PageHero, search, category pills w/ counts, Accordion, contact + AI-assistant CTAs, skeleton/error/empty states.
- `src/components/kip/site/views/downloads-view.tsx` — #/downloads: PageHero, category Tabs, resource cards (icon/title/desc/fileLabel/44px Download button → sonner demo toast), request-a-document CTA.
- Both render content immediately (no per-item whileInView) so content is never skipped by instant jumps.

### Home (home-view.tsx) overhaul
- H1 "Choose a path that matches your ambition.", eyebrow "ADMISSIONS OPEN 2026 · KITUI INSTITUTE OF PROFESSIONALS", motto "Training for Excellence" in hero copy, Apply Now = bg-primary, Explore Programmes outline.
- NEW accreditation strip (navy band, KNEC/CDACC/NITA/KASNEB shield tiles w/ full names + blurbs).
- NEW testimonials section (id="testimonials", sky band, 6 cards w/ gold #f5b301 stars, initials avatars, course badges, from /api/public/testimonials).
- NEW FAQ teaser (top 4 accordion + View all FAQs → #/faq). Amber purged → sky/white/blue.

### Global polish
- Header: Downloads in NAV_ITEMS; FAQ direct item near Contact; desktop bar at xl breakpoint (measured fit at 1280px); mobile Sheet restructured w/ Menu/More sections + icons + FAQs/Downloads.
- Footer: FAQ quick link. Contact: "Quick answers" FAQ card. Apply success: Downloads page note/link.
- Amber→blue sweep: login sign-in, apply submit, course-detail fee box + Apply button, admissions chip + CTA, news-detail excerpt border. Semantic green (success) kept.

### Route registration
- app.tsx: cases 'faq' → FaqView, 'downloads' → DownloadsView. router.ts: document titles.

## Verification evidence
- curl: 3 endpoints 200 with seeded data (10 FAQs, 6 downloads, 6 testimonials; ?category=Fees → 2).
- agent-browser: home DOM (6 testimonial figures, gold stars rgb(245,179,1), 4 accreditation tiles, hero H1, primary-blue Apply bg); #/faq (10 items, accordion, Fees pill → 2, search hostel → 1, zzzzqq → empty + Clear filters → 10); #/downloads (6 cards, Fees tab → 1, toast verified); apply submitted via UI → success card + Downloads link (test row deleted, DB back to 8 applications); contact FAQ card navigates; 375×812 mobile (Sheet nav taps, no horizontal overflow, 44px Download button, pills wrap); 1280px header coordinates measured (no overlap); all 11 public routes smoke-tested; VLM reviews of home/faq/downloads full screenshots: PASS.
- lint CLEAN; dev.log only 200s.

## Notes / deviations
- Desktop nav needs ≥1280px (xl) — hamburger covers 1024–1279 (needed room for 9 entries).
- Pre-existing radix useId hydration warning in header DropdownMenu (dev-only; confirmed pre-existing via git stash test — not introduced here).
- Home keeps task-5a whileInView reveal pattern (fine for normal scrolling; only programmatic instant jumps skip reveals — new views immune by design).
- DB untouched except one UI-test application, deleted after verification (applications back to seed count 8).
