import { db } from '@/lib/db'
import { handle, ok } from '@/lib/api-helpers'
import { currentLecturer } from '@/lib/roles'
import { mapTimetableEntry, timetableInclude } from '@/lib/timetable'

export const dynamic = 'force-dynamic'

/** The lecturer's own weekly teaching timetable. */
export async function GET() {
  return handle(async () => {
    const { profile } = await currentLecturer()
    const entries = await db.timetableEntry.findMany({
      where: { lecturerId: profile.id },
      include: timetableInclude,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })
    return ok(entries.map(mapTimetableEntry))
  })
}
