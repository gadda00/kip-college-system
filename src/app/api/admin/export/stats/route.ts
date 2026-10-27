import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { handle, ok } from '@/lib/api-helpers'
import { computeBalances } from '@/lib/fees'

export const dynamic = 'force-dynamic'

/**
 * Task 8-c — live counts powering the "Reports & Exports" cards and the
 * announcements audience preview.
 *
 * GET /api/admin/export/stats[?paymentsFrom=YYYY-MM-DD&paymentsTo=YYYY-MM-DD]
 *
 * paymentsFrom/paymentsTo (both optional) narrow the payments count the same
 * way the payments CSV export is filtered, so the card's live row count
 * follows the selected date range.
 */
export async function GET(req: Request) {
  return handle(async () => {
    await requireRole('ADMIN')

    const url = new URL(req.url)
    const paymentsFrom = url.searchParams.get('paymentsFrom')?.trim() ?? ''
    const paymentsTo = url.searchParams.get('paymentsTo')?.trim() ?? ''
    const fromDate = paymentsFrom ? new Date(`${paymentsFrom}T00:00:00`) : null
    const toDate = paymentsTo ? new Date(`${paymentsTo}T23:59:59.999`) : null

    const [students, payments, applications, results, studentRows, staff] = await Promise.all([
      db.studentProfile.count(),
      db.payment.count({
        where: {
          ...(fromDate || toDate
            ? {
                paidAt: {
                  ...(fromDate && !Number.isNaN(fromDate.getTime()) ? { gte: fromDate } : {}),
                  ...(toDate && !Number.isNaN(toDate.getTime()) ? { lte: toDate } : {}),
                },
              }
            : {}),
        },
      }),
      db.application.count(),
      db.result.count(),
      db.studentProfile.findMany({ select: { id: true }, orderBy: { admissionNo: 'asc' } }),
      db.user.count({ where: { role: { in: ['LECTURER', 'ADMIN'] } } }),
    ])

    // students carrying a positive balance (fees-outstanding export rows)
    const balances = await computeBalances(studentRows.map((s) => s.id))
    let feesOutstanding = 0
    for (const bal of balances.values()) {
      if (bal.balance > 0) feesOutstanding += 1
    }

    return ok({
      students,
      payments,
      applications,
      results,
      feesOutstanding,
      // announcement audience sizes (ALL = students + staff)
      audienceStudents: students,
      audienceStaff: staff,
      audienceAll: students + staff,
    })
  })
}
