import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, HttpError } from '@/lib/auth'

const PRINT_STATUSES = ['SUBMITTED', 'REVIEWING', 'PRINTING', 'READY', 'COLLECTED', 'CANCELLED']

/** GET /api/admin/print-jobs — all printing jobs */
export async function GET() {
  try {
    await requireAdmin()
    const jobs = await db.printJob.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ jobs })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ error: 'Failed to load print jobs' }, { status: 500 })
  }
}

/** PATCH /api/admin/print-jobs — update status/price */
export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin()
    const { id, status, price, notes } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const data: any = { updatedAt: new Date() }
    if (status) {
      if (!PRINT_STATUSES.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      data.status = status
    }
    if (price !== undefined) data.price = parseFloat(price) || 0
    if (notes !== undefined) data.notes = notes
    const job = await db.printJob.update({ where: { id }, data })
    return NextResponse.json({ job })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ error: 'Failed to update print job' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
