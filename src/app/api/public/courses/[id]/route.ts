import { db } from '@/lib/db'
import { handle, ok, csvList } from '@/lib/api-helpers'
import { HttpError } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/** Public course detail: units by stage, fee breakdown, related courses. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params

    const course = await db.course.findUnique({
      where: { id },
      include: { units: { orderBy: [{ stage: 'asc' }, { code: 'asc' }] } },
    })
    if (!course || !course.isActive) throw new HttpError(404, 'Course not found')

    const related = await db.course.findMany({
      where: { isActive: true, category: course.category, id: { not: course.id } },
      orderBy: { sortOrder: 'asc' },
      take: 3,
      select: {
        id: true,
        code: true,
        title: true,
        category: true,
        level: true,
        durationMonths: true,
        tuitionPerTerm: true,
        image: true,
        examBody: true,
      },
    })

    const unitsByStage = new Map<number, typeof course.units>()
    for (const unit of course.units) {
      const list = unitsByStage.get(unit.stage) ?? []
      list.push(unit)
      unitsByStage.set(unit.stage, list)
    }

    const data = {
      ...course,
      intakes: csvList(course.intakeMonths),
      units: course.units.map((u) => ({
        id: u.id,
        code: u.code,
        name: u.name,
        stage: u.stage,
        stageLabel: u.stageLabel,
        weekHours: u.weekHours,
      })),
      unitsByStage: [...unitsByStage.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([stage, units]) => ({ stage, stageLabel: units[0]?.stageLabel ?? `Stage ${stage}`, units })),
      fees: {
        registrationFee: course.registrationFee,
        tuitionPerTerm: course.tuitionPerTerm,
        examFee: course.examFee,
        perTermTotal: course.registrationFee + course.tuitionPerTerm + course.examFee,
      },
      related,
    }

    return ok(data)
  })
}
