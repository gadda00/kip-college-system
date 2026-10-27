import { db } from '@/lib/db'
import { handle, ok, todayDow } from '@/lib/api-helpers'
import { currentLecturer } from '@/lib/roles'
import { mapTimetableEntry, timetableInclude } from '@/lib/timetable'

export const dynamic = 'force-dynamic'

/** Lecturer overview: units/courses/students counts + today's schedule. */
export async function GET() {
  return handle(async () => {
    const { profile } = await currentLecturer()
    const entries = await db.timetableEntry.findMany({
      where: { lecturerId: profile.id },
      include: timetableInclude,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })

    const unitIds = new Set(entries.map((e) => e.unitId).filter((id): id is string => Boolean(id)))
    const courseIds = [...new Set(entries.map((e) => e.courseId))]

    const studentsCount = await db.studentProfile.count({
      where: { courseId: { in: courseIds }, status: 'ACTIVE' },
    })

    const dow = todayDow()
    const todaySchedule = (dow <= 5 ? entries.filter((e) => e.dayOfWeek === dow) : []).map(mapTimetableEntry)

    return ok({
      unitsCount: unitIds.size,
      coursesCount: courseIds.length,
      studentsCount,
      todaySchedule,
    })
  })
}
