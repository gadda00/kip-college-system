'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Award,
  BookOpen,
  Building2,
  CalendarRange,
  ChevronRight,
  Clock3,
  FileText,
  GraduationCap,
  Landmark,
  Layers,
  NotebookPen,
  ScrollText,
} from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { EmptyState } from '@/components/kip/components/empty-state'
import { QueryBoundary } from '@/components/kip/components/loading'
import { api } from '@/components/kip/lib/api'
import { fmtDate, fmtDuration } from '@/components/kip/lib/format'
import { RowsSkeleton, ViewHeading } from '@/components/kip/portal/shared'
import { StudyBuddy } from '@/components/kip/portal/student/views/study-buddy'
import type { CourseDetail } from '@/components/kip/lib/types'
import type { StudentDashboard, StudyMaterialDTO } from '@/components/kip/portal/types'
import { cn } from '@/lib/utils'

export function LearningView() {
  const dashboard = useQuery<StudentDashboard>({
    queryKey: ['student-dashboard'],
    queryFn: () => api<StudentDashboard>('/api/student/dashboard'),
  })

  const courseId = dashboard.data?.profile.course.id ?? ''

  const course = useQuery<CourseDetail>({
    queryKey: ['student-course', courseId],
    queryFn: () => api<CourseDetail>(`/api/public/courses/${courseId}`),
    enabled: Boolean(courseId),
  })

  const materials = useQuery<StudyMaterialDTO[]>({
    queryKey: ['student-materials'],
    queryFn: () => api<StudyMaterialDTO[]>('/api/student/materials'),
  })

  return (
    <QueryBoundary
      status={dashboard.status}
      error={dashboard.error}
      onRetry={() => void dashboard.refetch()}
      skeleton={<RowsSkeleton rows={4} />}
    >
      {dashboard.data && (
        <div className="space-y-6">
          <CourseOverview data={dashboard.data} course={course.data ?? null} />
          <QueryBoundary
            status={course.status}
            error={course.error}
            onRetry={() => void course.refetch()}
            skeleton={<RowsSkeleton rows={3} />}
          >
            {course.data && <CourseStructure course={course.data} currentStage={dashboard.data.profile.currentTerm} />}
          </QueryBoundary>
          <QueryBoundary
            status={materials.status}
            error={materials.error}
            onRetry={() => void materials.refetch()}
            skeleton={<RowsSkeleton rows={3} />}
          >
            {materials.data && <StudyMaterials materials={materials.data} />}
          </QueryBoundary>
          {/* AI study assistant — course-aware, multi-turn */}
          <StudyBuddy
            unitNames={dashboard.data.units.map(
              (u) => `${u.code} ${u.name}`,
            )}
          />
        </div>
      )}
    </QueryBoundary>
  )
}

// ---------------------------------------------------------------------------

function CourseOverview({ data, course }: { data: StudentDashboard; course: CourseDetail | null }) {
  const { profile, units } = data
  const studentCourse = profile.course
  const stages = course?.unitsByStage.length ?? 0
  const progress = stages > 0 ? Math.min(100, Math.round((profile.currentTerm / stages) * 100)) : null

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <ViewHeading
          title="My Learning"
          description="Your course details, unit plan for this term and study materials."
        />
      </motion.div>

      <Card className="relative rule-top-gold bg-gradient-to-br from-brand-50/70 via-card to-card dark:from-brand-100/15 dark:via-card dark:to-card">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-400/15 text-gold-700 dark:text-gold-400">
                <GraduationCap className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-lg font-bold leading-snug sm:text-xl">
                  {studentCourse.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Adm. <span className="font-mono text-xs">{profile.admissionNo}</span>
                </p>
              </div>
            </div>
            {profile.status === 'ACTIVE' ? (
              <span className="inline-flex w-fit shrink-0 items-center rounded-md border border-emerald-600/25 bg-emerald-600/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Active student
              </span>
            ) : (
              <Badge variant="secondary" className="shrink-0">
                {profile.status}
              </Badge>
            )}
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <InfoItem icon={Award} label="Level" value={studentCourse.level} />
            <InfoItem icon={Landmark} label="Exam body" value={course?.examBody ?? '—'} />
            <InfoItem icon={Clock3} label="Duration" value={course ? fmtDuration(course.durationMonths) : '—'} />
            <InfoItem icon={Building2} label="Campus" value={profile.campus.name} />
            <InfoItem
              icon={CalendarRange}
              label="Progress"
              value={`Year ${profile.yearOfStudy} · Term ${profile.currentTerm}`}
            />
          </dl>

          {/* gold course-progress bar */}
          {progress !== null && (
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-muted-foreground">
                  Course progress · Term {profile.currentTerm} of {stages}
                </span>
                <span className="font-display font-bold text-gold-700 dark:text-gold-400">
                  {progress}%
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Course progress: ${progress}%`}
                className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-400"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current term units */}
      <section aria-labelledby="current-units">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle id="current-units" className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4 text-gold-600 dark:text-gold-400" aria-hidden="true" />
              Current term units
              <Badge variant="secondary" className="ml-1 text-[10px]">
                {units[0]?.stageLabel ?? `Term ${profile.currentTerm}`}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {units.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No units listed for this term"
                hint="Your registrar will publish the unit plan for the current term."
                className="py-10"
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {units.map((u, i) => (
                  <div
                    key={u.id}
                    className="flex items-start gap-3 rounded-xl border p-4 transition-colors hover:border-brand-600/30 hover:bg-brand-50/40 dark:hover:bg-brand-100/10"
                  >
                    {/* brand cover swatch */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex h-16 w-12 shrink-0 items-end rounded-lg p-1.5 shadow-inner',
                        `cover-${i % 8}`,
                      )}
                    >
                      <span className="w-full rounded-sm bg-black/20 px-1 py-0.5 text-center text-[8px] font-black uppercase leading-tight tracking-wide text-white">
                        {u.code}
                      </span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-mono text-[11px] font-semibold text-brand-700 dark:text-gold-400">
                            {u.code}
                          </p>
                          <p className="mt-0.5 text-sm font-semibold leading-snug">{u.name}</p>
                        </div>
                        <Badge variant="outline" className="shrink-0 gap-1 text-[10px] font-medium">
                          <Clock3 className="h-3 w-3" aria-hidden="true" />
                          {u.weekHours}h/week
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{u.stageLabel}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Award
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3 text-gold-600 dark:text-gold-400" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-semibold">{value}</dd>
    </div>
  )
}

// ---------------------------------------------------------------------------

function CourseStructure({ course, currentStage }: { course: CourseDetail; currentStage: number }) {
  return (
    <section aria-labelledby="course-structure">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle id="course-structure" className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4 text-gold-600 dark:text-gold-400" aria-hidden="true" />
            Course structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={[String(currentStage)]}>
            {course.unitsByStage.map((stage) => {
              const isCurrent = stage.stage === currentStage
              return (
                <AccordionItem key={stage.stage} value={String(stage.stage)}>
                  <AccordionTrigger className="min-h-11 py-3 hover:no-underline">
                    <span className="flex items-center gap-2 text-left">
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          isCurrent && 'text-brand-700 dark:text-gold-400',
                        )}
                      >
                        {stage.stageLabel}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {stage.units.length} units
                      </Badge>
                      {isCurrent && (
                        <span className="inline-flex items-center rounded-md border border-gold-500/30 bg-gold-400/15 px-2 py-0.5 text-[10px] font-medium text-gold-700 dark:text-gold-300">
                          Current
                        </span>
                      )}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {stage.units.map((u) => (
                        <li
                          key={u.id}
                          className="flex items-center justify-between gap-3 rounded-lg border/60 bg-brand-50/60 px-3 py-2.5 dark:bg-brand-100/15"
                        >
                          <div className="min-w-0">
                            <p className="font-mono text-[11px] font-semibold text-brand-700 dark:text-gold-400">
                              {u.code}
                            </p>
                            <p className="truncate text-sm">{u.name}</p>
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {u.weekHours}h/wk
                          </span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </CardContent>
      </Card>
    </section>
  )
}

// ---------------------------------------------------------------------------

const MATERIAL_TABS = [
  { value: 'ALL', label: 'All' },
  { value: 'NOTES', label: 'Notes' },
  { value: 'PAST_PAPER', label: 'Past Papers' },
  { value: 'ASSIGNMENT', label: 'Assignments' },
] as const

function materialMeta(type: string) {
  switch (type) {
    case 'NOTES':
      return { icon: NotebookPen, label: 'Notes', classes: 'bg-brand-600/10 text-brand-700 dark:text-brand-300' }
    case 'PAST_PAPER':
      return { icon: ScrollText, label: 'Past paper', classes: 'bg-gold-400/15 text-gold-700 dark:text-gold-400' }
    default:
      return { icon: FileText, label: 'Assignment', classes: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' }
  }
}

function StudyMaterials({ materials }: { materials: StudyMaterialDTO[] }) {
  const [tab, setTab] = useState<string>('ALL')
  const filtered = tab === 'ALL' ? materials : materials.filter((m) => m.type === tab)

  return (
    <section aria-labelledby="study-materials">
      <Card>
        <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle id="study-materials" className="flex items-center gap-2 text-base">
            <NotebookPen className="h-4 w-4 text-gold-600 dark:text-gold-400" aria-hidden="true" />
            Study materials
          </CardTitle>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList aria-label="Filter materials by type">
              {MATERIAL_TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="min-h-9 text-xs">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No study materials yet"
              hint="Lecture notes and past papers for your course will be posted here."
              className="py-10"
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={`No ${MATERIAL_TABS.find((t) => t.value === tab)?.label.toLowerCase() ?? ''} posted`}
              hint="Try another material type."
              className="py-10"
            />
          ) : (
            <ul className="max-h-96 space-y-3 overflow-y-auto custom-scrollbar pr-1">
              {filtered.map((m) => {
                const meta = materialMeta(m.type)
                const Icon = meta.icon
                return (
                  <li
                    key={m.id}
                    className="rounded-xl border p-4 transition-colors hover:border-brand-600/30 hover:bg-brand-50/40 dark:hover:bg-brand-100/10"
                  >
                    <div className="flex items-start gap-3">
                      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', meta.classes)}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold leading-snug">{m.title}</p>
                          <Badge variant="secondary" className="text-[10px]">
                            {meta.label}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs font-medium text-brand-700 dark:text-gold-400">
                          {m.unitName ?? 'General'} {m.stageLabel ? `· ${m.stageLabel}` : ''}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {m.description}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="gap-1.5 font-mono text-[10px]">
                            <FileText className="h-3 w-3" aria-hidden="true" />
                            {m.fileLabel}
                          </Badge>
                          <span className="inline-flex items-center rounded-md border border-gold-500/30 bg-gold-400/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-gold-700 dark:text-gold-300">
                            {fmtDate(m.createdAt)}
                          </span>
                        </div>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" disabled className="focus-glow min-h-11 shrink-0 gap-1.5">
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                            <span className="hidden sm:inline">Get copy</span>
                            <span className="sr-only">
                              Copies available at the campus resource center
                            </span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          Available at the campus resource center
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
