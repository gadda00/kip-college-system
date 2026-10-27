import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, HttpError } from '@/lib/auth'

/** GET /api/admin/stats — dashboard KPIs, charts and alerts */
export async function GET() {
  try {
    await requireAdmin()
    const now = new Date()
    const d30 = new Date(now.getTime() - 30 * 864e5)
    const d60 = new Date(now.getTime() - 60 * 864e5)
    const d7 = new Date(now.getTime() - 7 * 864e5)

    const [orders, products, users, bulkOrders, printJobs, messages] = await Promise.all([
      db.order.findMany({ where: { createdAt: { gte: d60 } }, include: { items: true }, orderBy: { createdAt: 'asc' } }),
      db.product.findMany({ include: { category: { select: { name: true } } } }),
      db.user.findMany(),
      db.bulkOrder.findMany(),
      db.printJob.findMany(),
      db.contactMessage.findMany(),
    ])

    const paidOrders = orders.filter((o) => o.paymentStatus === 'PAID')
    const last30 = paidOrders.filter((o) => o.createdAt >= d30)
    const prev30 = paidOrders.filter((o) => o.createdAt < d30 && o.createdAt >= d60)
    const revenue30 = last30.reduce((s, o) => s + o.total, 0)
    const revenuePrev30 = prev30.reduce((s, o) => s + o.total, 0)
    const orders7 = orders.filter((o) => o.createdAt >= d7)

    // Revenue by day (last 14 days)
    const days: { date: string; revenue: number; orders: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const start = new Date(now.getTime() - i * 864e5)
      start.setHours(0, 0, 0, 0)
      const end = new Date(start.getTime() + 864e5)
      const dayOrders = paidOrders.filter((o) => o.createdAt >= start && o.createdAt < end)
      days.push({
        date: start.toISOString().slice(5, 10),
        revenue: Math.round(dayOrders.reduce((s, o) => s + o.total, 0)),
        orders: dayOrders.length,
      })
    }

    // Category sales distribution
    const catMap = new Map<string, number>()
    for (const o of last30) {
      for (const it of o.items) {
        const prod = products.find((p) => p.id === it.productId)
        const catName = prod?.category?.name ?? 'Other'
        catMap.set(catName, (catMap.get(catName) ?? 0) + it.price * it.quantity)
      }
    }
    const categorySales = [...catMap.entries()]
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)

    // Top products
    const topMap = new Map<string, { name: string; qty: number; revenue: number }>()
    for (const o of paidOrders) {
      for (const it of o.items) {
        const cur = topMap.get(it.productId) ?? { name: it.name, qty: 0, revenue: 0 }
        cur.qty += it.quantity
        cur.revenue += it.price * it.quantity
        topMap.set(it.productId, cur)
      }
    }
    const topProducts = [...topMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 6)

    const lowStock = products
      .filter((p) => p.isActive && p.stock <= p.lowStockAt)
      .sort((a, b) => a.stock - b.stock)
      .map((p) => ({ id: p.id, name: p.name, stock: p.stock, lowStockAt: p.lowStockAt, category: p.category.name }))

    const inventoryValue = products.reduce((s, p) => s + p.price * p.stock, 0)
    const costValue = products.reduce((s, p) => s + p.costPrice * p.stock, 0)

    const statusCounts: Record<string, number> = {}
    for (const o of orders) statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1

    const recentOrders = await db.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { user: { select: { name: true } }, items: { take: 1 } },
    })

    return NextResponse.json({
      kpis: {
        revenue30: Math.round(revenue30),
        revenueChange: revenuePrev30 > 0 ? Math.round(((revenue30 - revenuePrev30) / revenuePrev30) * 100) : revenue30 > 0 ? 100 : 0,
        orders30: last30.length,
        orders7: orders7.length,
        avgOrder: last30.length ? Math.round(revenue30 / last30.length) : 0,
        customers: users.filter((u) => u.role === 'CUSTOMER' || u.role === 'SCHOOL').length,
        newCustomers30: users.filter((u) => (u.role === 'CUSTOMER' || u.role === 'SCHOOL') && u.createdAt >= d30).length,
        pendingBulk: bulkOrders.filter((b) => ['SUBMITTED', 'QUOTED', 'APPROVED'].includes(b.status)).length,
        activePrintJobs: printJobs.filter((p) => !['COLLECTED', 'CANCELLED'].includes(p.status)).length,
        unreadMessages: messages.filter((m) => m.status === 'NEW').length,
        inventoryValue: Math.round(inventoryValue),
        potentialProfit: Math.round(inventoryValue - costValue),
        lowStockCount: lowStock.length,
        productCount: products.filter((p) => p.isActive).length,
      },
      days,
      categorySales,
      topProducts,
      lowStock: lowStock.slice(0, 10),
      statusCounts,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customer: o.user?.name ?? 'Guest',
        total: o.total,
        status: o.status,
        paymentStatus: o.paymentStatus,
        itemCount: o.items.length,
        createdAt: o.createdAt,
      })),
    })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
