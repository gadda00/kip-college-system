import { z } from 'zod'
import { db } from '@/lib/db'
import { handle, ok, readJson } from '@/lib/api-helpers'
import { HttpError } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const phoneRule = z
  .string()
  .transform((v) => v.trim())
  .refine((v) => v.replace(/\D/g, '').length >= 10, 'Phone number must have at least 10 digits')

const applySchema = z.object({
  applicantName: z.string().trim().min(3, 'Full name is required (min 3 characters)'),
  email: z.string().trim().email('Enter a valid email address').toLowerCase(),
  phone: phoneRule,
  courseId: z.string().min(1, 'Select a course'),
  campusId: z.string().min(1, 'Select a campus'),
  kcseGrade: z.string().trim().min(1, 'KCSE grade is required'),
  kcseYear: z.coerce
    .number()
    .int('KCSE year must be a whole year')
    .min(1990, 'KCSE year looks too old')
    .max(new Date().getFullYear(), 'KCSE year cannot be in the future'),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  dob: z.coerce.date().optional(),
  guardianName: z.string().trim().optional(),
  guardianPhone: z.string().trim().optional(),
  message: z.string().trim().optional(),
})

/** Public admission application submission. */
export async function POST(req: Request) {
  return handle(async () => {
    const body = applySchema.parse(await readJson(req))

    const [course, campus, duplicate] = await Promise.all([
      db.course.findUnique({ where: { id: body.courseId }, select: { id: true, title: true, code: true } }),
      db.campus.findUnique({ where: { id: body.campusId }, select: { id: true, name: true } }),
      db.application.findFirst({
        where: { email: body.email, status: 'PENDING' },
        select: { id: true },
      }),
    ])
    if (!course) throw new HttpError(400, 'Selected course was not found')
    if (!campus) throw new HttpError(400, 'Selected campus was not found')
    if (duplicate) throw new HttpError(409, 'You already have a pending application')

    const application = await db.application.create({
      data: {
        applicantName: body.applicantName,
        email: body.email,
        phone: body.phone,
        courseId: body.courseId,
        campusId: body.campusId,
        kcseGrade: body.kcseGrade,
        kcseYear: body.kcseYear,
        gender: body.gender,
        dob: body.dob,
        guardianName: body.guardianName || null,
        guardianPhone: body.guardianPhone || null,
        message: body.message || null,
      },
      include: { course: { select: { title: true, code: true } }, campus: { select: { name: true } } },
    })

    return ok(application, 201)
  })
}
