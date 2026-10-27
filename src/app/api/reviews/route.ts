import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, HttpError } from '@/lib/auth'

/** POST /api/reviews — add or update a review for a product */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new HttpError(401, 'Please sign in to write a review')
    const { productId, rating, comment } = await req.json()
    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Product and a rating between 1–5 are required' }, { status: 400 })
    }
    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    const existing = await db.review.findUnique({
      where: { productId_userId: { productId, userId: user.id } },
    })
    if (existing) {
      await db.review.update({
        where: { id: existing.id },
        data: { rating, comment: comment || null },
      })
    } else {
      await db.review.create({ data: { productId, userId: user.id, rating, comment: comment || null } })
    }

    // Recompute aggregates
    const agg = await db.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: true,
    })
    await db.product.update({
      where: { id: productId },
      data: {
        rating: Math.round((agg._avg.rating ?? 0) * 10) / 10,
        reviewCount: agg._count,
      },
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 })
  }
}
