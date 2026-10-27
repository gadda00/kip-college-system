import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const q = sp.get('q')?.trim() || ''
    const category = sp.get('category') || ''
    const level = sp.get('level') || ''
    const subject = sp.get('subject') || ''
    const featured = sp.get('featured')
    const minPrice = sp.get('minPrice')
    const maxPrice = sp.get('maxPrice')
    const sort = sp.get('sort') || 'popular'
    const limit = Math.min(parseInt(sp.get('limit') || '60'), 120)
    const admin = sp.get('admin') === '1'

    const where: Prisma.ProductWhereInput = {
      isActive: admin ? undefined : true,
      ...(q && {
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
          { brand: { contains: q } },
          { subject: { contains: q } },
        ],
      }),
      ...(category && { category: { slug: category } }),
      ...(level && { level }),
      ...(subject && { subject }),
      ...(featured === '1' && { isFeatured: true }),
      ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput
    switch (sort) {
      case 'price-asc': orderBy = { price: 'asc' }; break
      case 'price-desc': orderBy = { price: 'desc' }; break
      case 'rating': orderBy = { rating: 'desc' }; break
      case 'newest': orderBy = { createdAt: 'desc' }; break
      default: orderBy = { sold: 'desc' }
    }

    const products = await db.product.findMany({
      where,
      orderBy,
      take: limit,
      include: { category: { select: { name: true, slug: true } } },
    })

    const levels = await db.product.groupBy({ by: ['level'], where: { isActive: true } })
    const subjects = await db.product.groupBy({ by: ['subject'], where: { isActive: true } })

    return NextResponse.json({
      products,
      facets: {
        levels: levels.map((l) => l.level).filter(Boolean).sort(),
        subjects: subjects.map((s) => s.subject).filter(Boolean).sort(),
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 })
  }
}
