import { z } from 'zod'
import { db } from '@/lib/db'
import { assertSameOrigin, HttpError, requireRole } from '@/lib/auth'
import { handle, ok, readJson, routeParams } from '@/lib/api-helpers'
import { computeBalance } from '@/lib/fees'
import { logAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const actionSchema = z.object({
  action: z.enum(['confirm', 'reject'], { message: 'action must be confirm or reject' }),
})

/**
 * Finance review of a student-submitted PENDING payment intent.
 *
 * PATCH /api/admin/payments/[id]  body: { action: 'confirm' | 'reject' }
 *   confirm → status CONFIRMED, paidAt = now, note + ' — confirmed by finance',
 *             recordedBy = the admin's name (balance now includes it).
 *   reject   → status REJECTED, note + ' — rejected by finance'.
 * Only PENDING payments can be reviewed; returns the updated payment row
 * (same shape as GET /api/admin/payments rows, plus the student's refreshed
 * balance summary when confirming).
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    assertSameOrigin(req, { requireOrigin: true })
    const admin = await requireRole('ADMIN')
    const { id } = await routeParams(params)
    const body = actionSchema.parse(await readJson(req))

    const studentInclude = {
      student: {
        select: {
          admissionNo: true,
          user: { select: { name: true } },
          course: { select: { title: true } },
        },
      },
    } as const

    const existing = await db.payment.findUnique({ where: { id }, include: studentInclude })
    if (!existing) throw new HttpError(404, 'Payment not found')
    if (existing.status !== 'PENDING') {
      throw new HttpError(400, 'This payment has already been reviewed by finance')
    }

    const confirming = body.action === 'confirm'
    const noteSuffix = confirming ? 'confirmed by finance' : 'rejected by finance'
    const updated = await db.payment.update({
      where: { id },
      data: {
        status: confirming ? 'CONFIRMED' : 'REJECTED',
        ...(confirming ? { paidAt: new Date(), recordedBy: admin.name } : {}),
        note: existing.note ? `${existing.note} — ${noteSuffix}` : noteSuffix,
      },
      include: studentInclude,
    })

    await logAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: confirming ? 'PAYMENT_CONFIRMED' : 'PAYMENT_REJECTED',
      entity: 'payment',
      entityId: id,
      meta: {
        studentId: updated.studentId,
        admissionNo: updated.student.admissionNo,
        amount: updated.amount,
        method: updated.method,
        reference: updated.reference,
        recordedBy: admin.name,
      },
    })

    // include the refreshed balance for the affected student on confirmation
    const summary = confirming ? await computeBalance(updated.studentId) : undefined
    return ok({
      id: updated.id,
      studentId: updated.studentId,
      studentName: updated.student.user.name,
      admissionNo: updated.student.admissionNo,
      course: updated.student.course.title,
      amount: updated.amount,
      method: updated.method,
      reference: updated.reference,
      status: updated.status,
      paidAt: updated.paidAt,
      note: updated.note,
      recordedBy: updated.recordedBy,
      ...(summary ?? {}),
    })
  })
}
