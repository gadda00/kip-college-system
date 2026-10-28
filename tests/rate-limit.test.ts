import { describe, expect, test } from 'bun:test'
import { rateLimited } from '@/lib/rate-limit'

describe('rate limiter — sliding window', () => {
  test('allows up to the limit and blocks beyond it', () => {
    const key = `test-${Math.random().toString(36).slice(2)}`
    for (let i = 0; i < 5; i++) {
      expect(rateLimited(key, 5, 60_000)).toBe(false)
    }
    expect(rateLimited(key, 5, 60_000)).toBe(true) // 6th hit blocked
    expect(rateLimited(key, 5, 60_000)).toBe(true) // still blocked
  })

  test('keys are isolated', () => {
    const a = `iso-a-${Math.random().toString(36).slice(2)}`
    const b = `iso-b-${Math.random().toString(36).slice(2)}`
    expect(rateLimited(a, 1, 60_000)).toBe(false)
    expect(rateLimited(a, 1, 60_000)).toBe(true)
    expect(rateLimited(b, 1, 60_000)).toBe(false)
  })

  test('window expiry frees the key (1ms window)', async () => {
    const key = `fast-${Math.random().toString(36).slice(2)}`
    expect(rateLimited(key, 1, 1)).toBe(false)
    expect(rateLimited(key, 1, 1)).toBe(true)
    await new Promise((r) => setTimeout(r, 5))
    expect(rateLimited(key, 1, 1)).toBe(false)
  })
})
