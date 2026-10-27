import { z } from 'zod'
import { db } from '@/lib/db'
import { HttpError } from '@/lib/auth'
import { handle, ok, readJson, uniqueReference } from '@/lib/api-helpers'
import { computeBalance } from '@/lib/fees'
import { currentStudent } from '@/lib/roles'

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

/** Student self-service payment (simulated M-Pesa / bank confirmation). */
export async function POST(req: Request) {
  return handle(async () => {
    const { profile } = await currentStudent()
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
        paidAt: new Date(),
        status: 'CONFIRMED',
        note: 'Self-service payment via portal',
        recordedBy: 'Student Portal',
      },
    })

    const summary = await computeBalance(profile.id)
    return ok({ payment, ...summary }, 201)
  })
}
