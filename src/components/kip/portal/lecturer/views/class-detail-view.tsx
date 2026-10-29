'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  ChartColumn,
  ClipboardEdit,
  Clock3,
  GraduationCap,
  Mail,
  Phone,
  Printer,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/kip/components/empty-state'
import { QueryBoundary } from '@/components/kip/components/loading'
import { api } from '@/components/kip/lib/api'
import { navigate } from '@/components/kip/lib/router'
import { RowsSkeleton, ViewHeading, GradeBadge, initialsOf } from '@/components/kip/portal/shared'
import { ClassRegisterDoc, usePrintDoc } from '@/components/kip/portal/print-doc'
import { useAuthStore } from '@/components/kip/stores/auth-store'
import type { LecturerClassAnalytics, LecturerClassDetail } from '@/components/kip/portal/types'
import { cn } from '@/lib/utils'

export function ClassDetailView({ unitId }: { unitId: string }) {
  const { data, status, error, refetch } = useQuery<LecturerClassDetail>({
    queryKey: ['lecturer-class', unitId],
    queryFn: () => api<LecturerClassDetail>(`/api/lecturer/classes/${unitId}`),
    retry: false,
  })

  return (
    <QueryBoundary
      status={status}
      error={error}
      onRetry={() => void refetch()}
      skeleton={<RowsSkeleton rows={4} />}
    >
      {data && <ClassDetailBody data={data} />}
    </QueryBoundary>
  )
}

function ClassDetailBody({ data }: { data: LecturerClassDetail }) {
  const { unit, students, analytics } = data
  const withResults = students.filter((s) => s.result).length
  const user = useAuthStore((s) => s.user)
  const { print, printDoc } = usePrintDoc(
    () => <ClassRegisterDoc data={data} lecturerName={user?.name ?? 'Class lecturer'} />,
  )

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <ViewHeading
          title={unit.name}
          description={`${unit.course.title} · ${unit.stageLabel}`}
          actions={
            <Button
              variant="outline"
              className="min-h-11"
              onClick={() => navigate('/lecturer/classes')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              All classes
            </Button>
          }
        />
      </motion.div>

      {/* Unit header — sapphire wash + gold top rule */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        aria-label="Unit details"
      >
        <Card className="rule-top-gold relative overflow-hidden border-brand-700/20 bg-gradient-to-br from-brand-50/70 via-card to-card dark:border-brand-500/20 dark:from-brand-100/40">
          <CardContent className="flex flex-wrap items-start justify-between gap-4 p-4 sm:p-6">
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-primary dark:bg-brand-100">
                <BookOpen className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <span className="inline-flex items-center rounded-md bg-brand-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-brand-800 dark:bg-brand-100 dark:text-[#f2efe6]">
                  {unit.code}
                </span>
                <h2 className="mt-1.5 font-display text-lg font-bold leading-snug">{unit.name}</h2>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="text-[10px]">
                    {unit.stageLabel}
                  </Badge>
                  <Badge variant="outline" className="gap-1.5 text-[10px] font-medium">
                    <GraduationCap className="h-3 w-3 text-primary" aria-hidden="true" />
                    <span className="max-w-56 truncate">{unit.course.title}</span>
                  </Badge>
                  <Badge variant="outline" className="gap-1.5 text-[10px] font-medium">
                    <Clock3 className="h-3 w-3 text-primary" aria-hidden="true" />
                    {unit.weekHours}h/week scheduled
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Button
                onClick={() => print()}
                variant="outline"
                className="min-h-11"
                aria-label="Print the official class register for this unit"
              >
                <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
                Print register
              </Button>
              <Button
                onClick={() => navigate(`/lecturer/results/${unit.id}`)}
                className="btn-gold min-h-11"
              >
                <ClipboardEdit className="mr-2 h-4 w-4" aria-hidden="true" />
                Enter results for this unit
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Class analytics (Task 8-b) */}
      <ClassAnalytics analytics={analytics} />

      {/* Roster */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1 }}
        aria-labelledby="roster"
      >
        <Card>
          <CardHeader className="pb-4">
            <CardTitle id="roster" className="flex flex-wrap items-center gap-2 font-display text-base">
              <Users className="h-4 w-4 text-primary" aria-hidden="true" />
              Class roster
              <Badge variant="secondary" className="text-[10px]">
                {students.length} enrolled
              </Badge>
              <Badge className="border border-gold-400/40 bg-gold-400/15 text-[10px] font-semibold text-gold-700 hover:bg-gold-400/15 dark:text-gold-300">
                {withResults} with results
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No students enrolled at this stage"
                hint="Students appear here when they are active and at this term of the course."
                className="py-12"
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="sticky left-0 z-10 min-w-44 bg-brand-50 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-[#f2efe6]">
                        Student
                      </TableHead>
                      <TableHead className="min-w-32 bg-brand-50 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-[#f2efe6]">
                        Admission No
                      </TableHead>
                      <TableHead className="min-w-36 bg-brand-50 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-[#f2efe6]">
                        Contact
                      </TableHead>
                      <TableHead className="min-w-20 bg-brand-50 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-[#f2efe6]">
                        Term
                      </TableHead>
                      <TableHead className="min-w-40 bg-brand-50 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-[#f2efe6]">
                        Current result
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((s, i) => (
                      <TableRow key={s.id} className="odd:bg-muted">
                        <TableCell
                          className={cn('sticky left-0 z-10', i % 2 === 1 ? 'bg-muted' : 'bg-card')}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              aria-hidden="true"
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-700 text-[11px] font-bold text-[#f2efe6]"
                            >
                              {initialsOf(s.name)}
                            </span>
                            <p className="min-w-0 truncate text-sm font-semibold">{s.name}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {s.admissionNo}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5 text-xs text-muted-foreground">
                            {s.phone && (
                              <p className="flex items-center gap-1.5">
                                <Phone className="h-3 w-3 shrink-0 text-primary" aria-hidden="true" />
                                {s.phone}
                              </p>
                            )}
                            <p className="flex items-center gap-1.5">
                              <Mail className="h-3 w-3 shrink-0 text-primary" aria-hidden="true" />
                              <span className="max-w-48 truncate">{s.email}</span>
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-sm tabular-nums">
                          T{s.currentTerm}
                        </TableCell>
                        <TableCell className="text-center">
                          {s.result ? (
                            <div className="inline-flex items-center gap-2">
                              <GradeBadge grade={s.result.grade} />
                              <span className="text-xs font-semibold tabular-nums">
                                {s.result.marks.toFixed(0)}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {s.result.term}
                              </span>
                            </div>
                          ) : (
                            <Badge
                              className="border border-gold-400/40 bg-gold-400/15 text-[10px] font-medium text-gold-700 hover:bg-gold-400/15 dark:text-gold-300"
                            >
                              Not entered
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>

      {printDoc}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Class analytics (Task 8-b)
// ---------------------------------------------------------------------------

/** Grade → chart palette token (sapphire, gold, teal, sage, bronze). */
const GRADE_CHART_COLOR: Record<string, string> = {
  A: 'var(--chart-1)',
  B: 'var(--chart-2)',
  C: 'var(--chart-3)',
  D: 'var(--chart-4)',
  E: 'var(--chart-5)',
}

/** Grade distribution bar chart data. */
function gradeChartData(gradeCounts: Record<string, number>) {
  return (['A', 'B', 'C', 'D', 'E'] as const).map((grade) => ({
    grade,
    count: gradeCounts[grade] ?? 0,
  }))
}

/** Class analytics card: KPIs + grade distribution chart. */
function ClassAnalytics({ analytics }: { analytics: LecturerClassAnalytics }) {
  const chartData = gradeChartData(analytics.gradeCounts)
  const entryRate =
    analytics.totalStudents > 0
      ? Math.round((analytics.withResults / analytics.totalStudents) * 100)
      : 0

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.08 }}
      aria-labelledby="class-analytics"
    >
      <Card>
        <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle id="class-analytics" className="flex items-center gap-2 font-display text-base">
            <ChartColumn className="h-4 w-4 text-primary" aria-hidden="true" />
            Class analytics
          </CardTitle>
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:max-w-xs sm:justify-end">
            <Progress value={entryRate} className="h-2 flex-1" aria-hidden="true" />
            <p className="shrink-0 text-xs font-medium text-muted-foreground">
              <span className="font-bold text-foreground">{analytics.withResults}</span>/
              {analytics.totalStudents} results
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {analytics.withResults === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No results entered yet"
              hint="Class averages, grade distribution and pass rate appear here once you enter marks for this unit."
              className="py-10"
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              {/* KPI tiles */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2">
                <AnalyticsTile
                  label="Class average"
                  value={analytics.average != null ? `${analytics.average.toFixed(1)}` : '—'}
                  unit="%"
                />
                <AnalyticsTile
                  label="Highest mark"
                  value={analytics.highest != null ? `${analytics.highest.toFixed(0)}` : '—'}
                  unit="/100"
                />
                <AnalyticsTile
                  label="Lowest mark"
                  value={analytics.lowest != null ? `${analytics.lowest.toFixed(0)}` : '—'}
                  unit="/100"
                />
                <AnalyticsTile
                  label="Pass rate (≥50)"
                  value={analytics.passRate != null ? `${analytics.passRate.toFixed(1)}` : '—'}
                  unit="%"
                  highlight
                />
              </div>

              {/* Grade distribution chart */}
              <div
                className="text-muted-foreground"
                role="img"
                aria-label={`Grade distribution: ${chartData
                  .map((d) => `${d.count} grade ${d.grade}`)
                  .join(', ')}`}
              >
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="grade"
                      tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                      stroke="var(--border)"
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                      stroke="var(--border)"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--brand-950)',
                        border: '1px solid color-mix(in oklch, var(--gold-400) 45%, transparent)',
                        borderRadius: '8px',
                        color: '#f2efe6',
                        fontSize: '12px',
                      }}
                      labelStyle={{ color: 'var(--gold-300)', fontWeight: 700 }}
                      cursor={{ fill: 'var(--brand-50)' }}
                      formatter={(value: number | string) => [
                        `${value} student${Number(value) === 1 ? '' : 's'}`,
                        'Grade',
                      ]}
                    />
                    <Bar
                      dataKey="count"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={56}
                      aria-label="Number of students per grade"
                    >
                      {chartData.map((d) => (
                        <Cell key={d.grade} fill={GRADE_CHART_COLOR[d.grade] ?? 'var(--chart-1)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.section>
  )
}

function AnalyticsTile({
  label,
  value,
  unit,
  highlight = false,
}: {
  label: string
  value: string
  unit: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-3 sm:p-4',
        highlight ? 'border-gold-400/45 bg-gold-400/10' : 'border-border/70',
      )}
    >
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
        {value}
        <span className="ml-0.5 font-sans text-xs font-semibold text-muted-foreground">{unit}</span>
      </p>
    </div>
  )
}
