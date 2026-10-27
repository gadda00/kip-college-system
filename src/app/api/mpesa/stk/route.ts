import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mpesaCheckoutId } from '@/lib/pricing'

/**
 * POST /api/mpesa/stk — simulate M-Pesa Express (Lipa na M-Pesa) STK Push.
 * In production this calls Daraja /stkpush; here we return a checkout request id
 * and schedule a simulated callback completion on the order.
 */
export async function POST(req: NextRequest) {
  try {
    const { orderNumber, phone } = await req.json()
    const order = await db.order.findUnique({ where: { orderNumber } })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({ error: 'Order is already paid' }, { status: 409 })
    }
    const checkoutId = mpesaCheckoutId()
    const customerMessage = order.mpesaPhone
      ? `An M-Pesa request of KES ${order.total.toLocaleString()} has been sent to ${order.mpesaPhone}. Enter your M-Pesa PIN to authorise payment.`
      : 'STK push sent'
    await db.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PROCESSING',
        mpesaPhone: phone || order.mpesaPhone,
        simulatedConfirmAt: new Date(Date.now() + 10 * 1000),
      },
    })
    return NextResponse.json({
      CheckoutRequestID: checkoutId,
      CustomerMessage: customerMessage,
      MerchantRequestId: `29115-${Date.now()}`,
      ResponseCode: '0',
      ResponseDescription: 'Success. Request accepted for processing',
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to initiate M-Pesa request' }, { status: 500 })
  }
}
