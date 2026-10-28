import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, HttpError } from '@/lib/auth'

/** GET /api/admin/customers — customer list with order stats */
export async function GET() {
  try {
    await requireAdmin()
    const users = await db.user.findMany({
      where: { role: { in: ['CUSTOMER', 'SCHOOL'] } },
      orderBy: { createdAt: 'desc' },
      include: {
        orders: { select: { total: true, paymentStatus: true, createdAt: true } },
        staffProfile: true,
      },
    })
    const customers = users.map((u) => {
      const paid = u.orders.filter((o) => o.paymentStatus === 'PAID')
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        schoolName: u.schoolName,
        town: u.town,
        loyaltyPoints: u.loyaltyPoints,
        createdAt: u.createdAt,
        orderCount: u.orders.length,
        totalSpent: paid.reduce((s, o) => s + o.total, 0),
        lastOrderAt: u.orders.length ? u.orders.map((o) => o.createdAt).sort((a, b) => b - a)[0] : null,
      }
    })
    return NextResponse.json({ customers })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ error: 'Failed to load customers' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
