import { db } from '@/lib/db'
import { assertSameOrigin, HttpError, requireRole } from '@/lib/auth'
import { handle, ok } from '@/lib/api-helpers'
import { logAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/** Delete an event. */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    assertSameOrigin(req, { requireOrigin: true })
    const admin = await requireRole('ADMIN')
    const { id } = await params
    const existing = await db.event.findUnique({ where: { id }, select: { id: true } })
    if (!existing) throw new HttpError(404, 'Event not found')
    await db.event.delete({ where: { id } })
    await logAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'EVENT_DELETED',
      entity: 'event',
      entityId: id,
    })
    return ok({ deleted: true, id })
  })
}
