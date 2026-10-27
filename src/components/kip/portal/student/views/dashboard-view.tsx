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
  GraduationCap,
  MapPin,
  Receipt,
  UserRound,
  Wallet,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { EmptyState } from '@/components/kip/components/empty-state'
import { QueryBoundary } from '@/components/kip/components/loading'
import { api } from '@/components/kip/lib/api'
import { fmtDate, fmtKES } from '@/components/kip/lib/format'
import { navigate } from '@/components/kip/lib/router'
import {
  KpiGridSkeleton,
  RowsSkeleton,
  ViewHeading,
  fmtTimeSlot,
} from '@/components/kip/portal/shared'
import type { StudentDashboard } from '@/components/kip/portal/types'
import { cn } from '@/lib/utils'

const fade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
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
  const { profile, fees, results, todayClasses, announcements } = data
  const firstName = profile.name.split(' ')[0] ?? profile.name
  const paidPct =
    fees.totalCharged > 0 ? Math.min(100, Math.round((fees.totalPaid / fees.totalCharged) * 100)) : 0
  const latestAnnouncements = announcements.slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <motion.section {...fade} transition={{ duration: 0.25 }} aria-labelledby="dash-welcome">
        <ViewHeading
          title={`Karibu tena, ${firstName}`}
          description={`${profile.course.title} · Year ${profile.yearOfStudy}, Term ${profile.currentTerm} · ${fmtDate(new Date())}`}
          actions={
            <Badge variant="secondary" className="gap-1.5 py-1.5 pl-2 pr-3">
              <GraduationCap className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              {profile.campus.name}
            </Badge>
          }
        />
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
              <p className="text-xs font-medium text-muted-foreground">Fee balance</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Wallet className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p
              className={cn(
                'mt-2 text-xl font-bold tracking-tight sm:text-2xl',
                fees.balance > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400',
              )}
            >
              {fmtKES(fees.balance)}
            </p>
            <p
              className={cn(
                'mt-1 text-xs font-medium',
                fees.balance > 0
                  ? fees.balance > fees.totalCharged * 0.25
                    ? 'text-red-600/80 dark:text-red-400/80'
                    : 'text-amber-600 dark:text-amber-400'
                  : 'text-green-600/80 dark:text-green-400/80',
              )}
            >
              {fees.balance > 0 ? 'Balance due — pay to avoid holds' : 'Fully paid — asante!'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">Current course</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm font-bold leading-snug sm:text-base">
              {profile.course.title}
            </p>
            <Badge variant="outline" className="mt-2 text-[10px] font-medium">
              {profile.course.level}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">Results so far</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Award className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
              {results.gpa.toFixed(2)}
              <span className="ml-1 text-sm font-medium text-muted-foreground">GPA</span>
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              Avg {results.average.toFixed(1)}% across {results.unitsDone} units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">Units this term</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">{data.units.length}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {data.units[0]?.stageLabel ?? `Term ${profile.currentTerm}`} units in progress
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
                  <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                  Today&rsquo;s classes
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="min-h-9"
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
                    {todayClasses.map((c) => (
                      <li key={c.id} className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                          <div className="shrink-0 rounded-lg bg-primary/10 px-3 py-2 text-center">
                            <p className="text-sm font-bold text-primary">{fmtTimeSlot(c.startTime)}</p>
                            <p className="text-[10px] font-medium text-muted-foreground">
                              {fmtTimeSlot(c.endTime)}
                            </p>
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{c.unitName ?? 'General session'}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {c.unitCode ? `${c.unitCode} · ` : ''}Room {c.room}
                              {c.lecturerName ? ` · ${c.lecturerName}` : ''}
                            </p>
                          </div>
                        </div>
                        {c.campusName && (
                          <Badge variant="outline" className="w-fit shrink-0 gap-1.5 text-[10px] font-medium">
                            <MapPin className="h-3 w-3 text-primary" aria-hidden="true" />
                            {c.campusName}
                          </Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.section>

          {/* Fee progress + quick actions */}
          <motion.section {...fade} transition={{ duration: 0.25, delay: 0.15 }} aria-labelledby="fee-progress">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle id="fee-progress" className="flex items-center gap-2 text-base">
                  <Receipt className="h-4 w-4 text-primary" aria-hidden="true" />
                  Fee payment progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="text-2xl font-bold tracking-tight">{fmtKES(fees.totalPaid)}</p>
                    <p className="text-xs font-medium text-muted-foreground">paid of {fmtKES(fees.totalCharged)} charged</p>
                  </div>
                  <p className="text-sm font-semibold text-primary">{paidPct}%</p>
                </div>
                <Progress
                  value={paidPct}
                  aria-label={`Fee payment progress: ${paidPct}% paid`}
                  className="h-2.5"
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button onClick={() => navigate('/portal/fees')} className="min-h-11">
                    <Receipt className="mr-2 h-4 w-4" aria-hidden="true" />
                    Pay fees
                  </Button>
                  <Button onClick={() => navigate('/portal/results')} variant="outline" className="min-h-11">
                    <Award className="mr-2 h-4 w-4" aria-hidden="true" />
                    View results
                  </Button>
                  <Button onClick={() => navigate('/portal/timetable')} variant="outline" className="min-h-11">
                    <CalendarDays className="mr-2 h-4 w-4" aria-hidden="true" />
                    Timetable
                  </Button>
                  <Button onClick={() => navigate('/portal/profile')} variant="ghost" className="min-h-11">
                    <UserRound className="mr-2 h-4 w-4" aria-hidden="true" />
                    My profile
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
                <Bell className="h-4 w-4 text-primary" aria-hidden="true" />
                Announcements
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="min-h-9"
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
                        className="w-full rounded-lg border p-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/5"
                      >
                        <div className="flex items-center gap-2">
                          {a.pinned && (
                            <Badge className="bg-amber-400/15 text-amber-700 hover:bg-amber-400/15 dark:text-amber-400">
                              Pinned
                            </Badge>
                          )}
                          <p className="truncate text-sm font-semibold">{a.title}</p>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {a.body}
                        </p>
                        <p className="mt-1.5 text-[11px] text-muted-foreground">{fmtDate(a.createdAt)}</p>
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
