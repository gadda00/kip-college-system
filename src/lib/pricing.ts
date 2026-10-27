/**
 * KIPS Kitui — business pricing rules
 * Delivery zones, printing prices, loyalty rules.
 */

export const DELIVERY_ZONES = [
  { id: 'kitui-town', name: 'Kitui Town (CBD & environs)', fee: 100, eta: 'Same day / next morning' },
  { id: 'kitui-county', name: 'Kitui County (Nearby centres)', fee: 250, eta: '1–2 days' },
  { id: 'mwingi', name: 'Mwingi Town', fee: 300, eta: '1–2 days' },
  { id: 'courier', name: 'Other towns (Courier)', fee: 400, eta: '2–4 days' },
] as const

export function getDeliveryFee(zoneId: string | null | undefined): number {
  const zone = DELIVERY_ZONES.find((z) => z.id === zoneId)
  return zone ? zone.fee : 0
}

export const FREE_DELIVERY_THRESHOLD = 3000

/** Loyalty: 1 point per KES 100 spent; 1 point = KES 1 redemption value */
export const POINTS_PER_100 = 1

export function pointsForSpend(total: number): number {
  return Math.floor(total / 100) * POINTS_PER_100
}

// ---------- PRINTING PRICING (KES) ----------
export const PRINT_RATES = {
  BW: { A4: 10, A3: 25, A5: 8, LEGAL: 12 },
  COLOR: { A4: 50, A3: 100, A5: 40, LEGAL: 60 },
  MIXED: { A4: 30, A3: 60, A5: 24, LEGAL: 36 }, // avg of BW & colour
} as const

export const BINDING_RATES: Record<string, number> = {
  NONE: 0,
  STAPLE: 20,
  SPIRAL: 150,
  TAPE: 60,
  HARD_COVER: 800,
}

export type PrintSpec = {
  pages: number
  copies: number
  paperSize: 'A4' | 'A3' | 'A5' | 'LEGAL'
  colorMode: 'BW' | 'COLOR' | 'MIXED'
  doubleSided: boolean
  binding: string
}

export function calcPrintPrice(spec: PrintSpec): number {
  const rate = PRINT_RATES[spec.colorMode][spec.paperSize]
  const sheetFactor = spec.doubleSided ? 0.9 : 1 // 10% off for double-sided
  const printCost = spec.pages * spec.copies * rate * sheetFactor
  const bindingCost = BINDING_RATES[spec.binding] ?? 0
  const sub = printCost + bindingCost * spec.copies
  // volume discount on printing: 5+ copies gets 5%, 20+ gets 12%
  let discount = 0
  if (spec.copies >= 20) discount = 0.12
  else if (spec.copies >= 5) discount = 0.05
  return Math.round(sub * (1 - discount))
}

// ---------- HELPERS ----------
export function generateOrderNumber(seq?: number): string {
  return `KPS-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`
}

export function generateReference(prefix: string): string {
  return `${prefix}-${Date.now().toString().slice(-5)}${Math.floor(Math.random() * 900 + 100)}`
}

export function mpesaCheckoutId(): string {
  return `ws_CO_${Date.now()}${Math.floor(Math.random() * 900 + 100)}`
}

export function mpesaReceipt(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789'
  let s = 'QL'
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}
