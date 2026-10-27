import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, HttpError } from '@/lib/auth'

const BULK_STATUSES = ['SUBMITTED', 'QUOTED', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED']
const PRINT_STATUSES = ['SUBMITTED', 'REVIEWING', 'PRINTING', 'READY', 'COLLECTED', 'CANCELLED']

/** GET /api/admin/bulk-orders — all school bulk orders */
export async function GET() {
  try {
    await requireAdmin()
    const bulkOrders = await db.bulkOrder.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ bulkOrders })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ error: 'Failed to load bulk orders' }, { status: 500 })
  }
}

/** PATCH /api/admin/bulk-orders — update status/quote (body: {id, status, quotedTotal, notes}) */
export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin()
    const { id, status, quotedTotal, notes } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const data: any = { updatedAt: new Date() }
    if (status) {
      if (!BULK_STATUSES.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      data.status = status
    }
    if (quotedTotal !== undefined) data.quotedTotal = parseFloat(quotedTotal) || null
    if (notes !== undefined) data.notes = notes
    const bulk = await db.bulkOrder.update({ where: { id }, data })
    return NextResponse.json({ bulk })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ error: 'Failed to update bulk order' }, { status: 500 })
  }
}

/** DELETE /api/admin/bulk-orders?id= — remove a bulk order */
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin()
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await db.bulkOrder.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
