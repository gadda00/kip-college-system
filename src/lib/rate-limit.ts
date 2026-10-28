/**
 * In-memory sliding-window rate limiter.
 *
 * Keys are arbitrary strings (typically `route:ip` or `route:userId`).
 * Sufficient for single-instance / serverless demo deployments; swap for
 * Redis or an edge KV store when running multiple persistent instances.
 */
type Bucket = { hits: number[] }

const buckets = new Map<string, Bucket>()

/** Prune stale buckets occasionally so the map cannot grow unbounded. */
let lastSweep = Date.now()
const SWEEP_INTERVAL_MS = 5 * 60_000

function sweep(windowMs: number) {
  const now = Date.now()
  if (now - lastSweep < SWEEP_INTERVAL_MS) return
  lastSweep = now
  for (const [key, bucket] of buckets) {
    bucket.hits = bucket.hits.filter((t) => now - t < windowMs)
    if (bucket.hits.length === 0) buckets.delete(key)
  }
}

/**
 * Consume one hit from `key`'s allowance.
 * @returns true when the caller is OVER the limit (i.e. must be rejected).
 */
export function rateLimited(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now()
  sweep(windowMs)
  const bucket = buckets.get(key) ?? { hits: [] }
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs)
  bucket.hits.push(now)
  buckets.set(key, bucket)
  return bucket.hits.length > limit
}

/** Best-effort client IP from standard proxy headers. */
export function clientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'local'
  )
}

/** Recommended presets (per key). */
export const RATE_LIMITS = {
  login: { limit: 10, windowMs: 15 * 60_000 }, // 10 / 15 min
  password: { limit: 5, windowMs: 15 * 60_000 }, // 5 / 15 min
  application: { limit: 5, windowMs: 60 * 60_000 }, // 5 / hour
  contact: { limit: 5, windowMs: 60 * 60_000 }, // 5 / hour
  ai: { limit: 20, windowMs: 60_000 }, // 20 / min
  mutation: { limit: 60, windowMs: 60_000 }, // 60 / min generic write guard
} as const
