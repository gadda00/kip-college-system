import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { handle, ok } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

/** All admission applications, newest first. */
export async function GET() {
  return handle(async () => {
    await requireRole('ADMIN')
    const applications = await db.application.findMany({
      include: {
        course: { select: { id: true, code: true, title: true, level: true, category: true } },
        campus: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return ok(applications)
  })
}
