import { NextResponse } from 'next/server'
import { db, ensureDbReady } from '@/lib/db'

export const dynamic = 'force-dynamic'

const bootedAt = Date.now()

/** Safe one-line error summary (no connection strings / credentials). */
function summarize(err: unknown): string {
  const code = (err as { code?: string })?.code
  const raw = err instanceof Error ? err.message : String(err)
  const first = raw.split('\n')[0]?.slice(0, 160) ?? 'unknown error'
  const scrubbed = first.replace(/(?:postgres(?:ql)?|prisma|file):\/\/[^\s"']+/gi, '[redacted]')
  return code ? `${code}: ${scrubbed}` : scrubbed
}

/**
 * GET /api/health — liveness + database connectivity probe.
 * Triggers one-time PostgreSQL provisioning on cold instances.
 * Safe to expose: returns no institutional or user data.
 */
export async function GET() {
  let dbOk = false
  let error: string | undefined
  try {
    await ensureDbReady()
    await db.$queryRaw`SELECT 1`
    dbOk = true
  } catch (err) {
    dbOk = false
    error = summarize(err)
  }
  return NextResponse.json(
    {
      ok: dbOk,
      status: dbOk ? 'healthy' : 'degraded',
      db: dbOk ? 'up' : 'down',
      ...(error ? { error } : {}),
      uptimeSec: Math.round((Date.now() - bootedAt) / 1000),
      timestamp: new Date().toISOString(),
    },
    { status: dbOk ? 200 : 503 },
  )
}
