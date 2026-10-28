import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { mpesaReceipt, pointsForSpend } from '@/lib/pricing'

/**
 * GET /api/orders/[orderNumber] — track an order.
 * Simulates the M-Pesa callback: once simulatedConfirmAt passes, payment completes
 * and loyalty points are awarded. This models the real Daraja STK→callback flow.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ orderNumber: string }> }) {
  try {
    const { orderNumber } = await params
    let order = await db.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // ---- Simulated M-Pesa callback ----
    if (
      order.paymentStatus === 'PROCESSING' &&
      order.simulatedConfirmAt &&
      new Date(order.simulatedConfirmAt) <= new Date()
    ) {
      const receipt = mpesaReceipt()
      const earned = pointsForSpend(order.total)
      order = await db.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          mpesaRef: receipt,
          status: order.status === 'PENDING' ? 'CONFIRMED' : order.status,
          pointsEarned: earned,
          updatedAt: new Date(),
        },
        include: { items: true },
      })
      if (order.userId && earned > 0) {
        await db.user.update({
          where: { id: order.userId },
          data: { loyaltyPoints: { increment: earned } },
        })
      }
    }

    // Privacy: orders linked to a user can only be tracked by that user (or staff)
    const user = await getCurrentUser()
    const isOwner = !order.userId || (user && order.userId === user.id)
    const isStaff = user && (user.role === 'ADMIN' || user.role === 'STAFF')
    if (!isOwner && !isStaff) {
      return NextResponse.json({ error: 'Not authorised to view this order' }, { status: 403 })
    }

    return NextResponse.json({ order })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to load order' }, { status: 500 })
  }
}
