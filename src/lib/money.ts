/**
 * Money utilities — all arithmetic happens in integer CENTS (KES cents)
 * to avoid floating-point drift. Storage remains Prisma `Float` for the
 * SQLite demo (see docs/product-audit.md R1); PostgreSQL production should
 * migrate to `Decimal(12,2)`. Every display boundary goes through
 * fmtKES/fromCents so sums never accumulate binary-float error.
 */

/** Convert a KES amount to integer cents (rounds half-up on stray floats). */
export function toCents(amount: number): number {
  return Math.round(amount * 100)
}

/** Convert integer cents back to a KES number (2-dp safe). */
export function fromCents(cents: number): number {
  return cents / 100
}

/** Sum a list of KES amounts exactly, in cents. */
export function sumKES(amounts: number[]): number {
  const totalCents = amounts.reduce((acc, a) => acc + toCents(a), 0)
  return fromCents(totalCents)
}

/** Subtract in cents: a - b. */
export function subKES(a: number, b: number): number {
  return fromCents(toCents(a) - toCents(b))
}

/** Add in cents: a + b. */
export function addKES(a: number, b: number): number {
  return fromCents(toCents(a) + toCents(b))
}

/** Format cents integer as "KES 12,345" / "KES 12,345.50". */
export function fmtCents(cents: number): string {
  const whole = Math.floor(cents / 100)
  const frac = Math.abs(cents % 100)
  const base = `KES ${whole.toLocaleString('en-KE')}`
  return frac === 0 ? base : `${base}.${String(frac).padStart(2, '0')}`
}
