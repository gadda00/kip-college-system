'use client'

import { ArrowRight, Clock3, Layers } from 'lucide-react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { KipLink } from '@/components/kip/components/link'
import { categoryMeta, fmtDuration, fmtKES } from '@/components/kip/lib/format'
import type { PublicCourse } from '@/components/kip/lib/types'
import { cn } from '@/lib/utils'

/**
 * Public catalogue course card.
 *
 * The whole card is a REAL link (KipLink → #/course/{id}) so keyboard focus,
 * middle-click and screen-reader link lists all behave natively. Hover polish
 * is CSS-only (`card-lift`, quiet 2px lift); card titles are Inter — the serif
 * display face is reserved for page/section headings.
 */
export function CourseCard({
  course,
  className,
}: {
  course: PublicCourse
  className?: string
}) {
  const meta = categoryMeta(course.category)

  return (
    <KipLink
      to={`/course/${course.id}`}
      aria-label={`${course.title} — view programme details`}
      className={cn(
        'group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
    >
      <Card className="card-lift h-full overflow-hidden py-0 transition-shadow">
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <Image
            src={course.image || meta.image}
            alt={`${course.title} — illustrative cover image`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
          {/* readability vignette under badges */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/35 to-transparent"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Badge className="border-transparent bg-brand-900/90 text-[#f2efe6] shadow-sm backdrop-blur-sm">
              {course.category}
            </Badge>
            {course.isFeatured && (
              <Badge className="border-transparent bg-success text-success-foreground shadow-sm">
                Featured
              </Badge>
            )}
          </div>
          <span className="tnum absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-brand-700 shadow-md dark:bg-brand-950/90 dark:text-brand-100">
            {fmtKES(course.tuitionPerTerm)}/term
          </span>
        </div>
        <CardContent className="p-4 sm:p-5">
          <h3 className="line-clamp-2 min-h-11 text-base font-semibold leading-snug tracking-tight">
            {course.title}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" aria-hidden="true" />
              {course.level}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              {fmtDuration(course.durationMonths)}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="font-medium">
              {course.examBody}
            </Badge>
            {course.unitsCount > 0 && (
              <Badge variant="outline" className="text-muted-foreground">
                <span className="tnum">{course.unitsCount}</span> units
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t px-4 py-3 text-sm font-medium text-primary sm:px-5">
          <span>View programme</span>
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </CardFooter>
      </Card>
    </KipLink>
  )
}
