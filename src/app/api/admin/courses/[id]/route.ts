import { z } from 'zod'
import { db } from '@/lib/db'
import { HttpError, requireRole } from '@/lib/auth'
import { boolish, handle, ok, readJson } from '@/lib/api-helpers'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

const updateSchema = z.object({
  code: z.string().trim().optional(),
  title: z.string().trim().min(3).optional(),
  category: z.enum(['TECHNICAL', 'BUSINESS', 'KASNEB']).optional(),
  level: z.string().trim().min(2).optional(),
  examBody: z.string().trim().min(2).optional(),
  durationMonths: z.coerce.number().int().min(1).max(60).optional(),
  intakeMonths: z.string().trim().optional(),
  tuitionPerTerm: z.coerce.number().min(0).optional(),
  registrationFee: z.coerce.number().min(0).optional(),
  examFee: z.coerce.number().min(0).optional(),
  description: z.string().trim().optional(),
  requirements: z.string().trim().optional(),
  image: z.string().trim().optional(),
  isActive: boolish.optional(),
  isFeatured: boolish.optional(),
  sortOrder: z.coerce.number().int().optional(),
})

/** Update course fields. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireRole('ADMIN')
    const { id } = await params
    const body = updateSchema.parse(await readJson(req))

    const existing = await db.course.findUnique({ where: { id } })
    if (!existing) throw new HttpError(404, 'Course not found')

    if (body.code && body.code !== existing.code) {
      const taken = await db.course.findUnique({ where: { code: body.code }, select: { id: true } })
      if (taken) throw new HttpError(409, `Course code "${body.code}" is already in use`)
    }

    const data: Prisma.CourseUpdateInput = {}
    if (body.code !== undefined) data.code = body.code
    if (body.title !== undefined) data.title = body.title
    if (body.category !== undefined) data.category = body.category
    if (body.level !== undefined) data.level = body.level
    if (body.examBody !== undefined) data.examBody = body.examBody
    if (body.durationMonths !== undefined) data.durationMonths = body.durationMonths
    if (body.intakeMonths !== undefined) data.intakeMonths = body.intakeMonths
    if (body.tuitionPerTerm !== undefined) data.tuitionPerTerm = body.tuitionPerTerm
    if (body.registrationFee !== undefined) data.registrationFee = body.registrationFee
    if (body.examFee !== undefined) data.examFee = body.examFee
    if (body.description !== undefined) data.description = body.description
    if (body.requirements !== undefined) data.requirements = body.requirements
    if (body.image !== undefined) data.image = body.image
    if (body.isActive !== undefined) data.isActive = body.isActive
    if (body.isFeatured !== undefined) data.isFeatured = body.isFeatured
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder

    const course = await db.course.update({ where: { id }, data })
    return ok(course)
  })
}

/** Delete a course (blocked while students are enrolled). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireRole('ADMIN')
    const { id } = await params

    const existing = await db.course.findUnique({ where: { id } })
    if (!existing) throw new HttpError(404, 'Course not found')

    const studentsCount = await db.studentProfile.count({ where: { courseId: id } })
    if (studentsCount > 0) throw new HttpError(400, 'Cannot delete a course with enrolled students')

    await db.course.delete({ where: { id } })
    return ok({ deleted: true, id })
  })
}
