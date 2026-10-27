import { db } from '@/lib/db'
import { HttpError } from '@/lib/auth'
import { gradeFor } from '@/lib/api-helpers'

/**
 * Batch upsert of published results with KIP auto-grading
 * (A≥80, B 65–79, C 50–64, D 40–49, E<40). Shared by lecturer & admin routes.
 */
export async function upsertResults(input: {
  unitId: string
  term: string
  entries: { studentId: string; marks: number }[]
}) {
  const unit = await db.unit.findUnique({
    where: { id: input.unitId },
    include: { course: { select: { id: true, title: true, examBody: true } } },
  })
  if (!unit) throw new HttpError(404, 'Unit not found')
  if (input.entries.length === 0) throw new HttpError(400, 'Provide at least one result entry')

  const studentIds = [...new Set(input.entries.map((e) => e.studentId))]
  const students = await db.studentProfile.findMany({
    where: { id: { in: studentIds } },
    select: { id: true, courseId: true, admissionNo: true, user: { select: { name: true } } },
  })
  const byId = new Map(students.map((s) => [s.id, s]))
  for (const sid of studentIds) {
    const s = byId.get(sid)
    if (!s) throw new HttpError(400, 'One of the selected students was not found')
    if (s.courseId !== unit.courseId) {
      throw new HttpError(400, `A selected student is not enrolled in ${unit.course.title}`)
    }
  }

  const saved = await db.$transaction(
    input.entries.map((e) => {
      const { grade, remark } = gradeFor(e.marks)
      return db.result.upsert({
        where: { studentId_unitId: { studentId: e.studentId, unitId: unit.id } },
        create: {
          studentId: e.studentId,
          unitId: unit.id,
          term: input.term,
          marks: e.marks,
          grade,
          remark,
          published: true,
          examBody: unit.course.examBody,
        },
        update: {
          term: input.term,
          marks: e.marks,
          grade,
          remark,
          published: true,
          examBody: unit.course.examBody,
        },
      })
    }),
  )

  return {
    unit: { id: unit.id, code: unit.code, name: unit.name, stageLabel: unit.stageLabel, course: unit.course },
    saved: saved.map((r) => ({
      ...r,
      studentName: byId.get(r.studentId)?.user.name ?? null,
      admissionNo: byId.get(r.studentId)?.admissionNo ?? null,
    })),
  }
}
