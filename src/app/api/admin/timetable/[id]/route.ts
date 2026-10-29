import { z } from 'zod'
import { db } from '@/lib/db'
import { assertSameOrigin, HttpError, requireRole } from '@/lib/auth'
import { handle, ok, readJson, timeToMinutes } from '@/lib/api-helpers'
import { mapTimetableEntry, timetableInclude } from '@/lib/timetable'
import { logAudit } from '@/lib/audit'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

const timeRule = z
  .string()
  .trim()
  .regex(/^\d{1,2}:\d{2}$/, 'Time must be in HH:MM format e.g. 08:00')
  .transform((v) => {
    const [h, m] = v.split(':')
    return `${h!.padStart(2, '0')}:${m}`
  })

const updateSchema = z.object({
  courseId: z.string().optional(),
  unitId: z.string().optional().nullable(),
  dayOfWeek: z.coerce.number().int().min(1).max(5).optional(),
  startTime: timeRule.optional(),
  endTime: timeRule.optional(),
  room: z.string().trim().min(1).optional(),
  campusId: z.string().optional().nullable(),
  lecturerId: z.string().optional().nullable(),
})

/** Update a timetable entry (validating times and relations). */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    assertSameOrigin(req, { requireOrigin: true })
    const admin = await requireRole('ADMIN')
    const { id } = await params
    const body = updateSchema.parse(await readJson(req))

    const existing = await db.timetableEntry.findUnique({ where: { id } })
    if (!existing) throw new HttpError(404, 'Timetable entry not found')

    const startTime = body.startTime ?? existing.startTime
    const endTime = body.endTime ?? existing.endTime
    const start = timeToMinutes(startTime)
    const end = timeToMinutes(endTime)
    if (start === null || end === null || end <= start) {
      throw new HttpError(400, 'endTime must be later than startTime')
    }

    const courseId = body.courseId ?? existing.courseId
    if (body.courseId && body.courseId !== existing.courseId) {
      const course = await db.course.findUnique({ where: { id: body.courseId }, select: { id: true } })
      if (!course) throw new HttpError(404, 'Course not found')
    }
    if (body.unitId) {
      const unit = await db.unit.findUnique({ where: { id: body.unitId }, select: { courseId: true } })
      if (!unit) throw new HttpError(404, 'Unit not found')
      if (unit.courseId !== courseId) throw new HttpError(400, 'This unit does not belong to the selected course')
    }
    if (body.campusId) {
      const campus = await db.campus.findUnique({ where: { id: body.campusId }, select: { id: true } })
      if (!campus) throw new HttpError(404, 'Campus not found')
    }
    if (body.lecturerId) {
      const lecturer = await db.lecturerProfile.findUnique({
        where: { id: body.lecturerId },
        select: { id: true },
      })
      if (!lecturer) throw new HttpError(404, 'Lecturer not found')
    }

    const data: Prisma.TimetableEntryUpdateInput = {}
    if (body.courseId !== undefined) data.course = { connect: { id: body.courseId } }
    if (body.unitId !== undefined) data.unit = body.unitId ? { connect: { id: body.unitId } } : { disconnect: true }
    if (body.dayOfWeek !== undefined) data.dayOfWeek = body.dayOfWeek
    if (body.startTime !== undefined) data.startTime = body.startTime
    if (body.endTime !== undefined) data.endTime = body.endTime
    if (body.room !== undefined) data.room = body.room
    if (body.campusId !== undefined) data.campus = body.campusId ? { connect: { id: body.campusId } } : { disconnect: true }
    if (body.lecturerId !== undefined) {
      data.lecturer = body.lecturerId ? { connect: { id: body.lecturerId } } : { disconnect: true }
    }

    const entry = await db.timetableEntry.update({ where: { id }, data, include: timetableInclude })
    await logAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'TIMETABLE_ENTRY_UPDATED',
      entity: 'timetableEntry',
      entityId: id,
      meta: { fields: Object.keys(data) },
    })
    return ok(mapTimetableEntry(entry))
  })
}

/** Delete a timetable entry. */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    assertSameOrigin(req, { requireOrigin: true })
    const admin = await requireRole('ADMIN')
    const { id } = await params
    const existing = await db.timetableEntry.findUnique({ where: { id }, select: { id: true } })
    if (!existing) throw new HttpError(404, 'Timetable entry not found')
    await db.timetableEntry.delete({ where: { id } })
    await logAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'TIMETABLE_ENTRY_DELETED',
      entity: 'timetableEntry',
      entityId: id,
    })
    return ok({ deleted: true, id })
  })
}
