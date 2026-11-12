import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { handle, ok } from '@/lib/api-helpers'
import { subKES } from '@/lib/money'

export const dynamic = 'force-dynamic'

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** Admin dashboard KPIs + chart data (aggregated in SQL — no unbounded row
 * materialisation, so the dashboard stays fast as real data accumulates). */
export async function GET() {
  return handle(async () => {
    await requireRole('ADMIN')
    const now = new Date()
    const fourMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 4, now.getDate())

    const [
      studentsActive,
      applicationsPending,
      applicationsByStatus,
      chargedAgg,
      paidAgg,
      paidThisTermAgg,
      activeByCampus,
      activeByCourse,
      courses,
      campuses,
      recentPaymentRows,
      monthAggs,
    ] = await Promise.all([
      db.studentProfile.count({ where: { status: 'ACTIVE' } }),
      db.application.count({ where: { status: 'PENDING' } }),
      db.application.groupBy({ by: ['status'], _count: { _all: true } }),
      db.feeItem.aggregate({ _sum: { amount: true } }),
      db.payment.aggregate({ where: { status: 'CONFIRMED' }, _sum: { amount: true } }),
      db.payment.aggregate({
        where: { status: 'CONFIRMED', paidAt: { gte: fourMonthsAgo } },
        _sum: { amount: true },
      }),
      db.studentProfile.groupBy({ by: ['campusId'], where: { status: 'ACTIVE' }, _count: { _all: true } }),
      db.studentProfile.groupBy({ by: ['courseId'], where: { status: 'ACTIVE' }, _count: { _all: true } }),
      db.course.findMany({ select: { id: true, title: true, category: true } }),
      db.campus.findMany({ select: { id: true, name: true }, orderBy: { sortOrder: 'asc' } }),
      db.payment.findMany({
        where: { status: 'CONFIRMED' },
        orderBy: { paidAt: 'desc' },
        take: 5,
        include: {
          student: {
            select: {
              admissionNo: true,
              user: { select: { name: true } },
              course: { select: { title: true } },
            },
          },
        },
      }),
      // revenue by month: one bounded aggregate per month (last 8, zero-filled)
      Promise.all(
        Array.from({ length: 8 }, (_, k) => {
          const start = new Date(now.getFullYear(), now.getMonth() - (7 - k), 1)
          const end = new Date(now.getFullYear(), now.getMonth() - (7 - k) + 1, 1)
          return db.payment
            .aggregate({ where: { status: 'CONFIRMED', paidAt: { gte: start, lt: end } }, _sum: { amount: true } })
            .then((agg) => ({ month: monthKey(start), total: agg._sum.amount ?? 0 }))
        }),
      ),
    ])

    const revenueByMonth: { month: string; total: number }[] = monthAggs

    // students by campus / by course category / enrollments by course
    // (counts from SQL groupBys joined against the small course lookup table)
    const courseById = new Map(courses.map((c) => [c.id, c]))
    const byCampus = new Map<string, number>(activeByCampus.map((row) => [row.campusId, row._count._all]))
    const byCategory = new Map<string, number>()
    const byCourse = new Map<string, { course: string; count: number }>()
    for (const row of activeByCourse) {
      const course = courseById.get(row.courseId)
      if (!course) continue
      byCategory.set(course.category, (byCategory.get(course.category) ?? 0) + row._count._all)
      const entry = byCourse.get(row.courseId) ?? { course: course.title, count: 0 }
      entry.count += row._count._all
      byCourse.set(row.courseId, entry)
    }

    const totalCharged = chargedAgg._sum.amount ?? 0
    const totalPaid = paidAgg._sum.amount ?? 0

    // Task 8-c: applications funnel counts (accepted/rejected) + billed total
    const statusCount = (status: string) =>
      applicationsByStatus.find((row) => row.status === status)?._count._all ?? 0

    return ok({
      studentsActive,
      studentsByCampus: campuses.map((c) => ({
        campusId: c.id,
        campus: c.name,
        count: byCampus.get(c.id) ?? 0,
      })),
      studentsByCategory: [...byCategory.entries()].map(([category, count]) => ({ category, count })),
      applicationsPending,
      applicationsAccepted: statusCount('ACCEPTED'),
      applicationsRejected: statusCount('REJECTED'),
      totalBilled: totalCharged,
      collectionsTotal: totalPaid,
      collectionsThisTerm: paidThisTermAgg._sum.amount ?? 0,
      outstandingBalance: subKES(totalCharged, totalPaid),
      revenueByMonth,
      enrollmentsByCourse: [...byCourse.values()].sort((a, b) => b.count - a.count).slice(0, 8),
      recentPayments: recentPaymentRows.map((p) => ({
        id: p.id,
        amount: p.amount,
        method: p.method,
        reference: p.reference,
        paidAt: p.paidAt,
        studentName: p.student.user.name,
        admissionNo: p.student.admissionNo,
        course: p.student.course.title,
      })),
    })
  })
}
