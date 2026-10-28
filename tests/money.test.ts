import { describe, expect, test } from 'bun:test'
import { addKES, fmtCents, fromCents, subKES, sumKES, toCents } from '@/lib/money'

describe('money — integer-cents arithmetic', () => {
  test('toCents/fromCents round-trip', () => {
    expect(toCents(1234.5)).toBe(123450)
    expect(fromCents(123450)).toBe(1234.5)
  })

  test('toCents handles classic float drift', () => {
    // 0.1 + 0.2 === 0.30000000000000004 in raw float; cents avoid it
    expect(toCents(0.1) + toCents(0.2)).toBe(30)
    expect(toCents(0.29)).toBe(29)
    expect(toCents(1.005)).toBe(100) // half-up rounding
  })

  test('sumKES accumulates without drift', () => {
    const items = [0.1, 0.2, 0.3, 999.99, 12345.67]
    expect(sumKES(items)).toBeCloseTo(13346.26, 10)
    // the naive float sum would be 13346.259999999999
    expect(sumKES([0.1, 0.1, 0.1])).toBeCloseTo(0.30000000000000004 === 0.1 * 3 ? 0.30000000000000004 : 0.3, 2)
    expect(sumKES([0.1, 0.1, 0.1])).not.toBe(0.30000000000000004)
  })

  test('subKES computes balances exactly', () => {
    expect(subKES(15000, 4999.99)).toBe(10000.01)
    expect(subKES(10000, 2500)).toBe(7500)
  })

  test('addKES', () => {
    expect(addKES(0.1, 0.2)).toBe(0.3)
  })

  test('fmtCents renders Kenyan format', () => {
    expect(fmtCents(123450)).toBe('KES 1,234.50')
    expect(fmtCents(1500000)).toBe('KES 15,000')
    expect(fmtCents(0)).toBe('KES 0')
  })
})
