import { db } from '@/lib/db'
import { handle, ok, csvList } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

/** Public homepage aggregate: stats, featured courses, campuses, news, events, testimonials. */
export async function GET() {
  return handle(async () => {
    const [
      studentsCount,
      coursesCount,
      campusesCount,
      graduatesCount,
      featured,
      campuses,
      news,
      events,
      testimonialsAll,
    ] = await Promise.all([
      db.studentProfile.count({ where: { status: 'ACTIVE' } }),
      db.course.count({ where: { isActive: true } }),
      db.campus.count(),
      db.studentProfile.count({ where: { status: 'GRADUATED' } }),
      db.course.findMany({
        where: { isActive: true, isFeatured: true },
        orderBy: { sortOrder: 'asc' },
        take: 5,
        select: {
          id: true,
          code: true,
          title: true,
          category: true,
          level: true,
          durationMonths: true,
          tuitionPerTerm: true,
          image: true,
          examBody: true,
        },
      }),
      db.campus.findMany({
        orderBy: { sortOrder: 'asc' },
        take: 3,
      }),
      db.newsPost.findMany({
        where: { published: true },
        orderBy: { publishedAt: 'desc' },
        take: 3,
        select: { id: true, title: true, excerpt: true, image: true, publishedAt: true, category: true },
      }),
      db.event.findMany({
        where: { date: { gte: new Date() } },
        orderBy: { date: 'asc' },
        take: 4,
      }),
      db.testimonial.findMany(),
    ])

    // 3 random testimonials
    const shuffled = [...testimonialsAll]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    const testimonials = shuffled.slice(0, 3)

    return ok({
      stats: { studentsCount, coursesCount, campusesCount, graduatesCount },
      featuredCourses: featured,
      campuses: campuses.map((c) => ({ ...c, facilitiesList: csvList(c.facilities) })),
      news,
      events,
      testimonials,
    })
  })
}
