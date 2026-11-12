import { z } from 'zod'
import { db } from '@/lib/db'
import { assertSameOrigin, HttpError } from '@/lib/auth'
import { handle, kesAmount, ok, readJson, uniqueReference } from '@/lib/api-helpers'
import { computeBalance } from '@/lib/fees'
import { currentStudent } from '@/lib/roles'
import { logAudit } from '@/lib/audit'
import { clientIp, rateLimited, RATE_LIMITS } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const paySchema = z.object({
  amount: kesAmount(),
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
    // per-student brake: scripted submission spam cannot flood the finance
    // queue with thousands of PENDING rows per minute
    if (rateLimited(`fees-pay:${user.id}`, RATE_LIMITS.feesPay.limit, RATE_LIMITS.feesPay.windowMs)) {
      throw new HttpError(429, 'Too many payment submissions — please wait a minute and try again')
    }
    const body = paySchema.parse(await readJson(req))

    if (body.method === 'MPESA' && !body.phone) {
      throw new HttpError(400, 'Phone number is required for M-Pesa payments')
    }

    // Double-submit guard: an identical PENDING intent from the last minute
    // is almost certainly a double-click, not a second genuine payment.
    // (Payment has no createdAt; paidAt starts as the submission timestamp.)
    const dupe = await db.payment.findFirst({
      where: {
        studentId: profile.id,
        amount: body.amount,
        method: body.method,
        status: 'PENDING',
        paidAt: { gte: new Date(Date.now() - 60_000) },
      },
      select: { id: true },
    })
    if (dupe) {
      throw new HttpError(
        409,
        'An identical payment submission is already awaiting finance confirmation — please wait a minute before submitting again',
      )
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
