import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, HttpError } from '@/lib/auth'
import { generateReference, calcPrintPrice, PrintSpec } from '@/lib/pricing'

/** POST /api/print-jobs — submit a printing job (with live server-side pricing) */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    const body = await req.json()
    const { customerName, phone, email, documentName, pages, copies, paperSize, colorMode, doubleSided, binding, notes } = body

    if (!customerName || !phone || !documentName || !pages) {
      return NextResponse.json({ error: 'Name, phone, document name and pages are required' }, { status: 400 })
    }
    const spec: PrintSpec = {
      pages: Math.max(1, Math.min(parseInt(pages) || 1, 2000)),
      copies: Math.max(1, Math.min(parseInt(copies) || 1, 1000)),
      paperSize: ['A4', 'A3', 'A5', 'LEGAL'].includes(paperSize) ? paperSize : 'A4',
      colorMode: ['BW', 'COLOR', 'MIXED'].includes(colorMode) ? colorMode : 'BW',
      doubleSided: !!doubleSided,
      binding: ['NONE', 'STAPLE', 'SPIRAL', 'TAPE', 'HARD_COVER'].includes(binding) ? binding : 'NONE',
    }
    const price = calcPrintPrice(spec)
    const job = await db.printJob.create({
      data: {
        reference: generateReference('PRN'),
        userId: user?.id ?? null,
        customerName, phone, email: email || null,
        documentName,
        ...spec,
        price,
        notes: notes || null,
        status: 'SUBMITTED',
      },
    })
    return NextResponse.json({ job, price })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to submit print job' }, { status: 500 })
  }
}

/** GET /api/print-jobs — user's own print jobs */
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) throw new HttpError(401, 'Please sign in')
    const where = user.role === 'ADMIN' || user.role === 'STAFF' ? {} : { userId: user.id }
    const jobs = await db.printJob.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ jobs })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ error: 'Failed to load print jobs' }, { status: 500 })
  }
}
