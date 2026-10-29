import { z } from 'zod'
import { db } from '@/lib/db'
import { assertSameOrigin, HttpError } from '@/lib/auth'
import { handle, ok, randomCode, readJson, UNAMBIGUOUS } from '@/lib/api-helpers'
import { clientIp, rateLimited, RATE_LIMITS } from '@/lib/rate-limit'
import { logAudit } from '@/lib/audit'

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
  message: z.string().trim().max(2000, 'Message is too long').optional(),
})

/** Human-readable application reference, e.g. KIP/APP/2026/4F7K (crypto-random). */
function applicationReference(): string {
  return `KIP/APP/${new Date().getFullYear()}/${randomCode(5, UNAMBIGUOUS)}`
}

/** Public admission application submission. */
export async function POST(req: Request) {
  return handle(async () => {
    assertSameOrigin(req, { requireOrigin: true })
    const ip = clientIp(req)
    if (rateLimited(`apply:${ip}`, RATE_LIMITS.application.limit, RATE_LIMITS.application.windowMs)) {
      throw new HttpError(429, 'Too many applications from this connection — please contact admissions@kipskitui.com')
    }

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

    const reference = applicationReference()
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
        // Structured so later admin review notes APPEND after the reference
        // (see mergeAdminNote) instead of overwriting it.
        adminNote: `Ref: ${reference}`,
      },
      include: { course: { select: { title: true, code: true } }, campus: { select: { name: true } } },
    })

    await logAudit({
      action: 'APPLICATION_SUBMITTED',
      entity: 'application',
      entityId: application.id,
      actorEmail: body.email,
      meta: { course: course.title, campus: campus.name, reference },
      ip,
    })

    return ok(
      {
        ...application,
        reference, // clean reference (adminNote holds `Ref: <reference>`)
        nextSteps: [
          'Our admissions team reviews applications within 48 hours (Mon–Fri).',
          `Keep your reference ${reference} for any follow-up.`,
          'Watch your email and phone — we may request your KCSE certificate scan.',
          'Accepted applicants receive login credentials for the student portal by email.',
        ],
      },
      201,
    )
  })
}
