import { db } from '@/lib/db'
import { HttpError, requireRole } from '@/lib/auth'
import { handle, ok } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

/** Delete an event. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireRole('ADMIN')
    const { id } = await params
    const existing = await db.event.findUnique({ where: { id }, select: { id: true } })
    if (!existing) throw new HttpError(404, 'Event not found')
    await db.event.delete({ where: { id } })
    return ok({ deleted: true, id })
  })
}
