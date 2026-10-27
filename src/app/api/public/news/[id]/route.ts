import { db } from '@/lib/db'
import { handle, ok } from '@/lib/api-helpers'
import { HttpError } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/** Single published news post. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params
    const post = await db.newsPost.findFirst({ where: { id, published: true } })
    if (!post) throw new HttpError(404, 'News post not found')
    return ok(post)
  })
}
