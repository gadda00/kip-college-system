import { db } from '@/lib/db'
import { handle, ok } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

/** All testimonials (public marketing content). */
export async function GET() {
  return handle(async () => {
    const testimonials = await db.testimonial.findMany()
    return ok(testimonials)
  })
}
