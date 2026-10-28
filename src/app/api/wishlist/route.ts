import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, HttpError } from '@/lib/auth'

/** GET /api/wishlist — user's saved products */
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) throw new HttpError(401, 'Please sign in')
    const items = await db.wishlistItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { product: { include: { category: { select: { name: true } } } } },
    })
    return NextResponse.json({ items })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ error: 'Failed to load wishlist' }, { status: 500 })
  }
}

/** POST /api/wishlist — toggle a product in the wishlist */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new HttpError(401, 'Please sign in to save items')
    const { productId } = await req.json()
    if (!productId) return NextResponse.json({ error: 'Product required' }, { status: 400 })
    const existing = await db.wishlistItem.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    })
    if (existing) {
      await db.wishlistItem.delete({ where: { id: existing.id } })
      return NextResponse.json({ saved: false })
    }
    await db.wishlistItem.create({ data: { userId: user.id, productId } })
    return NextResponse.json({ saved: true })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 })
  }
}
