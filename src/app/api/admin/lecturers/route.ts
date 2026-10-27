import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { handle, ok } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

/**
 * Lecturer directory for admin pickers (timetable builder).
 * Added by Task 5-c — returns lecturer profiles joined with user identity.
 */
export async function GET() {
  return handle(async () => {
    await requireRole('ADMIN')
    const lecturers = await db.lecturerProfile.findMany({
      select: {
        id: true,
        staffNo: true,
        title: true,
        department: true,
        specialization: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { staffNo: 'asc' },
    })
    return ok(
      lecturers.map((l) => ({
        id: l.id,
        staffNo: l.staffNo,
        name: l.user.name,
        email: l.user.email,
        title: l.title,
        department: l.department,
        specialization: l.specialization,
      })),
    )
  })
}
