import { db } from '@/lib/db'

/**
 * Fee ledger for one student:
 * totalCharged = Σ FeeItem.amount, totalPaid = Σ CONFIRMED Payment.amount.
 */
export async function computeBalance(studentId: string): Promise<{
  totalCharged: number
  totalPaid: number
  balance: number
}> {
  const [charged, paid] = await Promise.all([
    db.feeItem.aggregate({ where: { studentId }, _sum: { amount: true } }),
    db.payment.aggregate({ where: { studentId, status: 'CONFIRMED' }, _sum: { amount: true } }),
  ])
  const totalCharged = charged._sum.amount ?? 0
  const totalPaid = paid._sum.amount ?? 0
  return { totalCharged, totalPaid, balance: Math.round((totalCharged - totalPaid) * 100) / 100 }
}

/**
 * Fee ledgers for many students in one pass (groupBy aggregates merged in JS).
 * Returns a map of studentId → { totalCharged, totalPaid, balance }.
 */
export async function computeBalances(studentIds: string[]): Promise<Map<string, { totalCharged: number; totalPaid: number; balance: number }>> {
  const ids = [...new Set(studentIds)]
  const result = new Map<string, { totalCharged: number; totalPaid: number; balance: number }>()
  for (const id of ids) result.set(id, { totalCharged: 0, totalPaid: 0, balance: 0 })
  if (ids.length === 0) return result

  const [feeAgg, payAgg] = await Promise.all([
    db.feeItem.groupBy({ by: ['studentId'], where: { studentId: { in: ids } }, _sum: { amount: true } }),
    db.payment.groupBy({
      by: ['studentId'],
      where: { studentId: { in: ids }, status: 'CONFIRMED' },
      _sum: { amount: true },
    }),
  ])
  for (const row of feeAgg) {
    const entry = result.get(row.studentId)
    if (entry) entry.totalCharged = row._sum.amount ?? 0
  }
  for (const row of payAgg) {
    const entry = result.get(row.studentId)
    if (entry) entry.totalPaid = row._sum.amount ?? 0
  }
  for (const entry of result.values()) {
    entry.balance = Math.round((entry.totalCharged - entry.totalPaid) * 100) / 100
  }
  return result
}
