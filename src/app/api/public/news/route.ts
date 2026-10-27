import { db } from '@/lib/db'
import { handle, ok } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

/** Published news, newest first. */
export async function GET() {
  return handle(async () => {
    const news = await db.newsPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
    })
    return ok(news)
  })
}
