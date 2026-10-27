import { db } from '@/lib/db'
import { handle, ok } from '@/lib/api-helpers'
import { HttpError } from '@/lib/auth'
import { currentLecturer } from '@/lib/roles'

export const dynamic = 'force-dynamic'

/** KIP grading scale pass mark (C and above). */
const PASS_MARK = 50

/** Class roster: unit details + enrolled students + their existing results for the unit + class analytics. */
export async function GET(_req: Request, { params }: { params: Promise<{ unitId: string }> }) {
  return handle(async () => {
    const { profile } = await currentLecturer()
    const { unitId } = await params

    const teaches = await db.timetableEntry.findFirst({
      where: { unitId, lecturerId: profile.id },
      select: { id: true },
    })
    if (!teaches) throw new HttpError(404, 'You do not teach this unit')

    const unit = await db.unit.findUnique({
      where: { id: unitId },
      include: { course: { select: { id: true, code: true, title: true, category: true, level: true } } },
    })
    if (!unit) throw new HttpError(404, 'Unit not found')

    const students = await db.studentProfile.findMany({
      where: { courseId: unit.courseId, status: 'ACTIVE', currentTerm: unit.stage },
      include: { user: { select: { name: true, phone: true, email: true } } },
      orderBy: { admissionNo: 'asc' },
    })

    const results = await db.result.findMany({
      where: { unitId, studentId: { in: students.map((s) => s.id) } },
    })
    const resultsByStudent = new Map(results.map((r) => [r.studentId, r]))

    // ---- class analytics (one result per student; Result is unique per student+unit) ----
    const marks = results.map((r) => r.marks)
    const gradeCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 }
    for (const r of results) {
      if (r.grade in gradeCounts) gradeCounts[r.grade] = (gradeCounts[r.grade] ?? 0) + 1
    }
    const round1 = (v: number) => Math.round(v * 10) / 10
    const analytics = {
      totalStudents: students.length,
      withResults: results.length,
      average: marks.length ? round1(marks.reduce((s, m) => s + m, 0) / marks.length) : null,
      highest: marks.length ? Math.max(...marks) : null,
      lowest: marks.length ? Math.min(...marks) : null,
      passRate: marks.length
        ? round1((marks.filter((m) => m >= PASS_MARK).length / marks.length) * 100)
        : null,
      gradeCounts,
    }

    return ok({
      unit: {
        id: unit.id,
        code: unit.code,
        name: unit.name,
        stage: unit.stage,
        stageLabel: unit.stageLabel,
        weekHours: unit.weekHours,
        course: unit.course,
      },
      students: students.map((s) => ({
        id: s.id,
        name: s.user.name,
        admissionNo: s.admissionNo,
        phone: s.user.phone,
        email: s.user.email,
        currentTerm: s.currentTerm,
        result: resultsByStudent.get(s.id) ?? null,
      })),
      analytics,
    })
  })
}
