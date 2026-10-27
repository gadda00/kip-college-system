import { db } from '@/lib/db'
import { HttpError, requireRole } from '@/lib/auth'
import { handle, ok } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

/** Delete a unit (results & materials cascade; timetable entries detach). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireRole('ADMIN')
    const { id } = await params

    const existing = await db.unit.findUnique({ where: { id } })
    if (!existing) throw new HttpError(404, 'Unit not found')

    await db.unit.delete({ where: { id } })
    return ok({ deleted: true, id })
  })
}
