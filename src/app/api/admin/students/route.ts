import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'
import { HttpError, requireRole } from '@/lib/auth'
import { handle, ok, nextAdmissionNo, readJson } from '@/lib/api-helpers'
import { computeBalances } from '@/lib/fees'

export const dynamic = 'force-dynamic'

/** Admin students list: ?q=&courseId=&campusId=&status= with computed balances. */
export async function GET(req: Request) {
  return handle(async () => {
    await requireRole('ADMIN')
    const url = new URL(req.url)
    const q = url.searchParams.get('q')?.trim() ?? ''
    const courseId = url.searchParams.get('courseId')?.trim() ?? ''
    const campusId = url.searchParams.get('campusId')?.trim() ?? ''
    const status = url.searchParams.get('status')?.trim() ?? ''

    const students = await db.studentProfile.findMany({
      where: {
        ...(courseId ? { courseId } : {}),
        ...(campusId ? { campusId } : {}),
        ...(status ? { status } : {}),
        ...(q
          ? {
              OR: [
                { admissionNo: { contains: q } },
                { user: { name: { contains: q } } },
                { user: { email: { contains: q } } },
              ],
            }
          : {}),
      },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        course: { select: { id: true, title: true, code: true, category: true } },
        campus: { select: { id: true, name: true } },
      },
      orderBy: { admissionNo: 'asc' },
    })

    const balances = await computeBalances(students.map((s) => s.id))
    return ok(
      students.map((s) => ({
        id: s.id,
        userId: s.userId,
        name: s.user.name,
        email: s.user.email,
        phone: s.user.phone,
        admissionNo: s.admissionNo,
        course: s.course,
        campus: s.campus,
        yearOfStudy: s.yearOfStudy,
        currentTerm: s.currentTerm,
        status: s.status,
        balance: balances.get(s.id)?.balance ?? 0,
      })),
    )
  })
}

const createStudentSchema = z.object({
  name: z.string().trim().min(3, 'Name is required (min 3 characters)'),
  email: z.string().trim().email('Enter a valid email address').toLowerCase(),
  phone: z.string().trim().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  courseId: z.string().min(1, 'Select a course'),
  campusId: z.string().min(1, 'Select a campus'),
  yearOfStudy: z.coerce.number().int().min(1).max(8).default(1),
  currentTerm: z.coerce.number().int().min(1).max(12).default(1),
  admissionNo: z.string().trim().optional(),
  kcseGrade: z.string().trim().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  guardianName: z.string().trim().optional(),
  guardianPhone: z.string().trim().optional(),
})

/** Admin creates a student account (+ profile, auto admission number). */
export async function POST(req: Request) {
  return handle(async () => {
    await requireRole('ADMIN')
    const body = createStudentSchema.parse(await readJson(req))

    const [course, campus, emailTaken] = await Promise.all([
      db.course.findUnique({ where: { id: body.courseId }, select: { id: true, title: true } }),
      db.campus.findUnique({ where: { id: body.campusId }, select: { id: true, name: true } }),
      db.user.findUnique({ where: { email: body.email }, select: { id: true } }),
    ])
    if (!course) throw new HttpError(400, 'Selected course was not found')
    if (!campus) throw new HttpError(400, 'Selected campus was not found')
    if (emailTaken) throw new HttpError(409, 'A user with this email already exists')

    const admissionNo = body.admissionNo?.trim() || (await nextAdmissionNo())
    if (body.admissionNo?.trim()) {
      const taken = await db.studentProfile.findUnique({ where: { admissionNo }, select: { id: true } })
      if (taken) throw new HttpError(409, 'That admission number is already in use')
    }

    const passwordHash = await bcrypt.hash(body.password, 10)
    const { user, profile } = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: body.email,
          name: body.name,
          phone: body.phone || null,
          role: 'STUDENT',
          passwordHash,
        },
      })
      const profile = await tx.studentProfile.create({
        data: {
          userId: user.id,
          admissionNo,
          courseId: body.courseId,
          campusId: body.campusId,
          yearOfStudy: body.yearOfStudy,
          currentTerm: body.currentTerm,
          kcseGrade: body.kcseGrade || null,
          gender: body.gender,
          guardianName: body.guardianName || null,
          guardianPhone: body.guardianPhone || null,
        },
      })
      return { user, profile }
    })

    return ok(
      {
        id: profile.id,
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        admissionNo: profile.admissionNo,
        course,
        campus,
        yearOfStudy: profile.yearOfStudy,
        currentTerm: profile.currentTerm,
        status: profile.status,
      },
      201,
    )
  })
}
