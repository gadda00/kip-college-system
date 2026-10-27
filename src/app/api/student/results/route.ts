import { db } from '@/lib/db'
import { handle, ok, gradePoints } from '@/lib/api-helpers'
import { currentStudent } from '@/lib/roles'

export const dynamic = 'force-dynamic'

/** Published results grouped by stage/term + overall GPA and average. */
export async function GET() {
  return handle(async () => {
    const { profile } = await currentStudent()
    const results = await db.result.findMany({
      where: { studentId: profile.id, published: true },
      include: {
        unit: { select: { name: true, code: true, stage: true, stageLabel: true } },
      },
      orderBy: [{ unit: { stage: 'asc' } }, { unit: { code: 'asc' } }],
    })

    const groups = new Map<string, { stageLabel: string; stage: number; entries: unknown[] }>()
    for (const r of results) {
      const key = r.unit.stageLabel
      const group = groups.get(key) ?? { stageLabel: key, stage: r.unit.stage, entries: [] }
      group.entries.push({
        id: r.id,
        unitId: r.unitId,
        unitName: r.unit.name,
        unitCode: r.unit.code,
        term: r.term,
        marks: r.marks,
        grade: r.grade,
        remark: r.remark,
        examBody: r.examBody,
      })
      groups.set(key, group)
    }
    const byStage = [...groups.values()].sort((a, b) => a.stage - b.stage)

    const average = results.length
      ? Math.round((results.reduce((s, r) => s + r.marks, 0) / results.length) * 10) / 10
      : 0
    const gpa = results.length
      ? Math.round((results.reduce((s, r) => s + gradePoints(r.grade), 0) / results.length) * 100) / 100
      : 0

    return ok({
      byStage: byStage.map((g) => ({ stageLabel: g.stageLabel, entries: g.entries })),
      overall: { unitsDone: results.length, average, gpa },
    })
  })
}
