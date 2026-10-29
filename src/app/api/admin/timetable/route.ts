import { z } from 'zod'
import { db } from '@/lib/db'
import { assertSameOrigin, HttpError, requireRole } from '@/lib/auth'
import { handle, ok, readJson, timeToMinutes } from '@/lib/api-helpers'
import { mapTimetableEntry, timetableInclude } from '@/lib/timetable'
import { logAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/** All timetable entries with names: ?courseId=&campusId= filters. */
export async function GET(req: Request) {
  return handle(async () => {
    await requireRole('ADMIN')
    const url = new URL(req.url)
    const courseId = url.searchParams.get('courseId')?.trim() ?? ''
    const campusId = url.searchParams.get('campusId')?.trim() ?? ''

    const entries = await db.timetableEntry.findMany({
      where: {
        ...(courseId ? { courseId } : {}),
        ...(campusId ? { campusId } : {}),
      },
      include: timetableInclude,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })
    return ok(entries.map(mapTimetableEntry))
  })
}

const timeRule = z
  .string()
  .trim()
  .regex(/^\d{1,2}:\d{2}$/, 'Time must be in HH:MM format e.g. 08:00')
  .transform((v) => {
    const [h, m] = v.split(':')
    return `${h!.padStart(2, '0')}:${m}`
  })

const createSchema = z.object({
  courseId: z.string().min(1, 'courseId is required'),
  unitId: z.string().optional().nullable(),
  dayOfWeek: z.coerce.number().int().min(1, 'dayOfWeek must be 1 (Mon) – 5 (Fri)').max(5, 'dayOfWeek must be 1 (Mon) – 5 (Fri)'),
  startTime: timeRule,
  endTime: timeRule,
  room: z.string().trim().min(1, 'Room is required'),
  campusId: z.string().optional().nullable(),
  lecturerId: z.string().optional().nullable(),
})

/** Create a timetable entry (endTime must be after startTime). */
export async function POST(req: Request) {
  return handle(async () => {
    assertSameOrigin(req, { requireOrigin: true })
    const admin = await requireRole('ADMIN')
    const body = createSchema.parse(await readJson(req))

    const start = timeToMinutes(body.startTime)
    const end = timeToMinutes(body.endTime)
    if (start === null || end === null || end <= start) {
      throw new HttpError(400, 'endTime must be later than startTime')
    }

    const course = await db.course.findUnique({ where: { id: body.courseId }, select: { id: true } })
    if (!course) throw new HttpError(404, 'Course not found')

    if (body.unitId) {
      const unit = await db.unit.findUnique({ where: { id: body.unitId }, select: { courseId: true } })
      if (!unit) throw new HttpError(404, 'Unit not found')
      if (unit.courseId !== body.courseId) throw new HttpError(400, 'This unit does not belong to the selected course')
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

    const entry = await db.timetableEntry.create({
      data: {
        courseId: body.courseId,
        unitId: body.unitId || null,
        dayOfWeek: body.dayOfWeek,
        startTime: body.startTime,
        endTime: body.endTime,
        room: body.room,
        campusId: body.campusId || null,
        lecturerId: body.lecturerId || null,
      },
      include: timetableInclude,
    })
    await logAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'TIMETABLE_ENTRY_CREATED',
      entity: 'timetableEntry',
      entityId: entry.id,
      meta: { courseId: body.courseId, dayOfWeek: body.dayOfWeek, startTime: body.startTime, endTime: body.endTime, room: body.room },
    })
    return ok(mapTimetableEntry(entry), 201)
  })
}
