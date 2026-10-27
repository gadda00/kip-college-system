import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, HttpError } from '@/lib/auth'

/**
 * GET /api/admin/ai/forecast — inventory demand forecast.
 * Computes sales velocity & days-of-cover per product from real order data,
 * then ranks restocking priority. Pure computation (fast, deterministic).
 */
export async function GET() {
  try {
    await requireAdmin()
    const since = new Date(Date.now() - 30 * 864e5)
    const [orders, products] = await Promise.all([
      db.order.findMany({
        where: { createdAt: { gte: since }, paymentStatus: { in: ['PAID', 'PROCESSING'] } },
        include: { items: true },
      }),
      db.product.findMany({ where: { isActive: true }, include: { category: { select: { name: true } } } }),
    ])

    const qtySold = new Map<string, number>()
    for (const o of orders) for (const it of o.items) qtySold.set(it.productId, (qtySold.get(it.productId) ?? 0) + it.quantity)

    const rows = products
      .map((p) => {
        const sold30 = qtySold.get(p.id) ?? 0
        const velocity = sold30 / 30 // units/day
        const daysCover = velocity > 0 ? Math.round(p.stock / velocity) : 999
        const reorderQty = velocity > 0 ? Math.max(10, Math.ceil(velocity * 45)) : Math.max(5, Math.ceil(p.sold / 12))
        const urgency =
          daysCover <= 7 ? 'CRITICAL' : daysCover <= 14 ? 'HIGH' : daysCover <= 30 ? 'MEDIUM' : 'LOW'
        return {
          id: p.id,
          name: p.name,
          category: p.category.name,
          stock: p.stock,
          sold30,
          velocity: Math.round(velocity * 10) / 10,
          daysCover: daysCover === 999 ? null : daysCover,
          reorderQty,
          urgency,
          potentialRevenue: Math.round(reorderQty * p.price),
        }
      })
      .sort((a, b) => {
        const rank = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
        return rank[a.urgency as keyof typeof rank] - rank[b.urgency as keyof typeof rank] || a.daysCover! - b.daysCover!
      })

    const critical = rows.filter((r) => r.urgency === 'CRITICAL')
    const restockBudget = rows.filter((r) => r.urgency === 'CRITICAL' || r.urgency === 'HIGH').reduce((s, r) => s + r.potentialRevenue, 0)

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      summary: {
        criticalCount: critical.length,
        highCount: rows.filter((r) => r.urgency === 'HIGH').length,
        restockRevenueOpportunity: Math.round(restockBudget),
        totalUnits30: rows.reduce((s, r) => s + r.sold30, 0),
      },
      rows: rows.slice(0, 40),
    })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ error: 'Failed to build forecast' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
