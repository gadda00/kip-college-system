import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, HttpError } from '@/lib/auth'
import { generateReference } from '@/lib/pricing'

/** POST /api/bulk-orders — schools submit a bulk order request */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    const body = await req.json()
    const { schoolName, contactPerson, phone, email, level, items, deliveryTown, notes } = body
    if (!schoolName || !contactPerson || !phone || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'School name, contact person, phone and at least one item are required' },
        { status: 400 }
      )
    }
    // Auto-quote: match item names against catalog where possible
    const names = items.map((i: any) => String(i.name || '').toLowerCase().trim()).filter(Boolean)
    const products = await db.product.findMany({ where: { isActive: true } })
    let quoted = 0
    const enrichedItems = items.map((i: any) => {
      const match = products.find(
        (p) => p.name.toLowerCase().includes(String(i.name).toLowerCase()) || String(i.name).toLowerCase().includes(p.name.toLowerCase().slice(0, 18))
      )
      const unit = match ? match.price : null
      const qty = Math.max(1, parseInt(i.qty) || 1)
      if (unit) quoted += unit * qty
      return { name: i.name, qty, unitPrice: unit, note: i.note || null }
    })

    const bulk = await db.bulkOrder.create({
      data: {
        reference: generateReference('BULK'),
        userId: user?.id ?? null,
        schoolName, contactPerson, phone, email: email || null,
        level: level || null,
        itemsJson: JSON.stringify(enrichedItems),
        status: quoted > 0 ? 'QUOTED' : 'SUBMITTED',
        quotedTotal: quoted > 0 ? Math.round(quoted * 0.95) : null, // 5% school discount
        deliveryTown: deliveryTown || null,
        notes: notes || null,
      },
    })
    return NextResponse.json({ bulk })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to submit bulk order' }, { status: 500 })
  }
}

/** GET /api/bulk-orders — school's own requests */
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) throw new HttpError(401, 'Please sign in')
    const where = user.role === 'ADMIN' || user.role === 'STAFF' ? {} : { userId: user.id }
    const bulkOrders = await db.bulkOrder.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ bulkOrders })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ error: 'Failed to load bulk orders' }, { status: 500 })
  }
}
