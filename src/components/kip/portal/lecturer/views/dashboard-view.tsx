'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  Clock,
  GraduationCap,
  MapPin,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/kip/components/empty-state'
import { QueryBoundary } from '@/components/kip/components/loading'
import { api } from '@/components/kip/lib/api'
import { fmtDate } from '@/components/kip/lib/format'
import { navigate } from '@/components/kip/lib/router'
import { useAuthStore } from '@/components/kip/stores/auth-store'
import {
  KpiGridSkeleton,
  RowsSkeleton,
  fmtTimeSlot,
} from '@/components/kip/portal/shared'
import type { LecturerOverview } from '@/components/kip/portal/types'
import { cn } from '@/lib/utils'

const fade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
}

/** "HH:MM" → minutes past midnight. */
const toMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

/** ISO-8601 week number (1–53) for the "Teaching week N" eyebrow. */
function isoWeekOf(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
}

export function DashboardView() {
  const { data, status, error, refetch } = useQuery<LecturerOverview>({
    queryKey: ['lecturer-overview'],
    queryFn: () => api<LecturerOverview>('/api/lecturer/overview'),
  })

  return (
    <QueryBoundary
      status={status}
      error={error}
      onRetry={() => void refetch()}
      skeleton={
        <div className="space-y-6">
          <RowsSkeleton rows={1} />
          <KpiGridSkeleton count={3} />
          <RowsSkeleton rows={3} />
        </div>
      }
    >
      {data && <DashboardBody data={data} />}
    </QueryBoundary>
  )
}

function DashboardBody({ data }: { data: LecturerOverview }) {
  const user = useAuthStore((s) => s.user)
  const firstName = (user?.name ?? 'Lecturer').trim().split(/\s+/)[0] ?? 'Lecturer'
  const today = new Date()
  const week = isoWeekOf(today)
  const nowMinutes = today.getHours() * 60 + today.getMinutes()

  return (
    <div className="space-y-6">
      {/* Greeting banner — deep emerald band with reed texture + gold glow */}
      <motion.section {...fade} transition={{ duration: 0.25 }} aria-labelledby="dash-greeting">
        <div className="bg-brand-band kip-pattern relative overflow-hidden rounded-2xl px-6 py-7 sm:px-8">
          <div
            className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-gold-400/15 blur-3xl"
            aria-hidden="true"
          />
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-400">
            Teaching week {week} · {today.toLocaleDateString('en-GB', { weekday: 'long' })}
          </p>
          <h1
            id="dash-greeting"
            className="mt-2 font-display text-2xl font-bold tracking-tight text-[#f2efe6] sm:text-3xl"
          >
            Karibu back, {firstName}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[#f2efe6]/70">
            Your teaching summary for {fmtDate(today)} — {data.todaySchedule.length} session
            {data.todaySchedule.length === 1 ? '' : 's'} on today&rsquo;s schedule.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/30 bg-gold-400/10 px-3 py-1 text-[11px] font-semibold text-gold-300">
              <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
              {data.coursesCount} programme{data.coursesCount === 1 ? '' : 's'} supported
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-[#f2efe6]/80">
              <BookOpen className="h-3.5 w-3.5 text-gold-400" aria-hidden="true" />
              {data.unitsCount} unit{data.unitsCount === 1 ? '' : 's'} taught
            </span>
          </div>
        </div>
      </motion.section>

      {/* KPI cards */}
      <motion.section
        {...fade}
        transition={{ duration: 0.25, delay: 0.05 }}
        aria-label="Teaching stats"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <Card className="rule-top-gold relative overflow-hidden">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">Units taught</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-primary dark:bg-brand-100">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-2 font-display text-3xl font-semibold tracking-tight tabular-nums">
              {data.unitsCount}
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">Across your timetable</p>
          </CardContent>
        </Card>
        <Card className="rule-top-gold relative overflow-hidden">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">Students reached</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-primary dark:bg-brand-100">
                <Users className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-2 font-display text-3xl font-semibold tracking-tight tabular-nums">
              {data.studentsCount}
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              Active learners in your courses
            </p>
          </CardContent>
        </Card>
        <Card className="rule-top-gold relative overflow-hidden">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">Today&rsquo;s sessions</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-primary dark:bg-brand-100">
                <Clock className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-2 font-display text-3xl font-semibold tracking-tight tabular-nums">
              {data.todaySchedule.length}
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {data.todaySchedule.length === 0
                ? 'A good day for marking and prep'
                : 'Classes scheduled today'}
            </p>
          </CardContent>
        </Card>
      </motion.section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Today's schedule */}
        <motion.section
          {...fade}
          transition={{ duration: 0.25, delay: 0.1 }}
          aria-labelledby="today-schedule"
          className="xl:col-span-2"
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle
                id="today-schedule"
                className="flex items-center gap-2 font-display text-base"
              >
                <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                Today&rsquo;s teaching schedule
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="min-h-9"
                onClick={() => navigate('/lecturer/timetable')}
              >
                Full timetable
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Button>
            </CardHeader>
            <CardContent>
              {data.todaySchedule.length === 0 ? (
                <EmptyState
                  icon={CalendarClock}
                  title="No classes today"
                  hint="No sessions are scheduled for today — a good day for marking and prep."
                  className="py-10"
                />
              ) : (
                <ul className="space-y-2.5">
                  {data.todaySchedule.map((c) => {
                    const isNow =
                      nowMinutes >= toMinutes(c.startTime) && nowMinutes < toMinutes(c.endTime)
                    return (
                      <li
                        key={c.id}
                        className={cn(
                          'flex flex-col gap-2 rounded-xl border p-3 transition-colors sm:flex-row sm:items-center sm:gap-4',
                          isNow
                            ? 'border-gold-400/50 bg-gold-400/10'
                            : 'border-border/60 hover:bg-muted/50',
                        )}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                          <div className="shrink-0 rounded-lg bg-brand-50 px-3 py-2 text-center dark:bg-brand-100">
                            <p className="text-sm font-bold tabular-nums text-primary">
                              {fmtTimeSlot(c.startTime)}
                            </p>
                            <p className="text-[10px] font-medium tabular-nums text-muted-foreground">
                              {fmtTimeSlot(c.endTime)}
                            </p>
                          </div>
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 truncate text-sm font-semibold">
                              {c.unitName ?? 'General session'}
                              {isNow && (
                                <Badge className="gap-1 border border-gold-400/40 bg-gold-400/15 text-[10px] font-bold uppercase tracking-wide text-gold-700 hover:bg-gold-400/15 dark:text-gold-300">
                                  <span
                                    className="relative flex h-1.5 w-1.5"
                                    aria-hidden="true"
                                  >
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-500 opacity-75" />
                                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold-500" />
                                  </span>
                                  Now
                                </Badge>
                              )}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {c.unitCode ? `${c.unitCode} · ` : ''}
                              {c.courseTitle}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          {c.campusName && (
                            <Badge variant="outline" className="gap-1.5 text-[10px] font-medium">
                              <MapPin className="h-3 w-3 text-primary" aria-hidden="true" />
                              {c.campusName}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-[10px] font-medium">
                            Room {c.room}
                          </Badge>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.section>

        {/* Quick links */}
        <motion.section {...fade} transition={{ duration: 0.25, delay: 0.15 }} aria-labelledby="quick-links">
          <Card className="h-full">
            <CardHeader className="pb-4">
              <CardTitle id="quick-links" className="flex items-center gap-2 font-display text-base">
                <GraduationCap className="h-4 w-4 text-primary" aria-hidden="true" />
                Quick links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => navigate('/lecturer/classes')}
                variant="outline"
                className="min-h-11 w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                  My classes
                </span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                onClick={() => navigate('/lecturer/results')}
                className="btn-gold min-h-11 w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  Enter results
                </span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                onClick={() => navigate('/lecturer/timetable')}
                variant="outline"
                className="min-h-11 w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary" aria-hidden="true" />
                  Weekly timetable
                </span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  )
}
