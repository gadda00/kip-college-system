import { db } from '@/lib/db'
import { handle, ok } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

/** All testimonials (public marketing content, bounded). */
export async function GET() {
  return handle(async () => {
    const testimonials = await db.testimonial.findMany({ take: 60 })
    return ok(testimonials)
  })
}
