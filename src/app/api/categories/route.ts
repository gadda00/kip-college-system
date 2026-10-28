import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    })
    return NextResponse.json({ categories })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 })
  }
}
