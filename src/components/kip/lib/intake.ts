/**
 * Intake calendar helpers.
 *
 * KIP College runs three intakes a year — January, May and September — each
 * starting on the 1st of the month. The homepage hero and closing band both
 * need "the next intake" (date, apply-by date and month name) computed from
 * the current date.
 */

export type NextIntakeInfo = {
  /** The 1st of the next intake month (Jan / May / Sep) strictly after `now`. */
  start: Date
  /** Applications close two weeks before the intake starts. */
  applyBy: Date
  /** English month name of the intake, e.g. "January". */
  monthName: string
}

/** Months (0-based) in which intakes start. */
const INTAKE_MONTHS = [0, 4, 8]

/** The next upcoming intake, computed from `now` (default: today). */
export function nextIntake(now: Date = new Date()): NextIntakeInfo {
  const year = now.getFullYear()
  const candidates: Date[] = []
  for (const y of [year, year + 1]) {
    for (const month of INTAKE_MONTHS) {
      candidates.push(new Date(y, month, 1, 0, 0, 0, 0))
    }
  }
  // intakes are announced ahead and start on the 1st — pick the first one
  // strictly in the future (if today *is* the 1st, that intake has begun)
  const start =
    candidates.find((d) => d.getTime() > now.getTime()) ?? candidates[candidates.length - 1]
  const applyBy = new Date(start.getTime() - 14 * 24 * 60 * 60 * 1000)
  return {
    start,
    applyBy,
    monthName: start.toLocaleDateString('en-GB', { month: 'long' }),
  }
}
