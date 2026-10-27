import { z } from 'zod'
import { db } from '@/lib/db'
import { HttpError, requireRole } from '@/lib/auth'
import { handle, ok, readJson } from '@/lib/api-helpers'
import { computeBalance } from '@/lib/fees'

export const dynamic = 'force-dynamic'

/** Fee statement for one student (admin view): ?studentId= is required. */
export async function GET(req: Request) {
  return handle(async () => {
    await requireRole('ADMIN')
    const studentId = new URL(req.url).searchParams.get('studentId')?.trim() ?? ''
    if (!studentId) throw new HttpError(400, 'studentId query parameter is required')

    const student = await db.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        course: { select: { id: true, title: true, code: true } },
        campus: { select: { id: true, name: true } },
      },
    })
    if (!student) throw new HttpError(404, 'Student not found')

    const [feeItems, payments, summary] = await Promise.all([
      db.feeItem.findMany({ where: { studentId }, orderBy: { createdAt: 'desc' } }),
      db.payment.findMany({ where: { studentId }, orderBy: { paidAt: 'desc' } }),
      computeBalance(studentId),
    ])

    return ok({
      student: {
        id: student.id,
        name: student.user.name,
        email: student.user.email,
        phone: student.user.phone,
        admissionNo: student.admissionNo,
        course: student.course,
        campus: student.campus,
        status: student.status,
        currentTerm: student.currentTerm,
      },
      feeItems,
      payments,
      ...summary,
    })
  })
}

const postFeeSchema = z
  .object({
    studentId: z.string().min(1).optional(),
    courseId: z.string().min(1).optional(),
    term: z.string().trim().min(1, 'Term is required'),
    type: z.enum(['TUITION', 'REGISTRATION', 'EXAM', 'OTHER']),
    description: z.string().trim().min(2, 'Description is required'),
    amount: z.coerce.number().positive('Amount must be positive'),
    dueDate: z.coerce.date().optional(),
  })
  .refine((b) => (b.studentId ? 1 : 0) + (b.courseId ? 1 : 0) === 1, {
    message: 'Provide exactly one of studentId or courseId',
  })

/** Post a fee item to one student, or bulk-post to all ACTIVE students of a course. */
export async function POST(req: Request) {
  return handle(async () => {
    await requireRole('ADMIN')
    const body = postFeeSchema.parse(await readJson(req))

    if (body.studentId) {
      const student = await db.studentProfile.findUnique({
        where: { id: body.studentId },
        select: { id: true, admissionNo: true },
      })
      if (!student) throw new HttpError(404, 'Student not found')

      const feeItem = await db.feeItem.create({
        data: {
          studentId: body.studentId,
          term: body.term,
          type: body.type,
          description: body.description,
          amount: body.amount,
          dueDate: body.dueDate ?? null,
        },
      })
      const summary = await computeBalance(body.studentId)
      return ok({ posted: 1, feeItem, ...summary }, 201)
    }

    const course = await db.course.findUnique({
      where: { id: body.courseId },
      select: { id: true, title: true },
    })
    if (!course) throw new HttpError(404, 'Course not found')

    const students = await db.studentProfile.findMany({
      where: { courseId: course.id, status: 'ACTIVE' },
      select: { id: true },
    })
    if (students.length === 0) {
      return ok({ posted: 0, note: 'No active students in this course' }, 201)
    }

    const result = await db.feeItem.createMany({
      data: students.map((s) => ({
        studentId: s.id,
        term: body.term,
        type: body.type,
        description: body.description,
        amount: body.amount,
        dueDate: body.dueDate ?? null,
      })),
    })
    return ok({ posted: result.count, course: course.title }, 201)
  })
}
