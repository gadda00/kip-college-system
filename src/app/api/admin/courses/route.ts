import { z } from 'zod'
import { db } from '@/lib/db'
import { HttpError, requireRole } from '@/lib/auth'
import { boolish, csvList, generateCourseCode, handle, ok, readJson } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

/** Course management list with units + active-student counts. */
export async function GET() {
  return handle(async () => {
    await requireRole('ADMIN')
    const [courses, activeByCourse] = await Promise.all([
      db.course.findMany({
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { units: true } } },
      }),
      db.studentProfile.groupBy({ by: ['courseId'], where: { status: 'ACTIVE' }, _count: true }),
    ])
    const counts = new Map(activeByCourse.map((row) => [row.courseId, row._count]))
    return ok(
      courses.map((c) => ({
        ...c,
        intakes: csvList(c.intakeMonths),
        unitsCount: c._count.units,
        studentsCount: counts.get(c.id) ?? 0,
      })),
    )
  })
}

export const courseInputSchema = z.object({
  code: z.string().trim().optional(),
  title: z.string().trim().min(3, 'Title is required (min 3 characters)'),
  category: z.enum(['TECHNICAL', 'BUSINESS', 'KASNEB'], { message: 'category must be TECHNICAL, BUSINESS or KASNEB' }),
  level: z.string().trim().min(2, 'Level is required'),
  examBody: z.string().trim().min(2, 'Exam body is required'),
  durationMonths: z.coerce.number().int().min(1).max(60),
  intakeMonths: z.string().trim().default('January,May,September'),
  tuitionPerTerm: z.coerce.number().min(0),
  registrationFee: z.coerce.number().min(0),
  examFee: z.coerce.number().min(0),
  description: z.string().trim().default(''),
  requirements: z.string().trim().default(''),
  image: z.string().trim().optional(),
  isActive: boolish.default(true),
  isFeatured: boolish.default(false),
  sortOrder: z.coerce.number().int().default(0),
})

/** Create a course (auto code from title initials when omitted). */
export async function POST(req: Request) {
  return handle(async () => {
    await requireRole('ADMIN')
    const body = courseInputSchema.parse(await readJson(req))

    const code = body.code || (await generateCourseCode(body.title))
    const codeTaken = await db.course.findUnique({ where: { code }, select: { id: true } })
    if (codeTaken) throw new HttpError(409, `Course code "${code}" is already in use`)

    const image = body.image || `/images/cat-${body.category.toLowerCase()}.png`
    const course = await db.course.create({
      data: {
        code,
        title: body.title,
        category: body.category,
        level: body.level,
        examBody: body.examBody,
        durationMonths: body.durationMonths,
        intakeMonths: body.intakeMonths,
        tuitionPerTerm: body.tuitionPerTerm,
        registrationFee: body.registrationFee,
        examFee: body.examFee,
        description: body.description,
        requirements: body.requirements,
        image,
        isActive: body.isActive,
        isFeatured: body.isFeatured,
        sortOrder: body.sortOrder,
      },
    })
    return ok(course, 201)
  })
}
