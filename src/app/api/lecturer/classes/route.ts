import { db } from '@/lib/db'
import { handle, ok, timeToMinutes } from '@/lib/api-helpers'
import { currentLecturer } from '@/lib/roles'
import { timetableInclude } from '@/lib/timetable'

export const dynamic = 'force-dynamic'

/** Units the lecturer teaches (from timetable entries) with enrolled-student counts. */
export async function GET() {
  return handle(async () => {
    const { profile } = await currentLecturer()
    const entries = await db.timetableEntry.findMany({
      where: { lecturerId: profile.id },
      include: timetableInclude,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })

    // group timetable entries per taught unit
    const byUnit = new Map<string, typeof entries>()
    for (const e of entries) {
      if (!e.unitId || !e.unit) continue
      const list = byUnit.get(e.unitId) ?? []
      list.push(e)
      byUnit.set(e.unitId, list)
    }

    const classes = await Promise.all(
      [...byUnit.entries()].map(async ([unitId, list]) => {
        const first = list[0]!
        const unit = first.unit!
        // weekly contact hours = Σ (endTime − startTime) across that unit's sessions
        const weeklyHours = list.reduce((sum, e) => {
          const start = timeToMinutes(e.startTime)
          const end = timeToMinutes(e.endTime)
          if (start === null || end === null || end <= start) return sum
          return sum + (end - start) / 60
        }, 0)
        const studentsCount = await db.studentProfile.count({
          where: { courseId: first.courseId, status: 'ACTIVE', currentTerm: unit.stage },
        })
        return {
          unitId,
          unitName: unit.name,
          unitCode: unit.code,
          courseId: first.course.id,
          courseTitle: first.course.title,
          stageLabel: unit.stageLabel,
          stage: unit.stage,
          weeklyHours: Math.round(weeklyHours * 10) / 10,
          studentsCount,
        }
      }),
    )

    // most-taught / stable order: by course then stage
    classes.sort((a, b) => a.courseTitle.localeCompare(b.courseTitle) || a.stage - b.stage)
    return ok(classes)
  })
}
