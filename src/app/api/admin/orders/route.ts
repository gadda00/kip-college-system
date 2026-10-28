import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, HttpError } from '@/lib/auth'

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']
const PAYMENT_STATUSES = ['PENDING', 'PROCESSING', 'PAID', 'FAILED']

/** GET /api/admin/orders?status=&q=&page= — all orders with filters */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const sp = req.nextUrl.searchParams
    const status = sp.get('status') || ''
    const q = sp.get('q')?.trim() || ''
    const orders = await db.order.findMany({
      where: {
        ...(status && { status }),
        ...(q && {
          OR: [{ orderNumber: { contains: q } }, { phone: { contains: q } }, { town: { contains: q } }, { mpesaRef: { contains: q } }],
        }),
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        user: { select: { name: true, email: true } },
        items: true,
      },
    })
    return NextResponse.json({ orders })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 })
  }
}

/** PATCH /api/admin/orders — update status (body: {orderId, status, paymentStatus}) */
export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin()
    const { orderId, status, paymentStatus } = await req.json()
    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 })
    const data: any = { updatedAt: new Date() }
    if (status) {
      if (!ORDER_STATUSES.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      data.status = status
    }
    if (paymentStatus) {
      if (!PAYMENT_STATUSES.includes(paymentStatus)) return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })
      data.paymentStatus = paymentStatus
      if (paymentStatus === 'PAID' && !data.mpesaRef) data.mpesaRef = 'MANUAL-CONFIRM'
    }
    const order = await db.order.update({ where: { id: orderId }, data })
    return NextResponse.json({ order })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
