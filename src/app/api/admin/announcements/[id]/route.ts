import { z } from 'zod'
import { db } from '@/lib/db'
import { HttpError, requireRole } from '@/lib/auth'
import { boolish, handle, ok, readJson } from '@/lib/api-helpers'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

const updateSchema = z.object({
  title: z.string().trim().min(2).optional(),
  body: z.string().trim().min(2).optional(),
  audience: z.enum(['ALL', 'STUDENTS', 'STAFF']).optional(),
  pinned: boolish.optional(),
  active: boolish.optional(),
  authorName: z.string().trim().optional(),
})

/** Update an announcement. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireRole('ADMIN')
    const { id } = await params
    const body = updateSchema.parse(await readJson(req))

    const existing = await db.announcement.findUnique({ where: { id }, select: { id: true } })
    if (!existing) throw new HttpError(404, 'Announcement not found')

    const data: Prisma.AnnouncementUpdateInput = {}
    if (body.title !== undefined) data.title = body.title
    if (body.body !== undefined) data.body = body.body
    if (body.audience !== undefined) data.audience = body.audience
    if (body.pinned !== undefined) data.pinned = body.pinned
    if (body.active !== undefined) data.active = body.active
    if (body.authorName !== undefined) data.authorName = body.authorName

    const announcement = await db.announcement.update({ where: { id }, data })
    return ok(announcement)
  })
}

/** Delete an announcement. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireRole('ADMIN')
    const { id } = await params
    const existing = await db.announcement.findUnique({ where: { id }, select: { id: true } })
    if (!existing) throw new HttpError(404, 'Announcement not found')
    await db.announcement.delete({ where: { id } })
    return ok({ deleted: true, id })
  })
}
