import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, HttpError } from '@/lib/auth'

/** GET /api/admin/products?admin=1 — full inventory incl. inactive */
export async function GET() {
  try {
    await requireAdmin()
    const products = await db.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { name: true, slug: true } } },
    })
    const categories = await db.category.findMany({ orderBy: { sortOrder: 'asc' } })
    return NextResponse.json({ products, categories })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ error: 'Failed to load inventory' }, { status: 500 })
  }
}

/** POST /api/admin/products — create a product */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const b = await req.json()
    if (!b.name || !b.categoryId || b.price == null) {
      return NextResponse.json({ error: 'Name, category and price are required' }, { status: 400 })
    }
    const slug = `${String(b.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Math.floor(Math.random() * 900 + 100)}`
    const sku = b.sku || `KIPS-${Math.floor(Math.random() * 9000 + 1000)}`
    const product = await db.product.create({
      data: {
        name: b.name,
        slug,
        description: b.description || 'Quality product from KIPS Kitui.',
        categoryId: b.categoryId,
        price: Math.max(1, parseFloat(b.price) || 1),
        costPrice: parseFloat(b.costPrice) || Math.round(parseFloat(b.price) * 0.72) || 0,
        stock: parseInt(b.stock) || 0,
        lowStockAt: parseInt(b.lowStockAt) || 15,
        image: b.image || null,
        brand: b.brand || null,
        level: b.level || null,
        subject: b.subject || null,
        sku,
        isFeatured: !!b.isFeatured,
        isActive: b.isActive !== false,
      },
    })
    return NextResponse.json({ product })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
