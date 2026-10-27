'use client'

import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Clock3,
  GraduationCap,
  Layers,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CourseCard } from '@/components/kip/components/course-card'
import { DetailSkeleton, ErrorPanel } from '@/components/kip/components/loading'
import { api } from '@/components/kip/lib/api'
import { categoryMeta, fmtDuration, fmtKES } from '@/components/kip/lib/format'
import type { CourseDetail } from '@/components/kip/lib/types'
import { navigate } from '@/components/kip/lib/router'

export function CourseDetailView({ courseId }: { courseId: string }) {
  const detail = useQuery({
    queryKey: ['public-course', courseId],
    queryFn: () => api<CourseDetail>(`/api/public/courses/${courseId}`),
    enabled: Boolean(courseId),
    retry: (count, error) => {
      // 404 means the course genuinely doesn't exist — don't retry
      if (error instanceof Error && error.message.includes('not found')) return false
      return count < 1
    },
  })

  if (detail.isPending) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <DetailSkeleton />
      </div>
    )
  }

  if (detail.isError || !detail.data) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <ErrorPanel
          error={detail.error ?? new Error('Course not found')}
          onRetry={() => detail.refetch()}
        />
        <div className="mt-6 text-center">
          <Button variant="outline" className="min-h-11" onClick={() => navigate('/academics')}>
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back to all programmes
          </Button>
        </div>
      </div>
    )
  }

  const course = detail.data
  const meta = categoryMeta(course.category)

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <button
        type="button"
        onClick={() => navigate('/academics')}
        className="mb-6 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to programmes
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* ── left column ── */}
        <div className="space-y-8 lg:col-span-2">
          {/* hero + headings */}
          <div>
            <div className="overflow-hidden rounded-2xl shadow-sm">
              <img
                src={course.image || meta.image}
                alt={course.title}
                className="aspect-[16/8] w-full object-cover"
              />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge className="bg-primary text-primary-foreground">{course.category}</Badge>
              <Badge variant="secondary" className="gap-1">
                <Layers className="h-3 w-3" aria-hidden="true" />
                {course.level}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                {course.examBody}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Clock3 className="h-3 w-3" aria-hidden="true" />
                {fmtDuration(course.durationMonths)}
              </Badge>
            </div>
            <h1 className="mt-4 text-balance text-2xl font-bold tracking-tight sm:text-3xl">
              {course.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Course code: {course.code}</p>
          </div>

          {/* description */}
          <section aria-labelledby="overview-title">
            <h2 id="overview-title" className="text-lg font-semibold">
              Programme Overview
            </h2>
            <p className="mt-3 whitespace-pre-line text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              {course.description}
            </p>
          </section>

          {/* units by stage */}
          <section aria-labelledby="units-title">
            <h2 id="units-title" className="text-lg font-semibold">
              What You&rsquo;ll Study
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {course.units.length} course units across{' '}
              {course.unitsByStage.length === 1
                ? '1 stage'
                : `${course.unitsByStage.length} stages`}
              .
            </p>
            {course.units.length === 0 ? (
              <p className="mt-4 rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
                The detailed unit list for this programme is available from the admissions office.
              </p>
            ) : (
              <Accordion type="multiple" className="mt-4">
                {course.unitsByStage.map((stage, i) => (
                  <AccordionItem key={stage.stage} value={`stage-${stage.stage}`}>
                    <AccordionTrigger className="min-h-11 text-sm hover:no-underline sm:text-base">
                      <span className="flex items-center gap-2.5 text-left">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                          {i + 1}
                        </span>
                        {stage.stageLabel}
                        <Badge variant="outline" className="ml-1 text-[10px] font-normal text-muted-foreground">
                          {stage.units.length} units
                        </Badge>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pb-1">
                        {stage.units.map((unit) => (
                          <li
                            key={unit.id}
                            className="flex items-start justify-between gap-3 rounded-lg bg-muted/50 px-3.5 py-2.5"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium">{unit.name}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">{unit.code}</p>
                            </div>
                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                              {unit.weekHours} hrs/wk
                            </span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </section>

          {/* entry requirements */}
          <section aria-labelledby="requirements-title">
            <Card className="border-primary/15">
              <CardHeader className="pb-3">
                <CardTitle id="requirements-title" className="flex items-center gap-2 text-base">
                  <GraduationCap className="h-5 w-5 text-primary" aria-hidden="true" />
                  Entry Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{course.requirements}</p>
              </CardContent>
            </Card>
          </section>

          {/* related courses */}
          {course.related.length > 0 && (
            <section aria-labelledby="related-title">
              <h2 id="related-title" className="text-lg font-semibold">
                Similar Programmes
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {course.related.map((rel) => (
                  <CourseCard key={rel.id} course={rel} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── right sticky column ── */}
        <aside className="lg:col-span-1" aria-label="Fees and application summary">
          <div className="space-y-5 lg:sticky lg:top-24">
            {/* fees card */}
            <Card className="border-primary/20 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Fees &amp; Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Registration (once)</span>
                  <span className="font-semibold">{fmtKES(course.fees.registrationFee)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tuition (per term)</span>
                  <span className="font-semibold">{fmtKES(course.fees.tuitionPerTerm)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Exam fee (approx.)</span>
                  <span className="font-semibold">{fmtKES(course.fees.examFee)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2.5">
                  <span className="font-semibold text-primary">
                    First-term estimate
                  </span>
                  <span className="text-base font-bold text-primary">
                    {fmtKES(course.fees.perTermTotal)}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Pay via M-Pesa Paybill <strong>522 890</strong> (Account: Admission No.), Equity
                  Bank Kitui (A/C 1234567890) or cash at any campus finance office. Flexible
                  instalments available.
                </p>
                <Button
                  onClick={() => navigate(`/apply?course=${course.id}`)}
                  className="h-12 w-full bg-primary text-base font-semibold shadow-md hover:bg-primary/90"
                >
                  Apply for this course
                  <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                </Button>
              </CardContent>
            </Card>

            {/* key facts */}
            <Card>
              <CardContent className="space-y-4 p-5 text-sm">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="font-medium">Intakes</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {course.intakes.length > 0 ? (
                        course.intakes.map((m) => (
                          <Badge key={m} variant="secondary" className="font-normal">
                            {m}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">Contact admissions</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock3 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-muted-foreground">{fmtDuration(course.durationMonths)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="font-medium">Examining body</p>
                    <p className="text-muted-foreground">{course.examBody}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* contact box */}
            <Card className="bg-primary/5">
              <CardContent className="p-5 text-sm">
                <p className="font-semibold">Questions about this course?</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Our admissions team responds within one working day.
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>
                    <a
                      href="tel:+254712345678"
                      className="flex min-h-9 items-center gap-2 font-medium text-primary transition-colors hover:underline"
                    >
                      <Phone className="h-4 w-4" aria-hidden="true" /> 0703 710 879
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:info@kipskitui.com"
                      className="flex min-h-9 items-center gap-2 font-medium text-primary transition-colors hover:underline"
                    >
                      <Mail className="h-4 w-4" aria-hidden="true" /> info@kipskitui.com
                    </a>
                  </li>
                  <li className="flex min-h-9 items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" aria-hidden="true" /> Admissions offices at all 3
                    campuses
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  )
}
