import { db } from '@/lib/db'
import { handle, ok } from '@/lib/api-helpers'
import { computeBalance } from '@/lib/fees'
import { currentStudent } from '@/lib/roles'

export const dynamic = 'force-dynamic'

/** Student fee statement: fee items + payments + balance. */
export async function GET() {
  return handle(async () => {
    const { profile } = await currentStudent()
    const [feeItems, payments, summary] = await Promise.all([
      db.feeItem.findMany({ where: { studentId: profile.id }, orderBy: { createdAt: 'desc' } }),
      db.payment.findMany({ where: { studentId: profile.id }, orderBy: { paidAt: 'desc' } }),
      computeBalance(profile.id),
    ])
    return ok({ feeItems, payments, ...summary })
  })
}
