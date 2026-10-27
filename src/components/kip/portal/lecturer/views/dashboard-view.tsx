'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  Briefcase,
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
import { KpiGridSkeleton, RowsSkeleton, ViewHeading, fmtTimeSlot } from '@/components/kip/portal/shared'
import type { LecturerOverview } from '@/components/kip/portal/types'

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
  return (
    <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <ViewHeading
          title="Lecturer Dashboard"
          description={`Your teaching summary for ${fmtDate(new Date())}.`}
        />
      </motion.section>

      {/* KPI cards */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        aria-label="Teaching stats"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">Units taught</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{data.unitsCount}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">Across your timetable</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">Courses</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Briefcase className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{data.coursesCount}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">Programmes you support</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">Students reached</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {data.studentsCount}
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">Active learners in your courses</p>
          </CardContent>
        </Card>
      </motion.section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Today's schedule */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          aria-labelledby="today-schedule"
          className="xl:col-span-2"
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle id="today-schedule" className="flex items-center gap-2 text-base">
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
                <ul className="divide-y">
                  {data.todaySchedule.map((c) => (
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
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.section>

        {/* Quick links */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
          aria-labelledby="quick-links"
        >
          <Card className="h-full">
            <CardHeader className="pb-4">
              <CardTitle id="quick-links" className="flex items-center gap-2 text-base">
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
                className="min-h-11 w-full justify-between"
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
