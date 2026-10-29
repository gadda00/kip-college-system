import { z } from 'zod'
import { db } from '@/lib/db'
import { assertSameOrigin, HttpError, requireRole } from '@/lib/auth'
import { handle, ok, readJson } from '@/lib/api-helpers'
import { publishResults, upsertResults } from '@/lib/results'
import { logAudit } from '@/lib/audit'

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
  /** false (default) = save as draft; true = save AND publish immediately */
  publish: z.boolean().optional(),
})

const publishSchema = z.object({
  action: z.literal('publish'),
  unitId: z.string().min(1, 'unitId is required'),
  term: z.string().trim().optional(),
})

/**
 * Admin batch results entry. Draft by default; `publish: true` publishes.
 * Body `{ action: 'publish', unitId, term? }` publishes existing drafts.
 */
export async function POST(req: Request) {
  return handle(async () => {
    assertSameOrigin(req, { requireOrigin: true })
    const user = await requireRole('ADMIN')
    const raw = await readJson(req)

    if (publishSchema.safeParse(raw).success) {
      const body = publishSchema.parse(raw)
      const result = await publishResults(body)
      await logAudit({
        actorId: user.id,
        actorEmail: user.email,
        action: 'RESULTS_PUBLISHED',
        entity: 'unit',
        entityId: body.unitId,
        meta: { count: result.publishedCount, term: body.term ?? null, by: 'ADMIN' },
      })
      return ok(result)
    }

    const body = resultsSchema.parse(raw)
    const result = await upsertResults(body)
    if (body.publish) {
      await logAudit({
        actorId: user.id,
        actorEmail: user.email,
        action: 'RESULTS_PUBLISHED',
        entity: 'unit',
        entityId: body.unitId,
        meta: { count: result.savedCount, term: body.term, by: 'ADMIN' },
      })
    }
    return ok(result, 201)
  })
}
