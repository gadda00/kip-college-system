import { z } from 'zod'
import { db } from '@/lib/db'
import { assertSameOrigin, HttpError, requireRole } from '@/lib/auth'
import { handle, ok, readJson, uniqueReference } from '@/lib/api-helpers'
import { computeBalance } from '@/lib/fees'
import { logAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/**
 * Payments ledger with student context: ?studentId=&q= filters (both optional).
 * Includes PENDING student-submitted intents awaiting finance review
 * (confirm/reject them via PATCH /api/admin/payments/[id]).
 */
export async function GET(req: Request) {
  return handle(async () => {
    await requireRole('ADMIN')
    const url = new URL(req.url)
    const studentId = url.searchParams.get('studentId')?.trim() ?? ''
    const q = url.searchParams.get('q')?.trim().toLowerCase() ?? ''

    const payments = await db.payment.findMany({
      where: studentId ? { studentId } : undefined,
      include: {
        student: {
          select: {
            admissionNo: true,
            user: { select: { name: true } },
            course: { select: { title: true } },
          },
        },
      },
      orderBy: { paidAt: 'desc' },
    })

    const rows = payments.map((p) => ({
      id: p.id,
      studentId: p.studentId,
      studentName: p.student.user.name,
      admissionNo: p.student.admissionNo,
      course: p.student.course.title,
      amount: p.amount,
      method: p.method,
      reference: p.reference,
      status: p.status,
      paidAt: p.paidAt,
      note: p.note,
      recordedBy: p.recordedBy,
    }))

    const filtered = q
      ? rows.filter((r) =>
          [r.studentName, r.admissionNo, r.reference, r.course, r.note ?? '']
            .join(' ')
            .toLowerCase()
            .includes(q),
        )
      : rows

    return ok(filtered)
  })
}

const recordPaymentSchema = z.object({
  studentId: z.string().min(1, 'studentId is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  method: z.enum(['MPESA', 'BANK', 'CASH']),
  reference: z.string().trim().optional(),
  note: z.string().trim().optional(),
})

/** Record a confirmed payment on behalf of a student. */
export async function POST(req: Request) {
  return handle(async () => {
    assertSameOrigin(req, { requireOrigin: true })
    const admin = await requireRole('ADMIN')
    const body = recordPaymentSchema.parse(await readJson(req))

    const student = await db.studentProfile.findUnique({
      where: { id: body.studentId },
      select: { id: true, admissionNo: true },
    })
    if (!student) throw new HttpError(404, 'Student not found')

    let reference = body.reference?.trim()
    if (reference) {
      const taken = await db.payment.findUnique({ where: { reference }, select: { id: true } })
      if (taken) throw new HttpError(409, 'A payment with this reference already exists')
    } else {
      const prefix = body.method === 'MPESA' ? 'MPESA' : body.method === 'BANK' ? 'BNK' : 'CSH'
      reference = await uniqueReference(prefix)
    }

    const payment = await db.payment.create({
      data: {
        studentId: body.studentId,
        amount: body.amount,
        method: body.method,
        reference,
        paidAt: new Date(),
        status: 'CONFIRMED',
        note: body.note || null,
        recordedBy: admin.name,
      },
      include: {
        student: {
          select: {
            admissionNo: true,
            user: { select: { name: true } },
            course: { select: { title: true } },
          },
        },
      },
    })

    const summary = await computeBalance(body.studentId)
    await logAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'PAYMENT_RECORDED',
      entity: 'payment',
      entityId: payment.id,
      meta: {
        studentId: body.studentId,
        admissionNo: student.admissionNo,
        amount: body.amount,
        method: body.method,
        reference,
        recordedBy: admin.name,
      },
    })
    return ok(
      {
        id: payment.id,
        studentId: payment.studentId,
        studentName: payment.student.user.name,
        admissionNo: payment.student.admissionNo,
        course: payment.student.course.title,
        amount: payment.amount,
        method: payment.method,
        reference: payment.reference,
        status: payment.status,
        paidAt: payment.paidAt,
        note: payment.note,
        recordedBy: payment.recordedBy,
        ...summary,
      },
      201,
    )
  })
}
