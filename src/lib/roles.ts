import { db } from '@/lib/db'
import { HttpError, requireRole, type SafeUser } from '@/lib/auth'
import type { Campus, Course, LecturerProfile, StudentProfile, User } from '@prisma/client'

type StudentProfileWithContext = StudentProfile & {
  course: Course
  campus: Campus
  user: Pick<User, 'name' | 'email' | 'phone'>
}

/**
 * Guard + resolve the signed-in STUDENT with full profile context
 * (course, campus, own user contact fields).
 */
export async function currentStudent(): Promise<{ user: SafeUser; profile: StudentProfileWithContext }> {
  const user = await requireRole('STUDENT')
  const profile = await db.studentProfile.findUnique({
    where: { userId: user.id },
    include: {
      course: true,
      campus: true,
      user: { select: { name: true, email: true, phone: true } },
    },
  })
  if (!profile) throw new HttpError(403, 'No student profile is attached to this account')
  return { user, profile }
}

/** Guard + resolve the signed-in LECTURER. */
export async function currentLecturer(): Promise<{ user: SafeUser; profile: LecturerProfile }> {
  const user = await requireRole('LECTURER')
  const profile = await db.lecturerProfile.findUnique({ where: { userId: user.id } })
  if (!profile) throw new HttpError(403, 'No lecturer profile is attached to this account')
  return { user, profile }
}
