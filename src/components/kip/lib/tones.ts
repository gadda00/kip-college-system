'use client'

/**
 * Shared badge tone maps + option lists for the KIP College portals.
 *
 * COLOR POLICY (sapphire brand): semantic success/paid/active/published stay
 * GREEN, M-Pesa method badges keep M-Pesa's own green, and categorical maps
 * (category / audience / fee-type) use the brand / sky / gold / teal families
 * — never green. `categoryTone` mirrors the chart palette in
 * overview-view.tsx (CATEGORY_COLORS: TECHNICAL sapphire, BUSINESS gold,
 * KASNEB bronze — via the same chart CSS variables).
 */

/**
 * Payment-method badge tone. M-Pesa keeps M-Pesa's own brand green; the
 * other payment channels use the brand/gold families, cash stays neutral.
 */
export function methodTone(method: string): string {
  switch (method) {
    case 'MPESA':
      return 'border-transparent bg-emerald-600/15 text-emerald-700 dark:text-emerald-400'
    case 'BANK':
      return 'border-transparent bg-gold-400/15 text-gold-700 dark:text-gold-300'
    default:
      return 'border-transparent bg-muted text-muted-foreground'
  }
}

/**
 * Course-category badge tone — same family per category as the chart palette
 * in overview-view.tsx (CATEGORY_COLORS): TECHNICAL = sapphire (brand),
 * BUSINESS = gold, KASNEB = bronze (chart-5); unknown categories fall back
 * to teal, the chart's sage fallback family.
 */
export function categoryTone(category: string): string {
  switch (category) {
    case 'TECHNICAL':
      return 'border-transparent bg-brand-600/10 text-brand-700 dark:text-brand-400'
    case 'BUSINESS':
      return 'border-transparent bg-gold-400/15 text-gold-700 dark:text-gold-300'
    case 'KASNEB':
      // var(--chart-5) is the charts' bronze and is dark-mode aware itself
      return 'border-transparent bg-chart-5/15 text-chart-5'
    default:
      return 'border-transparent bg-teal-600/10 text-teal-700 dark:text-teal-400'
  }
}

/** Fee-type badge tone — categorical (brand / sky / teal), never green. */
export function feeTypeTone(type: string): string {
  switch (type) {
    case 'TUITION':
      return 'border-transparent bg-brand-600/10 text-brand-700 dark:text-brand-400'
    case 'REGISTRATION':
      return 'border-transparent bg-sky-600/10 text-sky-700 dark:text-sky-400'
    case 'EXAM':
      return 'border-transparent bg-teal-600/10 text-teal-700 dark:text-teal-400'
    default:
      return 'border-transparent bg-muted text-muted-foreground'
  }
}

/** Announcement-audience badge tone — categorical (brand / sky / gold). */
export function audienceTone(audience: string): string {
  switch (audience) {
    case 'STUDENTS':
      return 'border-transparent bg-sky-600/10 text-sky-700 dark:text-sky-400'
    case 'STAFF':
      return 'border-transparent bg-gold-400/15 text-gold-700 dark:text-gold-300'
    default:
      return 'border-transparent bg-brand-600/10 text-brand-700 dark:text-brand-400'
  }
}

/** Term labels offered across fee posting / results entry (current-first). */
export const TERM_OPTIONS: string[] = [
  '2026/2027 T1',
  '2026/2027 T2',
  '2025/2026 T3',
  '2025/2026 T2',
  '2025/2026 T1',
]
