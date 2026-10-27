import { db } from '@/lib/db'
import { handle, ok } from '@/lib/api-helpers'
import { currentStudent } from '@/lib/roles'

export const dynamic = 'force-dynamic'

/** Active announcements addressed to students (ALL or STUDENTS). */
export async function GET() {
  return handle(async () => {
    await currentStudent()
    const announcements = await db.announcement.findMany({
      where: { active: true, audience: { in: ['ALL', 'STUDENTS'] } },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    })
    return ok(announcements)
  })
}
