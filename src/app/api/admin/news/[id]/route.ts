import { z } from 'zod'
import { db } from '@/lib/db'
import { assertSameOrigin, HttpError, requireRole } from '@/lib/auth'
import { boolish, handle, ok, readJson } from '@/lib/api-helpers'
import { logAudit } from '@/lib/audit'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

const updateSchema = z.object({
  title: z.string().trim().min(3).optional(),
  excerpt: z.string().trim().min(3).optional(),
  body: z.string().trim().min(10).optional(),
  image: z.string().trim().optional(),
  category: z.string().trim().optional(),
  author: z.string().trim().optional(),
  published: boolish.optional(),
})

/** Edit / publish / unpublish a news post. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    assertSameOrigin(req, { requireOrigin: true })
    const admin = await requireRole('ADMIN')
    const { id } = await params
    const body = updateSchema.parse(await readJson(req))

    const existing = await db.newsPost.findUnique({ where: { id } })
    if (!existing) throw new HttpError(404, 'News post not found')

    const data: Prisma.NewsPostUpdateInput = {}
    if (body.title !== undefined) data.title = body.title
    if (body.excerpt !== undefined) data.excerpt = body.excerpt
    if (body.body !== undefined) data.body = body.body
    if (body.image !== undefined) data.image = body.image
    if (body.category !== undefined) data.category = body.category
    if (body.author !== undefined) data.author = body.author
    if (body.published !== undefined) {
      data.published = body.published
      // refresh the publication timestamp when (re-)publishing
      if (body.published && !existing.published) data.publishedAt = new Date()
    }

    const newsPost = await db.newsPost.update({ where: { id }, data })
    await logAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'NEWS_POST_UPDATED',
      entity: 'newsPost',
      entityId: id,
      meta: { title: newsPost.title, fields: Object.keys(data) },
    })
    return ok(newsPost)
  })
}

/** Delete a news post. */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    assertSameOrigin(req, { requireOrigin: true })
    const admin = await requireRole('ADMIN')
    const { id } = await params
    const existing = await db.newsPost.findUnique({ where: { id }, select: { id: true } })
    if (!existing) throw new HttpError(404, 'News post not found')
    await db.newsPost.delete({ where: { id } })
    await logAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'NEWS_POST_DELETED',
      entity: 'newsPost',
      entityId: id,
    })
    return ok({ deleted: true, id })
  })
}
