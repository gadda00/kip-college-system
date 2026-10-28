import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, HttpError } from '@/lib/auth'

/**
 * GET /api/admin/reports?range=30|90|365 — sales & inventory report
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const range = parseInt(req.nextUrl.searchParams.get('range') || '30')
    const days = [7, 30, 90, 365].includes(range) ? range : 30
    const since = new Date(Date.now() - days * 864e5)

    const orders = await db.order.findMany({
      where: { createdAt: { gte: since } },
      include: { items: true },
      orderBy: { createdAt: 'asc' },
    })
    const paid = orders.filter((o) => o.paymentStatus === 'PAID')

    // Revenue by payment method
    const byMethod: Record<string, number> = { MPESA: 0, COD: 0 }
    for (const o of paid) byMethod[o.paymentMethod] = (byMethod[o.paymentMethod] ?? 0) + o.total

    // Revenue by town
    const townMap = new Map<string, number>()
    for (const o of paid) townMap.set(o.town || 'Pickup', (townMap.get(o.town || 'Pickup') ?? 0) + o.total)
    const byTown = [...townMap.entries()].map(([name, value]) => ({ name, value: Math.round(value) })).sort((a, b) => b.value - a.value)

    // Monthly buckets
    const monthMap = new Map<string, { revenue: number; orders: number }>()
    for (const o of paid) {
      const key = o.createdAt.toISOString().slice(0, 7)
      const cur = monthMap.get(key) ?? { revenue: 0, orders: 0 }
      cur.revenue += o.total
      cur.orders += 1
      monthMap.set(key, cur)
    }
    const monthly = [...monthMap.entries()]
      .map(([month, v]) => ({ month, revenue: Math.round(v.revenue), orders: v.orders }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // Product-level sales
    const prodMap = new Map<string, { name: string; qty: number; revenue: number }>()
    for (const o of paid) {
      for (const it of o.items) {
        const cur = prodMap.get(it.productId) ?? { name: it.name, qty: 0, revenue: 0 }
        cur.qty += it.quantity
        cur.revenue += it.price * it.quantity
        prodMap.set(it.productId, cur)
      }
    }
    const productSales = [...prodMap.values()].sort((a, b) => b.revenue - a.revenue)

    const products = await db.product.findMany()
    const cogs = paid.reduce((s, o) => {
      let orderCost = 0
      for (const it of o.items) {
        const p = products.find((x) => x.id === it.productId)
        orderCost += (p?.costPrice ?? it.price * 0.72) * it.quantity
      }
      return s + orderCost
    }, 0)
    const revenue = paid.reduce((s, o) => s + o.total, 0)

    return NextResponse.json({
      range: days,
      summary: {
        revenue: Math.round(revenue),
        cogs: Math.round(cogs),
        grossProfit: Math.round(revenue - cogs),
        orderCount: paid.length,
        avgOrder: paid.length ? Math.round(revenue / paid.length) : 0,
        cancelledCount: orders.filter((o) => o.status === 'CANCELLED').length,
        deliveryRevenue: Math.round(paid.reduce((s, o) => s + o.deliveryFee, 0)),
        pointsIssued: paid.reduce((s, o) => s + (o.pointsEarned ?? 0), 0),
      },
      byMethod,
      byTown,
      monthly,
      productSales: productSales.slice(0, 30),
    })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ error: 'Failed to build report' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
