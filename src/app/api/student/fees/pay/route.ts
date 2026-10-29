import { z } from 'zod'
import { db } from '@/lib/db'
import { assertSameOrigin, HttpError } from '@/lib/auth'
import { handle, ok, readJson, uniqueReference } from '@/lib/api-helpers'
import { computeBalance } from '@/lib/fees'
import { currentStudent } from '@/lib/roles'
import { logAudit } from '@/lib/audit'
import { clientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const paySchema = z.object({
  amount: z.coerce
    .number()
    .positive('Amount must be a positive number')
    .max(1_000_000, 'Amount is too large'),
  method: z.enum(['MPESA', 'BANK']),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+?254|0)7\d{8}$/, 'Enter a valid Safaricom number e.g. 0703 710 879')
    .optional(),
})

/**
 * Student self-service payment INTENT (simulated M-Pesa / bank submission).
 *
 * SECURITY: students can no longer self-confirm payments. The record is
 * created with status PENDING and only counts toward the fee balance after
 * the finance office confirms it via PATCH /api/admin/payments/[id].
 * (`computeBalance` sums CONFIRMED payments only.)
 */
export async function POST(req: Request) {
  return handle(async () => {
    assertSameOrigin(req, { requireOrigin: true })
    const { user, profile } = await currentStudent()
    const body = paySchema.parse(await readJson(req))

    if (body.method === 'MPESA' && !body.phone) {
      throw new HttpError(400, 'Phone number is required for M-Pesa payments')
    }

    const reference = await uniqueReference(body.method === 'MPESA' ? 'MPESA' : 'BNK')
    const payment = await db.payment.create({
      data: {
        studentId: profile.id,
        amount: body.amount,
        method: body.method,
        reference,
        // paidAt keeps its schema default (submission timestamp); it is
        // refreshed to the confirmation time when finance confirms.
        status: 'PENDING',
        note: 'Submitted via student portal — awaiting finance confirmation',
        recordedBy: 'Student Portal',
      },
    })

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'PAYMENT_INTENT_CREATED',
      entity: 'payment',
      entityId: payment.id,
      meta: {
        studentId: profile.id,
        admissionNo: profile.admissionNo,
        amount: body.amount,
        method: body.method,
        reference,
      },
      ip: clientIp(req),
    })

    // balance summary reflects CONFIRMED payments only — the new PENDING
    // intent intentionally does not reduce it yet
    const summary = await computeBalance(profile.id)
    return ok({ payment, ...summary }, 201)
  })
}
