import { NextResponse } from 'next/server'
import { db, ensureDbReady } from '@/lib/db'

export const dynamic = 'force-dynamic'

const bootedAt = Date.now()

/**
 * GET /api/health — liveness + database connectivity probe.
 * Triggers one-time PostgreSQL provisioning on cold instances.
 * Safe to expose: returns no institutional or user data. Database failure
 * details go to the SERVER LOG only — anonymous callers just see db:'down'
 * (Prisma messages can name tables/hosts, which is recon aid).
 */
export async function GET() {
  let dbOk = false
  try {
    await ensureDbReady()
    await db.$queryRaw`SELECT 1`
    dbOk = true
  } catch (err) {
    dbOk = false
    console.error('[health] db probe failed:', err)
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
