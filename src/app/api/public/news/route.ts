import { db } from '@/lib/db'
import { handle, ok } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

/** Published news, newest first (bounded — the public surface is
 * unauthenticated, so every list must stay cheap no matter how large the
 * table grows). */
export async function GET() {
  return handle(async () => {
    const news = await db.newsPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    })
    return ok(news)
  })
}
