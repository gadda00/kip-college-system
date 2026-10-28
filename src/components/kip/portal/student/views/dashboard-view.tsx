'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock,
  Clock3,
  MapPin,
  Receipt,
  Sparkles,
  UserRound,
  Wallet,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/kip/components/empty-state'
import { QueryBoundary } from '@/components/kip/components/loading'
import { api } from '@/components/kip/lib/api'
import { fmtDate, fmtKES } from '@/components/kip/lib/format'
import { navigate } from '@/components/kip/lib/router'
import {
  KpiGridSkeleton,
  RowsSkeleton,
  fmtTimeSlot,
} from '@/components/kip/portal/shared'
import type { StudentDashboard, TimetableEntryDTO } from '@/components/kip/portal/types'
import { cn } from '@/lib/utils'

const fade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
}

const toMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

/** Presentation-only: is this class happening right now? */
function isNow(c: TimetableEntryDTO, nowMin: number): boolean {
  const start = toMinutes(c.startTime)
  const end = toMinutes(c.endTime)
  return start <= nowMin && nowMin < end
}

export function DashboardView() {
  const { data, status, error, refetch } = useQuery<StudentDashboard>({
    queryKey: ['student-dashboard'],
    queryFn: () => api<StudentDashboard>('/api/student/dashboard'),
  })

  return (
    <QueryBoundary
      status={status}
      error={error}
      onRetry={() => void refetch()}
      skeleton={
        <div className="space-y-6">
          <RowsSkeleton rows={1} />
          <KpiGridSkeleton count={4} />
          <RowsSkeleton rows={3} />
        </div>
      }
    >
      {data && <DashboardBody data={data} />}
    </QueryBoundary>
  )
}

function DashboardBody({ data }: { data: StudentDashboard }) {
  const { profile, fees, results, todayClasses, nextClasses, announcements } = data
  const firstName = profile.name.split(' ')[0] ?? profile.name
  const paidPct =
    fees.totalCharged > 0 ? Math.min(100, Math.round((fees.totalPaid / fees.totalCharged) * 100)) : 0
  const latestAnnouncements = announcements.slice(0, 3)
  const nextClass = nextClasses[0] ?? null
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes()

  // fee standing: paid = emerald, partial = gold, heavy balance = destructive
  const feeStanding =
    fees.balance <= 0
      ? {
          tone: 'text-emerald-700 dark:text-emerald-400',
          hint: 'text-emerald-700/80 dark:text-emerald-400/80',
          label: 'Fully paid — asante!',
        }
      : fees.balance > fees.totalCharged * 0.25
        ? {
            tone: 'text-destructive dark:text-red-400',
            hint: 'text-destructive/80 dark:text-red-400/80',
            label: 'Balance due — pay to avoid holds',
          }
        : {
            tone: 'text-gold-700 dark:text-gold-400',
            hint: 'text-gold-700/80 dark:text-gold-400/80',
            label: 'Small balance remaining — almost there',
          }

  return (
    <div className="space-y-6">
      {/* Greeting banner */}
      <motion.section {...fade} transition={{ duration: 0.25 }} aria-labelledby="dash-welcome">
        <div className="bg-brand-band kip-pattern relative overflow-hidden rounded-2xl border border-brand-800/60 p-5 text-[#f2efe6] sm:p-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-gold-400/10 blur-2xl"
          />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-300">
                Student dashboard · {profile.campus.name}
              </p>
              <h1
                id="dash-welcome"
                className="font-display mt-2 text-2xl font-bold tracking-tight sm:text-3xl"
              >
                Karibu, {firstName} 👋
              </h1>
              <p className="mt-1.5 text-sm text-[#f2efe6]/70">
                {profile.course.title} · Year {profile.yearOfStudy}, Term {profile.currentTerm} ·{' '}
                {fmtDate(new Date())}
              </p>
            </div>
            {nextClass && (
              <div className="flex w-full max-w-xs items-center gap-2.5 rounded-xl border border-gold-400/30 bg-gold-400/10 px-3 py-2.5 text-xs text-gold-300 sm:w-auto sm:max-w-none">
                <Clock3 className="h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                <p className="min-w-0 leading-snug">
                  <span className="font-semibold uppercase tracking-wide text-gold-400/90">
                    Next class
                  </span>{' '}
                  · {fmtTimeSlot(nextClass.startTime)} —{' '}
                  {nextClass.unitName ?? 'General session'}, Room {nextClass.room}
                </p>
              </div>
            )}
          </div>
          {/* quick actions */}
          <div className="relative mt-5 flex flex-wrap gap-2">
            <Button
              onClick={() => navigate('/portal/fees')}
              className="btn-gold focus-glow min-h-11"
            >
              <Receipt className="mr-2 h-4 w-4" aria-hidden="true" />
              Pay fees
            </Button>
            <Button
              onClick={() => navigate('/portal/results')}
              variant="outline"
              className="focus-glow min-h-11 border-white/20 bg-white/5 text-[#f2efe6] hover:bg-white/10 hover:text-white"
            >
              <Award className="mr-2 h-4 w-4" aria-hidden="true" />
              View results
            </Button>
            <Button
              onClick={() => navigate('/portal/timetable')}
              variant="outline"
              className="focus-glow min-h-11 border-white/20 bg-white/5 text-[#f2efe6] hover:bg-white/10 hover:text-white"
            >
              <CalendarDays className="mr-2 h-4 w-4" aria-hidden="true" />
              Timetable
            </Button>
            <Button
              onClick={() => navigate('/portal/profile')}
              variant="ghost"
              className="focus-glow min-h-11 text-[#f2efe6]/70 hover:bg-white/10 hover:text-white"
            >
              <UserRound className="mr-2 h-4 w-4" aria-hidden="true" />
              My profile
            </Button>
          </div>
        </div>
      </motion.section>

      {/* KPI cards */}
      <motion.section
        {...fade}
        transition={{ duration: 0.25, delay: 0.05 }}
        aria-label="Your key stats"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">Fees paid</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600/10 text-brand-700 dark:text-brand-300">
                <Wallet className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="font-display mt-2 text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
              {paidPct}
              <span className="text-base font-semibold text-muted-foreground">%</span>
            </p>
            {/* brand fill + gold marker */}
            <div
              role="progressbar"
              aria-valuenow={paidPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Fee payment progress: ${paidPct}% paid`}
              className="relative mt-2.5 h-2 w-full overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-500"
                style={{ width: `${paidPct}%` }}
              />
              {paidPct > 0 && paidPct < 100 && (
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 h-3.5 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-400"
                  style={{ left: `${paidPct}%` }}
                />
              )}
            </div>
            <p className="mt-1.5 text-xs font-medium text-muted-foreground">
              {fmtKES(fees.totalPaid)} of {fmtKES(fees.totalCharged)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">Fee balance</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-400/15 text-gold-700 dark:text-gold-400">
                <Receipt className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p
              className={cn(
                'font-display mt-2 text-2xl font-bold tracking-tight tabular-nums sm:text-3xl',
                feeStanding.tone,
              )}
            >
              {fmtKES(fees.balance)}
            </p>
            <p className={cn('mt-1 text-xs font-medium', feeStanding.hint)}>{feeStanding.label}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">Units enrolled</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600/10 text-brand-700 dark:text-brand-300">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="font-display mt-2 text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
              {data.units.length}
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {data.units[0]?.stageLabel ?? `Term ${profile.currentTerm}`} units in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">Results so far</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-400/15 text-gold-700 dark:text-gold-400">
                <Award className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="font-display mt-2 text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
              {results.gpa.toFixed(2)}
              <span className="ml-1 text-sm font-semibold text-muted-foreground">GPA</span>
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              Avg {results.average.toFixed(1)}% across {results.unitsDone} units
            </p>
          </CardContent>
        </Card>
      </motion.section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Today's classes + fee progress */}
        <div className="space-y-6 xl:col-span-2">
          <motion.section {...fade} transition={{ duration: 0.25, delay: 0.1 }} aria-labelledby="today-classes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle id="today-classes" className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4 text-gold-600 dark:text-gold-400" aria-hidden="true" />
                  Today&rsquo;s classes
                  <Badge variant="secondary" className="text-[10px] font-medium">
                    {profile.campus.name}
                  </Badge>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="focus-glow min-h-9"
                  onClick={() => navigate('/portal/timetable')}
                >
                  Full timetable
                  <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Button>
              </CardHeader>
              <CardContent>
                {todayClasses.length === 0 ? (
                  <EmptyState
                    icon={CalendarDays}
                    title="No classes today"
                    hint="Enjoy the free day — check your weekly timetable to plan ahead."
                    className="py-10"
                  />
                ) : (
                  <ul className="divide-y">
                    {todayClasses.map((c) => {
                      const live = isNow(c, nowMin)
                      return (
                        <li
                          key={c.id}
                          className="flex flex-col gap-2 py-3.5 transition-colors hover:bg-brand-50/50 sm:flex-row sm:items-center sm:gap-4 dark:hover:bg-brand-100/15"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-4">
                            <div className="shrink-0 rounded-lg bg-brand-50 px-3 py-2 text-center dark:bg-brand-100">
                              <p className="text-sm font-bold text-brand-800 dark:text-brand-100">
                                {fmtTimeSlot(c.startTime)}
                              </p>
                              <p className="text-[10px] font-medium text-muted-foreground">
                                {fmtTimeSlot(c.endTime)}
                              </p>
                            </div>
                            <div className="min-w-0">
                              <p className="flex items-center gap-2 truncate text-sm font-semibold">
                                {c.unitName ?? 'General session'}
                                {live && (
                                  <span
                                    className="animate-pulse-ring shrink-0 rounded-full bg-gold-400 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-brand-950"
                                    aria-label="Happening now"
                                  >
                                    Now
                                  </span>
                                )}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {c.unitCode ? `${c.unitCode} · ` : ''}Room {c.room}
                                {c.lecturerName ? ` · ${c.lecturerName}` : ''}
                              </p>
                            </div>
                          </div>
                          {c.campusName && (
                            <Badge variant="outline" className="w-fit shrink-0 gap-1.5 text-[10px] font-medium">
                              <MapPin className="h-3 w-3 text-gold-600 dark:text-gold-400" aria-hidden="true" />
                              {c.campusName}
                            </Badge>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.section>

          {/* Fee payment progress */}
          <motion.section {...fade} transition={{ duration: 0.25, delay: 0.15 }} aria-labelledby="fee-progress">
            <Card className="relative rule-top-gold">
              <CardHeader className="pb-4">
                <CardTitle id="fee-progress" className="flex items-center gap-2 text-base">
                  <Receipt className="h-4 w-4 text-gold-600 dark:text-gold-400" aria-hidden="true" />
                  Fee payment progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="font-display text-2xl font-bold tracking-tight tabular-nums">
                      {fmtKES(fees.totalPaid)}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">
                      paid of {fmtKES(fees.totalCharged)} charged
                    </p>
                  </div>
                  <p className="font-display text-sm font-bold text-brand-700 dark:text-gold-400">
                    {paidPct}% cleared
                  </p>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={paidPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Fee payment progress: ${paidPct}% paid`}
                  className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-500"
                    style={{ width: `${paidPct}%` }}
                  />
                  {paidPct > 0 && paidPct < 100 && (
                    <span
                      aria-hidden="true"
                      className="absolute top-1/2 h-4 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-400"
                      style={{ left: `${paidPct}%` }}
                    />
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                      Paid {fmtKES(fees.totalPaid)}
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span
                        className="h-2 w-2 rounded-full bg-gold-400"
                        aria-hidden="true"
                      />
                      Balance {fmtKES(fees.balance)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="focus-glow min-h-9 text-brand-700 hover:bg-brand-50 dark:text-gold-400 dark:hover:bg-brand-100/20"
                    onClick={() => navigate('/portal/fees')}
                  >
                    Open full statement
                    <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </div>

        {/* Announcements */}
        <motion.section {...fade} transition={{ duration: 0.25, delay: 0.2 }} aria-labelledby="latest-announcements" className="min-w-0">
          <Card className="flex h-full flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle id="latest-announcements" className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4 text-gold-600 dark:text-gold-400" aria-hidden="true" />
                Announcements
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="focus-glow min-h-9"
                onClick={() => navigate('/portal/announcements')}
              >
                View all
                <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1">
              {latestAnnouncements.length === 0 ? (
                <EmptyState
                  icon={Bell}
                  title="No announcements yet"
                  hint="College notices will appear here."
                  className="py-10"
                />
              ) : (
                <ul className="max-h-96 space-y-3 overflow-y-auto custom-scrollbar pr-1">
                  {latestAnnouncements.map((a) => (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() => navigate('/portal/announcements')}
                        className="focus-glow w-full rounded-xl border p-3 text-left transition-colors hover:border-brand-600/30 hover:bg-brand-50/60 dark:hover:bg-brand-100/15"
                      >
                        <div className="flex items-center gap-2">
                          {a.pinned && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-gold-500/30 bg-gold-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-gold-700 dark:text-gold-300">
                              <Sparkles className="h-3 w-3" aria-hidden="true" />
                              Pinned
                            </span>
                          )}
                          <p className="truncate text-sm font-semibold">{a.title}</p>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {a.body}
                        </p>
                        <p className="mt-1.5">
                          <span className="inline-flex items-center rounded-md border border-gold-500/30 bg-gold-400/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-gold-700 dark:text-gold-300">
                            {fmtDate(a.createdAt)}
                          </span>
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  )
}
