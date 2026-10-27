import { z } from 'zod'
import { db } from '@/lib/db'
import { handle, ok } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

const querySchema = z.object({
  category: z.enum(['Admissions', 'Fees', 'Courses', 'Exams', 'General']).optional(),
})

/** Active FAQs ordered by sortOrder; optional ?category= filter. */
export async function GET(req: Request) {
  return handle(async () => {
    const url = new URL(req.url)
    const parsed = querySchema.safeParse({
      category: url.searchParams.get('category') ?? undefined,
    })
    // invalid/unknown category values fall back to the full list (public page — 400s add no value)
    const category = parsed.success ? parsed.data.category : undefined
    const faqs = await db.fAQ.findMany({
      where: { active: true, ...(category ? { category } : {}) },
      orderBy: { sortOrder: 'asc' },
    })
    return ok(faqs)
  })
}
