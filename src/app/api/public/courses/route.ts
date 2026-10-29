import { db } from '@/lib/db'
import { contains, handle, ok, csvList } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

/** Public course catalogue: ?q= search & ?category= filter. */
export async function GET(req: Request) {
  return handle(async () => {
    const url = new URL(req.url)
    const q = url.searchParams.get('q')?.trim() ?? ''
    const category = url.searchParams.get('category')?.trim() ?? ''

    const courses = await db.course.findMany({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
        ...(q
          ? {
              OR: [
                { title: contains(q) },
                { code: contains(q) },
                { description: contains(q) },
              ],
            }
          : {}),
      },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { units: true } } },
    })

    const data = courses.map((c) => ({
      id: c.id,
      code: c.code,
      title: c.title,
      category: c.category,
      level: c.level,
      examBody: c.examBody,
      durationMonths: c.durationMonths,
      intakeMonths: c.intakeMonths,
      intakes: csvList(c.intakeMonths),
      tuitionPerTerm: c.tuitionPerTerm,
      registrationFee: c.registrationFee,
      examFee: c.examFee,
      description: c.description,
      image: c.image,
      isFeatured: c.isFeatured,
      unitsCount: c._count.units,
    }))

    return ok(data)
  })
}
