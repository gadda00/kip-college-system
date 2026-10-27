import { z } from 'zod'
import { db } from '@/lib/db'
import { HttpError } from '@/lib/auth'
import { handle, ok, readJson } from '@/lib/api-helpers'
import { currentStudent } from '@/lib/roles'
import type { Campus, Course, StudentProfile, User } from '@prisma/client'

export const dynamic = 'force-dynamic'

type ProfileRow = StudentProfile & {
  course: Course
  campus: Campus
  user: Pick<User, 'name' | 'email' | 'phone'>
}

/** Flatten the full student profile for the portal profile page. */
function mapProfile(profile: ProfileRow) {
  return {
    name: profile.user.name,
    email: profile.user.email,
    phone: profile.user.phone,
    address: profile.address,
    admissionNo: profile.admissionNo,
    gender: profile.gender,
    dob: profile.dob,
    kcseGrade: profile.kcseGrade,
    guardianName: profile.guardianName,
    guardianPhone: profile.guardianPhone,
    admittedAt: profile.admittedAt,
    yearOfStudy: profile.yearOfStudy,
    currentTerm: profile.currentTerm,
    status: profile.status,
    course: {
      id: profile.course.id,
      code: profile.course.code,
      title: profile.course.title,
      category: profile.course.category,
      level: profile.course.level,
      examBody: profile.course.examBody,
      durationMonths: profile.course.durationMonths,
    },
    campus: { id: profile.campus.id, name: profile.campus.name, location: profile.campus.location },
  }
}

async function loadProfile(userId: string): Promise<ProfileRow> {
  const profile = await db.studentProfile.findUnique({
    where: { userId },
    include: {
      course: true,
      campus: true,
      user: { select: { name: true, email: true, phone: true } },
    },
  })
  if (!profile) throw new HttpError(403, 'No student profile is attached to this account')
  return profile
}

/** Full student profile for the portal "Profile" page. */
export async function GET() {
  return handle(async () => {
    const { user } = await currentStudent()
    const profile = await loadProfile(user.id)
    return ok(mapProfile(profile))
  })
}

const phoneSchema = z
  .string()
  .trim()
  .refine((s) => /^(?:\+?254|0)\d{9}$/.test(s.replace(/\s+/g, '')), {
    message: 'Enter a valid Kenyan phone number e.g. +254 703 710 879',
  })

const patchSchema = z.object({
  phone: phoneSchema.optional(),
  address: z.string().trim().max(160, 'Address is too long').optional(),
})

/** Self-service profile edit: phone (User) + address (StudentProfile). */
export async function PATCH(req: Request) {
  return handle(async () => {
    const { user } = await currentStudent()
    const body = patchSchema.parse(await readJson(req))
    if (body.phone === undefined && body.address === undefined) {
      return ok({ updated: false, profile: mapProfile(await loadProfile(user.id)) })
    }

    if (body.phone !== undefined) {
      await db.user.update({ where: { id: user.id }, data: { phone: body.phone } })
    }
    if (body.address !== undefined) {
      await db.studentProfile.updateMany({
        where: { userId: user.id },
        data: { address: body.address },
      })
    }

    const profile = await loadProfile(user.id)
    return ok({ updated: true, profile: mapProfile(profile) })
  })
}
