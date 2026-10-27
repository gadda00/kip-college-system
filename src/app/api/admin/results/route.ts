import { z } from 'zod'
import { db } from '@/lib/db'
import { HttpError, requireRole } from '@/lib/auth'
import { handle, ok, readJson } from '@/lib/api-helpers'
import { upsertResults } from '@/lib/results'

export const dynamic = 'force-dynamic'

/**
 * Results entry worksheet: ?courseId= (required) &unitId= &term=.
 * Returns active students of the course + their existing result.
 */
export async function GET(req: Request) {
  return handle(async () => {
    await requireRole('ADMIN')
    const url = new URL(req.url)
    const courseId = url.searchParams.get('courseId')?.trim() ?? ''
    const unitId = url.searchParams.get('unitId')?.trim() ?? ''
    const term = url.searchParams.get('term')?.trim() ?? ''
    if (!courseId) throw new HttpError(400, 'courseId query parameter is required')

    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { id: true, code: true, title: true, examBody: true },
    })
    if (!course) throw new HttpError(404, 'Course not found')

    let unit: { id: string; code: string; name: string; stage: number; stageLabel: string } | null = null
    if (unitId) {
      const unitRow = await db.unit.findUnique({ where: { id: unitId } })
      if (!unitRow) throw new HttpError(404, 'Unit not found')
      if (unitRow.courseId !== courseId) throw new HttpError(400, 'This unit does not belong to the selected course')
      unit = {
        id: unitRow.id,
        code: unitRow.code,
        name: unitRow.name,
        stage: unitRow.stage,
        stageLabel: unitRow.stageLabel,
      }
    }

    const students = await db.studentProfile.findMany({
      where: { courseId, status: 'ACTIVE' },
      include: { user: { select: { name: true } } },
      orderBy: { admissionNo: 'asc' },
    })
    const studentIds = students.map((s) => s.id)

    const results = await db.result.findMany({
      where: {
        studentId: { in: studentIds },
        ...(unitId ? { unitId } : { unit: { courseId } }),
        ...(term ? { term } : {}),
      },
    })
    const byStudent = new Map(results.map((r) => [r.studentId, r]))

    return ok({
      course,
      unit,
      term: term || null,
      students: students.map((s) => ({
        studentId: s.id,
        name: s.user.name,
        admissionNo: s.admissionNo,
        currentTerm: s.currentTerm,
        result: byStudent.get(s.id) ?? null,
      })),
    })
  })
}

const resultsSchema = z.object({
  unitId: z.string().min(1, 'unitId is required'),
  term: z.string().trim().min(1, 'Term is required'),
  entries: z
    .array(
      z.object({
        studentId: z.string().min(1),
        marks: z.coerce
          .number()
          .min(0, 'Marks must be between 0 and 100')
          .max(100, 'Marks must be between 0 and 100'),
      }),
    )
    .min(1, 'Provide at least one result entry'),
})

/** Admin batch results entry: auto-grade + publish (upsert per student). */
export async function POST(req: Request) {
  return handle(async () => {
    await requireRole('ADMIN')
    const body = resultsSchema.parse(await readJson(req))
    const result = await upsertResults(body)
    return ok(result, 201)
  })
}
