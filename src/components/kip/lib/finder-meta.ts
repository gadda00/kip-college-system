/**
 * Static presentation metadata for the homepage course finder.
 *
 * The finder filters the live course catalogue client-side, but three facts are
 * presentation-layer concerns that the public courses API does not carry:
 *   - minGrade  → the KCSE mean grade each programme needs (mirrors the
 *                 `requirements` text seeded per course in prisma/seed-data.ts;
 *                 bridging routes exist, e.g. CAMS → CPA)
 *   - modes     → the class modes each programme runs in (Day / Evening / Weekend)
 *   - campuses  → where the programme is offered (MAIN / TOWN / MWINGI)
 *
 * Covers all 28 seeded course codes; unknown codes (future courses) fall back
 * to a sensible default derived from their level via `finderMetaFor`.
 */

export type StudyMode = 'Day' | 'Evening' | 'Weekend'
export type CampusKey = 'MAIN' | 'TOWN' | 'MWINGI'

export type CourseFinderMeta = {
  /** Minimum KCSE mean grade (indicative entry guide, A best → E worst). */
  minGrade: string
  /** Class modes the programme runs in. */
  modes: StudyMode[]
  /** Campuses where the programme is offered. */
  campuses: CampusKey[]
}

/** Full KCSE mean-grade scale, best first. */
export const KCSE_GRADES: readonly string[] = [
  'A',
  'A-',
  'B+',
  'B',
  'B-',
  'C+',
  'C',
  'C-',
  'D+',
  'D',
  'D-',
  'E',
]

/** Class-time filter chips; "Mixed" matches programmes with 2+ modes. */
export const STUDY_MODE_OPTIONS: readonly string[] = ['Day', 'Evening', 'Weekend', 'Mixed']

/** Campus filter options (labels match the seeded campus names). */
export const CAMPUS_OPTIONS = [
  { value: '', label: 'Any campus' },
  { value: 'MAIN', label: 'Main Campus — Wikililye' },
  { value: 'TOWN', label: 'Town Campus — Muli Mall' },
  { value: 'MWINGI', label: 'Mwingi Campus' },
] as const

/** Rank a KCSE grade: E = 0 … A = 12 (−1 for unknown grades). */
export function gradeRank(grade: string): number {
  const index = KCSE_GRADES.indexOf(grade)
  // KCSE_GRADES is best-first, so invert to get "higher rank = better grade"
  return index === -1 ? -1 : KCSE_GRADES.length - 1 - index
}

/** True when `userGrade` meets or beats `minGrade` (A > A- > … > D- > E). */
export function isGradeEligible(userGrade: string, minGrade: string): boolean {
  return gradeRank(userGrade) >= gradeRank(minGrade)
}

/** Per-course finder metadata, keyed by course code (28 seeded codes). */
export const COURSE_FINDER_META: Record<string, CourseFinderMeta> = {
  // ---- KASNEB (6) ----
  CPA: { minGrade: 'C+', modes: ['Evening', 'Weekend'], campuses: ['TOWN'] },
  CAMS: { minGrade: 'D+', modes: ['Day', 'Evening'], campuses: ['TOWN', 'MWINGI'] },
  CS: { minGrade: 'C+', modes: ['Evening', 'Weekend'], campuses: ['TOWN'] },
  CIFA: { minGrade: 'C+', modes: ['Evening', 'Weekend'], campuses: ['TOWN'] },
  DICT: { minGrade: 'C-', modes: ['Day', 'Evening'], campuses: ['TOWN', 'MWINGI'] },
  ATD: { minGrade: 'C', modes: ['Day', 'Evening'], campuses: ['TOWN'] },

  // ---- BUSINESS (11) ----
  'DIP-BM': { minGrade: 'C-', modes: ['Day', 'Evening', 'Weekend'], campuses: ['MAIN', 'TOWN', 'MWINGI'] },
  'DIP-HRM': { minGrade: 'C-', modes: ['Day', 'Evening'], campuses: ['MAIN', 'TOWN'] },
  'DIP-SCM': { minGrade: 'C-', modes: ['Day', 'Evening'], campuses: ['MAIN', 'TOWN'] },
  'DIP-SM': { minGrade: 'C-', modes: ['Day', 'Evening'], campuses: ['MAIN', 'TOWN'] },
  'DIP-PM': { minGrade: 'C-', modes: ['Day', 'Evening'], campuses: ['MAIN', 'TOWN'] },
  DCD: { minGrade: 'C-', modes: ['Day', 'Evening'], campuses: ['MAIN', 'TOWN'] },
  'CERT-BM': { minGrade: 'D', modes: ['Day', 'Evening'], campuses: ['MAIN', 'TOWN', 'MWINGI'] },
  'CERT-HRM': { minGrade: 'D', modes: ['Day', 'Evening'], campuses: ['MAIN', 'TOWN'] },
  CSK: { minGrade: 'D+', modes: ['Day', 'Evening'], campuses: ['MAIN', 'MWINGI'] },
  CSM: { minGrade: 'D+', modes: ['Day', 'Evening'], campuses: ['MAIN', 'TOWN'] },
  CSS: { minGrade: 'D+', modes: ['Day', 'Evening'], campuses: ['MAIN', 'TOWN'] },

  // ---- TECHNICAL (11) ----
  'DIP-ICT': { minGrade: 'C-', modes: ['Day', 'Evening'], campuses: ['MAIN', 'TOWN', 'MWINGI'] },
  'CERT-ICT': { minGrade: 'D', modes: ['Day', 'Evening'], campuses: ['MAIN', 'TOWN', 'MWINGI'] },
  'DIP-EEE': { minGrade: 'C-', modes: ['Day', 'Evening'], campuses: ['MAIN'] },
  'CERT-EEE': { minGrade: 'D', modes: ['Day'], campuses: ['MAIN'] },
  'DIP-BCT': { minGrade: 'C-', modes: ['Day'], campuses: ['MAIN'] },
  'DIP-CAT': { minGrade: 'C-', modes: ['Day'], campuses: ['MAIN', 'MWINGI'] },
  'DIP-FDG': { minGrade: 'C-', modes: ['Day'], campuses: ['MAIN'] },
  DWE: { minGrade: 'C-', modes: ['Day'], campuses: ['MAIN'] },
  'CERT-HBT': { minGrade: 'D-', modes: ['Day', 'Weekend'], campuses: ['MAIN', 'MWINGI'] },
  'ART-EI': { minGrade: 'D-', modes: ['Day'], campuses: ['MAIN'] },
  CPL: { minGrade: 'D', modes: ['Day'], campuses: ['MAIN'] },
}

/** Fallback metadata for course codes not listed above (e.g. newly added). */
function fallbackForLevel(level: string): CourseFinderMeta {
  if (level === 'Artisan') return { minGrade: 'D-', modes: ['Day'], campuses: ['MAIN', 'TOWN', 'MWINGI'] }
  if (level === 'Certificate') return { minGrade: 'D', modes: ['Day', 'Evening'], campuses: ['MAIN', 'TOWN', 'MWINGI'] }
  if (level === 'Professional') return { minGrade: 'C+', modes: ['Evening', 'Weekend'], campuses: ['TOWN'] }
  return { minGrade: 'C-', modes: ['Day', 'Evening'], campuses: ['MAIN', 'TOWN'] }
}

/** Finder metadata for a course — exact match by code, else derived from level. */
export function finderMetaFor(code: string, level: string): CourseFinderMeta {
  return COURSE_FINDER_META[code] ?? fallbackForLevel(level)
}
