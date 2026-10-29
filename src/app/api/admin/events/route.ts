import { z } from 'zod'
import { db } from '@/lib/db'
import { assertSameOrigin, requireRole } from '@/lib/auth'
import { handle, ok, readJson } from '@/lib/api-helpers'
import { logAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/** All events ordered by date. */
export async function GET() {
  return handle(async () => {
    await requireRole('ADMIN')
    const events = await db.event.findMany({ orderBy: { date: 'asc' } })
    return ok(events)
  })
}

const createSchema = z.object({
  title: z.string().trim().min(2, 'Title is required'),
  description: z.string().trim().min(2, 'Description is required'),
  date: z.coerce.date({ message: 'A valid event date is required' }),
  venue: z.string().trim().min(2, 'Venue is required'),
  image: z.string().trim().optional(),
})

/** Create an event. */
export async function POST(req: Request) {
  return handle(async () => {
    assertSameOrigin(req, { requireOrigin: true })
    const admin = await requireRole('ADMIN')
    const body = createSchema.parse(await readJson(req))
    const event = await db.event.create({ data: { ...body, image: body.image || null } })
    await logAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'EVENT_CREATED',
      entity: 'event',
      entityId: event.id,
      meta: { title: body.title, venue: body.venue, date: body.date.toISOString() },
    })
    return ok(event, 201)
  })
}
