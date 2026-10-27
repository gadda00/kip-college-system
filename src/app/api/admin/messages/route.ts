import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { handle, ok } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

/** Contact-message inbox, newest first. */
export async function GET() {
  return handle(async () => {
    await requireRole('ADMIN')
    const messages = await db.contactMessage.findMany({ orderBy: { createdAt: 'desc' } })
    return ok(messages)
  })
}
