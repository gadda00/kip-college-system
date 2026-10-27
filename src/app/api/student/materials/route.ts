import { db } from '@/lib/db'
import { handle, ok } from '@/lib/api-helpers'
import { currentStudent } from '@/lib/roles'

export const dynamic = 'force-dynamic'

/** Study materials for the student's course. */
export async function GET() {
  return handle(async () => {
    const { profile } = await currentStudent()
    const materials = await db.studyMaterial.findMany({
      where: { courseId: profile.courseId },
      include: { unit: { select: { id: true, name: true, stageLabel: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return ok(
      materials.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        type: m.type,
        fileLabel: m.fileLabel,
        unitId: m.unitId,
        unitName: m.unit?.name ?? null,
        stageLabel: m.unit?.stageLabel ?? null,
        createdAt: m.createdAt,
      })),
    )
  })
}
