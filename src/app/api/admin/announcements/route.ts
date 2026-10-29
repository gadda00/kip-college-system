import { z } from 'zod'
import { db } from '@/lib/db'
import { assertSameOrigin, requireRole } from '@/lib/auth'
import { boolish, handle, ok, readJson } from '@/lib/api-helpers'
import { logAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/** All announcements, newest first. */
export async function GET() {
  return handle(async () => {
    await requireRole('ADMIN')
    const announcements = await db.announcement.findMany({ orderBy: { createdAt: 'desc' } })
    return ok(announcements)
  })
}

const createSchema = z.object({
  title: z.string().trim().min(2, 'Title is required'),
  body: z.string().trim().min(2, 'Body is required'),
  audience: z.enum(['ALL', 'STUDENTS', 'STAFF']).default('ALL'),
  pinned: boolish.default(false),
  active: boolish.default(true),
  authorName: z.string().trim().default('Registrar'),
})

/** Create an announcement. */
export async function POST(req: Request) {
  return handle(async () => {
    assertSameOrigin(req, { requireOrigin: true })
    const admin = await requireRole('ADMIN')
    const body = createSchema.parse(await readJson(req))
    const announcement = await db.announcement.create({ data: body })
    await logAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'ANNOUNCEMENT_CREATED',
      entity: 'announcement',
      entityId: announcement.id,
      meta: { title: body.title, audience: body.audience },
    })
    return ok(announcement, 201)
  })
}
