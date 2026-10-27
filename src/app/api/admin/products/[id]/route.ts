import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, HttpError } from '@/lib/auth'

/** PATCH /api/admin/products/[id] — update product / adjust stock */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const b = await req.json()
    const data: any = {}
    const fields = ['name', 'description', 'price', 'costPrice', 'stock', 'lowStockAt', 'image', 'brand', 'level', 'subject', 'sku', 'isFeatured', 'isActive', 'categoryId']
    for (const f of fields) if (b[f] !== undefined) data[f] = b[f]
    const product = await db.product.update({ where: { id }, data })
    return NextResponse.json({ product })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

/** DELETE /api/admin/products/[id] — soft delete (deactivate) or hard delete */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const hard = req.nextUrl.searchParams.get('hard') === '1'
    if (hard) {
      const itemCount = await db.orderItem.count({ where: { productId: id } })
      if (itemCount > 0) {
        await db.product.update({ where: { id }, data: { isActive: false, stock: 0 } })
        return NextResponse.json({ softDeleted: true })
      }
      await db.product.delete({ where: { id } })
      return NextResponse.json({ deleted: true })
    }
    await db.product.update({ where: { id }, data: { isActive: false } })
    return NextResponse.json({ deactivated: true })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
