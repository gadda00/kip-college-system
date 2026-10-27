import { NextRequest, NextResponse } from 'next/server'
import { calcPrintPrice, PrintSpec, PRINT_RATES, BINDING_RATES } from '@/lib/pricing'

/** POST /api/print/calc — live price quote for printing */
export async function POST(req: NextRequest) {
  try {
    const { pages, copies, paperSize, colorMode, doubleSided, binding } = await req.json()
    const spec: PrintSpec = {
      pages: Math.max(1, Math.min(parseInt(pages) || 1, 2000)),
      copies: Math.max(1, Math.min(parseInt(copies) || 1, 1000)),
      paperSize: ['A4', 'A3', 'A5', 'LEGAL'].includes(paperSize) ? paperSize : 'A4',
      colorMode: ['BW', 'COLOR', 'MIXED'].includes(colorMode) ? colorMode : 'BW',
      doubleSided: !!doubleSided,
      binding: ['NONE', 'STAPLE', 'SPIRAL', 'TAPE', 'HARD_COVER'].includes(binding) ? binding : 'NONE',
    }
    const price = calcPrintPrice(spec)
    return NextResponse.json({ price, spec })
  } catch {
    return NextResponse.json({ error: 'Failed to calculate' }, { status: 500 })
  }
}

/** GET — expose the current rate card */
export async function GET() {
  return NextResponse.json({ PRINT_RATES, BINDING_RATES })
}
