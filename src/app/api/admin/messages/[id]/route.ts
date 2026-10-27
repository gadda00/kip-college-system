import { z } from 'zod'
import { db } from '@/lib/db'
import { HttpError, requireRole } from '@/lib/auth'
import { handle, ok, readJson } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

const updateSchema = z.object({
  status: z.enum(['NEW', 'READ', 'REPLIED'], { message: 'status must be NEW, READ or REPLIED' }),
})

/** Update a contact message's status. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireRole('ADMIN')
    const { id } = await params
    const body = updateSchema.parse(await readJson(req))

    const existing = await db.contactMessage.findUnique({ where: { id }, select: { id: true } })
    if (!existing) throw new HttpError(404, 'Message not found')

    const message = await db.contactMessage.update({ where: { id }, data: { status: body.status } })
    return ok(message)
  })
}
