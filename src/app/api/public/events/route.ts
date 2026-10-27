import { db } from '@/lib/db'
import { handle, ok } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

/** Upcoming events ordered by date ascending. */
export async function GET() {
  return handle(async () => {
    const events = await db.event.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: 'asc' },
    })
    return ok(events)
  })
}
