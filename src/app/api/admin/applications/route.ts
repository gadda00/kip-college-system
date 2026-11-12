import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { handle, listLimit, ok } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

/** All admission applications, newest first (bounded by ?limit=, default 500). */
export async function GET(req: Request) {
  return handle(async () => {
    await requireRole('ADMIN')
    const applications = await db.application.findMany({
      include: {
        course: { select: { id: true, code: true, title: true, level: true, category: true } },
        campus: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: listLimit(req, 500),
    })
    return ok(applications)
  })
}
