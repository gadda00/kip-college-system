import { z } from 'zod'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { boolish, handle, ok, readJson } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

/** All news posts (published + drafts), newest first. */
export async function GET() {
  return handle(async () => {
    await requireRole('ADMIN')
    const news = await db.newsPost.findMany({ orderBy: { publishedAt: 'desc' } })
    return ok(news)
  })
}

const createSchema = z.object({
  title: z.string().trim().min(3, 'Title is required'),
  excerpt: z.string().trim().min(3, 'Excerpt is required'),
  body: z.string().trim().min(10, 'Body is required (min 10 characters)'),
  image: z.string().trim().default('/images/about-campus.png'),
  category: z.string().trim().default('News'),
  author: z.string().trim().default('Communications Office'),
  published: boolish.default(false),
})

/** Create a news post (publishedAt set when published). */
export async function POST(req: Request) {
  return handle(async () => {
    await requireRole('ADMIN')
    const body = createSchema.parse(await readJson(req))
    const newsPost = await db.newsPost.create({
      data: { ...body, publishedAt: new Date() },
    })
    return ok(newsPost, 201)
  })
}
