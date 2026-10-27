import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { handle, ok } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** Admin dashboard KPIs + chart data. */
export async function GET() {
  return handle(async () => {
    await requireRole('ADMIN')
    const now = new Date()
    const fourMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 4, now.getDate())
    const eightMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 7, 1)

    const [
      studentsActive,
      applicationsPending,
      applicationsByStatus,
      chargedAgg,
      paidAgg,
      paidThisTermAgg,
      activeStudents,
      campuses,
      recentPaymentRows,
      payments8mo,
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
      db.studentProfile.findMany({
        where: { status: 'ACTIVE' },
        select: { courseId: true, campusId: true, course: { select: { title: true, category: true } } },
      }),
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
      db.payment.findMany({
        where: { status: 'CONFIRMED', paidAt: { gte: eightMonthsAgo } },
        select: { paidAt: true, amount: true },
      }),
    ])

    // revenue by month (last 8 months, zero-filled)
    const byMonth = new Map<string, number>()
    for (const p of payments8mo) {
      const key = monthKey(p.paidAt)
      byMonth.set(key, (byMonth.get(key) ?? 0) + p.amount)
    }
    const revenueByMonth: { month: string; total: number }[] = []
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      revenueByMonth.push({ month: monthKey(d), total: byMonth.get(monthKey(d)) ?? 0 })
    }

    // students by campus / by course category / enrollments by course
    const byCampus = new Map<string, number>()
    const byCategory = new Map<string, number>()
    const byCourse = new Map<string, { course: string; count: number }>()
    for (const s of activeStudents) {
      byCampus.set(s.campusId, (byCampus.get(s.campusId) ?? 0) + 1)
      byCategory.set(s.course.category, (byCategory.get(s.course.category) ?? 0) + 1)
      const entry = byCourse.get(s.courseId) ?? { course: s.course.title, count: 0 }
      entry.count += 1
      byCourse.set(s.courseId, entry)
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
      outstandingBalance: Math.round((totalCharged - totalPaid) * 100) / 100,
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
