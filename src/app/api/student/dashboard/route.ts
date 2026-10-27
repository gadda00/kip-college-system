import { db } from '@/lib/db'
import { handle, ok, gradePoints, nowMinutes, timeToMinutes, todayDow } from '@/lib/api-helpers'
import { computeBalance } from '@/lib/fees'
import { currentStudent } from '@/lib/roles'
import { mapTimetableEntry, timetableInclude } from '@/lib/timetable'

export const dynamic = 'force-dynamic'

/** Student dashboard aggregate: profile, current-stage units, fees, results, classes, announcements. */
export async function GET() {
  return handle(async () => {
    const { profile } = await currentStudent()
    const [units, results, entries, announcements, fees] = await Promise.all([
      db.unit.findMany({
        where: { courseId: profile.courseId, stage: profile.currentTerm },
        orderBy: { code: 'asc' },
        select: { id: true, code: true, name: true, stageLabel: true, weekHours: true },
      }),
      db.result.findMany({
        where: { studentId: profile.id, published: true },
        select: { marks: true, grade: true },
      }),
      db.timetableEntry.findMany({
        where: { courseId: profile.courseId },
        include: timetableInclude,
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      }),
      db.announcement.findMany({
        where: { active: true, audience: { in: ['ALL', 'STUDENTS'] } },
        orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
        take: 4,
      }),
      computeBalance(profile.id),
    ])

    // results summary
    const gradeCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 }
    for (const r of results) gradeCounts[r.grade] = (gradeCounts[r.grade] ?? 0) + 1
    const average = results.length
      ? Math.round((results.reduce((s, r) => s + r.marks, 0) / results.length) * 10) / 10
      : 0
    const gpa = results.length
      ? Math.round((results.reduce((s, r) => s + gradePoints(r.grade), 0) / results.length) * 100) / 100
      : 0

    // today's classes + next 3 upcoming (week-aware)
    const dow = todayDow()
    const currentKey = dow * 1440 + nowMinutes()
    const entryKey = (e: (typeof entries)[number]) =>
      e.dayOfWeek * 1440 + (timeToMinutes(e.startTime) ?? 0)
    const sorted = [...entries].sort((a, b) => entryKey(a) - entryKey(b))
    const today = dow <= 5 ? sorted.filter((e) => e.dayOfWeek === dow) : []
    let upcoming = sorted.filter((e) => entryKey(e) > currentKey)
    if (upcoming.length < 3) {
      const wrapped = sorted.filter((e) => entryKey(e) <= currentKey)
      upcoming = [...upcoming, ...wrapped]
    }
    const nextClasses = upcoming.slice(0, 3).map(mapTimetableEntry)

    return ok({
      profile: {
        name: profile.user.name,
        email: profile.user.email,
        admissionNo: profile.admissionNo,
        course: {
          id: profile.course.id,
          title: profile.course.title,
          category: profile.course.category,
          level: profile.course.level,
        },
        campus: { id: profile.campus.id, name: profile.campus.name },
        yearOfStudy: profile.yearOfStudy,
        currentTerm: profile.currentTerm,
        status: profile.status,
      },
      units,
      fees,
      results: {
        unitsDone: results.length,
        average,
        gpa,
        gradeCounts,
      },
      todayClasses: today.map(mapTimetableEntry),
      nextClasses,
      announcements,
    })
  })
}
