import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const bootedAt = Date.now()

/**
 * GET /api/health — liveness + database connectivity probe.
 * Safe to expose: returns no institutional or user data.
 */
export async function GET() {
  let dbOk = false
  try {
    await db.$queryRaw`SELECT 1`
    dbOk = true
  } catch {
    dbOk = false
  }
  return NextResponse.json(
    {
      ok: dbOk,
      status: dbOk ? 'healthy' : 'degraded',
      db: dbOk ? 'up' : 'down',
      uptimeSec: Math.round((Date.now() - bootedAt) / 1000),
      timestamp: new Date().toISOString(),
    },
    { status: dbOk ? 200 : 503 },
  )
}
