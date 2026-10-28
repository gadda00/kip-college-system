'use client'

import { ArrowRight, Clock3, Layers } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { categoryMeta, fmtDuration, fmtKES } from '@/components/kip/lib/format'
import type { PublicCourse } from '@/components/kip/lib/types'
import { navigate } from '@/components/kip/lib/router'
import { cn } from '@/lib/utils'

/** Public catalogue course card. */
export function CourseCard({
  course,
  className,
}: {
  course: PublicCourse
  className?: string
}) {
  const meta = categoryMeta(course.category)

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn('h-full', className)}
    >
      <Card
        role="button"
        tabIndex={0}
        aria-label={`View ${course.title} details`}
        onClick={() => navigate(`/course/${course.id}`)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            navigate(`/course/${course.id}`)
          }
        }}
        className="group card-lift focus-glow cursor-pointer overflow-hidden py-0 transition-shadow hover:shadow-xl"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <img
            src={course.image || meta.image}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
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
              <Badge className="border-gold-500/60 bg-gold-400/95 text-[#0f2e22] shadow-sm">
                ★ Featured
              </Badge>
            )}
          </div>
          <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-brand-700 shadow-md dark:bg-brand-950/90 dark:text-gold-300">
            {fmtKES(course.tuitionPerTerm)}/term
          </span>
        </div>
        <CardContent className="p-4 sm:p-5">
          <h3 className="line-clamp-2 min-h-11 font-display text-base font-semibold leading-snug tracking-tight">
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
                {course.unitsCount} units
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
    </motion.div>
  )
}
