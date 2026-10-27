import { z } from 'zod'
import { db } from '@/lib/db'
import { HttpError, requireRole } from '@/lib/auth'
import { handle, ok, readJson } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

const unitSchema = z.object({
  code: z.string().trim().min(1, 'Unit code is required'),
  name: z.string().trim().min(2, 'Unit name is required'),
  stage: z.coerce.number().int().min(1, 'Stage must be at least 1').max(12),
  stageLabel: z.string().trim().optional(),
  weekHours: z.coerce.number().int().min(1).max(40).default(4),
})

/** Add a unit to a course. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireRole('ADMIN')
    const { id } = await params
    const body = unitSchema.parse(await readJson(req))

    const course = await db.course.findUnique({ where: { id }, select: { id: true } })
    if (!course) throw new HttpError(404, 'Course not found')

    const duplicate = await db.unit.findUnique({
      where: { courseId_code: { courseId: id, code: body.code } },
      select: { id: true },
    })
    if (duplicate) throw new HttpError(409, 'A unit with this code already exists in the course')

    const unit = await db.unit.create({
      data: {
        courseId: id,
        code: body.code,
        name: body.name,
        stage: body.stage,
        stageLabel: body.stageLabel?.trim() || `Term ${body.stage}`,
        weekHours: body.weekHours,
      },
    })
    return ok(unit, 201)
  })
}
