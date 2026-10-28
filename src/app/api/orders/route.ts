import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, HttpError } from '@/lib/auth'
import { getDeliveryFee, pointsForSpend, FREE_DELIVERY_THRESHOLD, generateOrderNumber } from '@/lib/pricing'

/**
 * POST /api/orders — place an order (customer checkout).
 * Validates stock, computes totals server-side, initiates M-Pesa simulation if selected.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    const body = await req.json()
    const {
      items, // [{productId, quantity}]
      paymentMethod, // MPESA | COD
      mpesaPhone,
      deliveryMethod, // DELIVERY | PICKUP
      zoneId,
      address,
      town,
      phone,
      notes,
      usePoints,
    } = body

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 })
    }

    // Resolve products & validate stock
    const productIds = items.map((i: any) => i.productId)
    const products = await db.product.findMany({ where: { id: { in: productIds }, isActive: true } })
    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'Some items are no longer available' }, { status: 400 })
    }

    let subtotal = 0
    const orderItems: any[] = []
    for (const it of items) {
      const prod = products.find((p) => p.id === it.productId)
      if (!prod) continue
      const qty = Math.max(1, Math.min(parseInt(it.quantity) || 1, 99))
      if (prod.stock < qty) {
        return NextResponse.json(
          { error: `Only ${prod.stock} left in stock for ${prod.name}` },
          { status: 409 }
        )
      }
      subtotal += prod.price * qty
      orderItems.push({
        productId: prod.id,
        name: prod.name,
        price: prod.price,
        quantity: qty,
        image: prod.image,
      })
    }

    let deliveryFee = 0
    if (deliveryMethod === 'DELIVERY') {
      deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : getDeliveryFee(zoneId)
    }

    // Loyalty points redemption (1 pt = KES 1), max 30% of subtotal
    let discount = 0
    let pointsUsed = 0
    if (usePoints && user) {
      pointsUsed = Math.min(user.loyaltyPoints, Math.floor(subtotal * 0.3))
      discount = pointsUsed
    }

    const total = Math.max(0, Math.round(subtotal + deliveryFee - discount))

    if (deliveryMethod === 'DELIVERY' && !phone) {
      return NextResponse.json({ error: 'Phone number is required for delivery' }, { status: 400 })
    }
    if (paymentMethod === 'MPESA' && !mpesaPhone) {
      return NextResponse.json({ error: 'M-Pesa phone number is required' }, { status: 400 })
    }

    const isMpesa = paymentMethod === 'MPESA'
    const order = await db.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: user?.id ?? null,
        status: isMpesa ? 'PENDING' : 'CONFIRMED', // COD is confirmed immediately, paid on delivery
        subtotal,
        deliveryFee,
        discount,
        total,
        paymentMethod: isMpesa ? 'MPESA' : 'COD',
        paymentStatus: isMpesa ? 'PROCESSING' : 'PENDING',
        mpesaPhone: isMpesa ? mpesaPhone : null,
        deliveryMethod: deliveryMethod || 'PICKUP',
        address: address || null,
        town: deliveryMethod === 'DELIVERY' ? town || null : null,
        phone: phone || null,
        notes: notes || null,
        // Simulated STK confirmation ~10s after creation
        simulatedConfirmAt: isMpesa ? new Date(Date.now() + 10 * 1000) : null,
        items: { create: orderItems },
      },
      include: { items: true },
    })

    // Deduct stock & increment sold counters
    for (const it of orderItems) {
      await db.product.update({
        where: { id: it.productId },
        data: { stock: { decrement: it.quantity }, sold: { increment: it.quantity } },
      })
    }

    // Redeem points if used
    if (pointsUsed > 0 && user) {
      await db.user.update({ where: { id: user.id }, data: { loyaltyPoints: { decrement: pointsUsed } } })
    }

    return NextResponse.json({ order })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to place order. Please try again.' }, { status: 500 })
  }
}

/**
 * GET /api/orders — current user's orders
 */
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) throw new HttpError(401, 'Please sign in')
    const orders = await db.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
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
