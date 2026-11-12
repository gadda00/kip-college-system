import { db } from '@/lib/db'
import { assertSameOrigin, HttpError, requireRole } from '@/lib/auth'
import { handle, ok } from '@/lib/api-helpers'
import { logAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/** Delete a unit (materials cascade; timetable entries detach).
 *
 * BLOCKED while exam results exist: deleting the unit would cascade-destroy
 * students' academic records. Remove the results first if this is truly a
 * re-import; otherwise deactivate the parent course.
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    assertSameOrigin(req, { requireOrigin: true })
    const admin = await requireRole('ADMIN')
    const { id } = await params

    const existing = await db.unit.findUnique({ where: { id } })
    if (!existing) throw new HttpError(404, 'Unit not found')

    const resultsCount = await db.result.count({ where: { unitId: id } })
    if (resultsCount > 0) {
      throw new HttpError(
        400,
        `Cannot delete this unit — ${resultsCount} recorded exam result${resultsCount === 1 ? '' : 's'} would be destroyed. Remove the results first if this is a re-import.`,
      )
    }

    await db.unit.delete({ where: { id } })
    await logAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'UNIT_DELETED',
      entity: 'unit',
      entityId: id,
      meta: { code: existing.code, name: existing.name, courseId: existing.courseId },
    })
    return ok({ deleted: true, id })
  })
}
