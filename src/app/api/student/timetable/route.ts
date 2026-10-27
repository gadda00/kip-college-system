import { db } from '@/lib/db'
import { handle, ok } from '@/lib/api-helpers'
import { currentStudent } from '@/lib/roles'
import { mapTimetableEntry, timetableInclude } from '@/lib/timetable'

export const dynamic = 'force-dynamic'

/** Weekly timetable for the student's course. */
export async function GET() {
  return handle(async () => {
    const { profile } = await currentStudent()
    const entries = await db.timetableEntry.findMany({
      where: { courseId: profile.courseId },
      include: timetableInclude,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })
    return ok(entries.map(mapTimetableEntry))
  })
}
