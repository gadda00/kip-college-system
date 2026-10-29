'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowUpRight,
  Award,
  BellRing,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Inbox,
  Landmark,
  TrendingUp,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { KpiCard } from '@/components/kip/components/stat-card'
import { QueryBoundary } from '@/components/kip/components/loading'
import { KipLink } from '@/components/kip/components/link'
import { api } from '@/components/kip/lib/api'
import { navigate } from '@/components/kip/lib/router'
import { fmtKES, fmtDate } from '@/components/kip/lib/format'
import {
  KpiGridSkeleton,
  LoadErrorCard,
  TableSkeleton,
  ViewHeading,
} from '@/components/kip/portal/shared'
import {
  PendingPaymentRow,
  usePaymentReview,
} from '@/components/kip/admin/views/fees-view'
import type { AdminOverview, AdminPaymentRow } from '@/components/kip/admin/types'

/** Brand chart palette — emerald / gold / bronze / sage via CSS vars. */
const EMERALD = 'var(--chart-1)'
const GOLD = 'var(--chart-2)'
const SAGE = 'var(--chart-4)'
const BRONZE = 'var(--chart-5)'

const CATEGORY_COLORS: Record<string, string> = {
  TECHNICAL: EMERALD,
  BUSINESS: GOLD,
  KASNEB: BRONZE,
}

function monthLabel(month: string): string {
  const [y, m] = month.split('-')
  const d = new Date(Number(y), Number(m) - 1, 1)
  return d.toLocaleDateString('en-GB', { month: 'short' })
}

/** Task 8-c — collections vs outstanding + fee collection rate + applications funnel. */
function CollectionsAndFunnelSection({ data }: { data: AdminOverview }) {
  const billed = data.totalBilled || data.collectionsTotal + data.outstandingBalance
  const collected = data.collectionsTotal
  const outstanding = data.outstandingBalance
  const collectionRate = billed > 0 ? Math.min(100, Math.round((collected / billed) * 1000) / 10) : 0
  const outstandingShare = billed > 0 ? Math.min(100, Math.round((outstanding / billed) * 1000) / 10) : 0

  const funnel = [
    {
      key: 'PENDING',
      label: 'Pending review',
      count: data.applicationsPending,
      icon: Inbox,
      bar: 'bg-gold-400',
      text: 'text-gold-700 dark:text-gold-300',
    },
    {
      key: 'ACCEPTED',
      label: 'Accepted & enrolled',
      count: data.applicationsAccepted,
      icon: CheckCircle2,
      bar: 'bg-emerald-600',
      text: 'text-emerald-700 dark:text-emerald-400',
    },
    {
      key: 'REJECTED',
      label: 'Rejected',
      count: data.applicationsRejected,
      icon: XCircle,
      bar: 'bg-red-600',
      text: 'text-red-600 dark:text-red-400',
    },
  ]
  const applicationsTotal = funnel.reduce((sum, f) => sum + f.count, 0)

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {/* Collections vs outstanding */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 font-display text-base">
            <Wallet className="h-4 w-4 text-primary" aria-hidden="true" />
            Collections vs outstanding
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Confirmed payments against total fees billed, all students
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* fee collection rate KPI */}
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fee collection rate</p>
              <p className="font-display text-3xl font-bold tabular-nums tracking-tight text-primary">
                {collectionRate.toLocaleString('en-KE', { maximumFractionDigits: 1 })}%
              </p>
            </div>
            <Badge
              variant="secondary"
              className="text-[10px]"
              aria-label={`${collectionRate}% of billed fees collected`}
            >
              {fmtKES(collected)} of {fmtKES(billed)}
            </Badge>
          </div>
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={Math.round(collectionRate)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Fee collection rate"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-700 to-brand-500"
              style={{ width: `${Math.min(100, collectionRate)}%` }}
            />
          </div>

          {/* mini comparison bars */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Collected</p>
                <p className="text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                  {fmtKES(collected)}
                </p>
              </div>
              <div
                className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={Math.round(collectionRate)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Share of billed fees collected"
              >
                <div
                  className="h-full rounded-full bg-emerald-600"
                  style={{ width: `${Math.min(100, collectionRate)}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {collectionRate.toLocaleString('en-KE', { maximumFractionDigits: 1 })}% of billed
              </p>
            </div>
            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Outstanding</p>
                <p className="text-sm font-bold tabular-nums text-gold-700 dark:text-gold-300">
                  {fmtKES(outstanding)}
                </p>
              </div>
              <div
                className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={Math.round(outstandingShare)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Share of billed fees outstanding"
              >
                <div
                  className="h-full rounded-full bg-gold-400"
                  style={{ width: `${Math.min(100, outstandingShare)}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {outstandingShare.toLocaleString('en-KE', { maximumFractionDigits: 1 })}% of billed
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            className="min-h-11 w-full"
            onClick={() => navigate('/admin/reports')}
          >
            Export the outstanding-fees CSV
            <ArrowUpRight className="ml-2 h-4 w-4 text-gold-600 dark:text-gold-400" aria-hidden="true" />
          </Button>
        </CardContent>
      </Card>

      {/* Applications funnel */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 font-display text-base">
            <Inbox className="h-4 w-4 text-primary" aria-hidden="true" />
            Applications funnel
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {applicationsTotal} application{applicationsTotal === 1 ? '' : 's'} received to date
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {funnel.map((stage) => {
            const Icon = stage.icon
            const pct = applicationsTotal > 0 ? Math.round((stage.count / applicationsTotal) * 100) : 0
            return (
              <div key={stage.key} className="rounded-xl border p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Icon className={`h-4 w-4 ${stage.text}`} aria-hidden="true" />
                    {stage.label}
                  </p>
                  <p className={`text-sm font-bold ${stage.text}`}>
                    {stage.count}
                    <span className="ml-1.5 text-[11px] font-medium text-muted-foreground">{pct}%</span>
                  </p>
                </div>
                <div
                  className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${stage.label} share of applications`}
                >
                  <div
                    className={`h-full rounded-full ${stage.bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
          <Button
            variant="outline"
            className="min-h-11 w-full"
            onClick={() => navigate('/admin/applications')}
          >
            Review applications
            <ArrowUpRight className="ml-2 h-4 w-4 text-gold-600 dark:text-gold-400" aria-hidden="true" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function methodBadgeVariant(method: string): string {
  switch (method) {
    case 'MPESA':
      return 'border-transparent bg-emerald-600/15 text-emerald-700 dark:text-emerald-400'
    case 'BANK':
      return 'border-transparent bg-gold-400/15 text-gold-700 dark:text-gold-300'
    default:
      return 'border-transparent bg-muted text-muted-foreground'
  }
}

// ---------------------------------------------------------------------------
// "Needs your attention" queue (Task 5-c)
// ---------------------------------------------------------------------------

/**
 * Prominent action queue at the top of the overview — renders ONLY when
 * something actually needs the registrar: PENDING student payments awaiting
 * finance confirmation (Confirm / Reject inline) and new PENDING applications
 * (single link into the applications view). When both queries succeed and
 * nothing awaits, a quiet success chip shows instead; while either query is
 * still loading it renders nothing (no layout flash).
 */
function NeedsAttentionSection({
  applicationsPending,
  payments,
}: {
  applicationsPending: number | null
  payments: UseQueryResult<AdminPaymentRow[]>
}) {
  const review = usePaymentReview()

  if (payments.isError) {
    return (
      <LoadErrorCard
        compact
        what="payments awaiting confirmation"
        error={payments.error}
        onRetry={() => void payments.refetch()}
      />
    )
  }
  if (applicationsPending == null || !payments.data) return null

  const pendingPayments = payments.data.filter((p) => p.status === 'PENDING')
  const total = pendingPayments.length + applicationsPending
  if (total === 0) {
    return (
      <p className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3.5 py-1.5 text-xs font-medium text-success">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        All caught up — nothing needs your attention.
      </p>
    )
  }

  return (
    <Card className="border-warning/40" aria-labelledby="needs-attention-title">
      <CardHeader className="pb-3">
        <CardTitle
          id="needs-attention-title"
          className="flex flex-wrap items-center gap-2 font-display text-base"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/15 text-warning-foreground"
            aria-hidden="true"
          >
            <BellRing className="h-4 w-4" />
          </span>
          Needs your attention
          <Badge className="border-warning/30 bg-warning/15 text-[10px] font-semibold text-warning-foreground">
            {total} item{total === 1 ? '' : 's'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {pendingPayments.length > 0 && (
          <section aria-labelledby="na-payments">
            <h3
              id="na-payments"
              className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
            >
              <Clock className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
              Payments awaiting confirmation ({pendingPayments.length})
            </h3>
            <ul className="mt-2 max-h-80 space-y-2 overflow-y-auto custom-scrollbar pr-1">
              {pendingPayments.map((p) => (
                <PendingPaymentRow key={p.id} payment={p} review={review} />
              ))}
            </ul>
          </section>
        )}

        {applicationsPending > 0 && (
          <section
            aria-labelledby="na-applications"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-200/70 bg-brand-50/60 p-4 dark:border-white/10 dark:bg-brand-100/40"
          >
            <p
              id="na-applications"
              className="flex flex-wrap items-center gap-2 text-sm font-medium"
            >
              <Inbox className="h-4 w-4 text-primary" aria-hidden="true" />
              New applications
              <Badge variant="secondary" className="text-[10px]">
                {applicationsPending} pending
              </Badge>
            </p>
            <KipLink
              to="/admin/applications"
              className="focus-glow inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              {`Review ${applicationsPending} pending application${
                applicationsPending === 1 ? '' : 's'
              }`}
              <span aria-hidden="true">→</span>
            </KipLink>
          </section>
        )}
      </CardContent>
    </Card>
  )
}

function ChartTooltipStyle() {
  return {
    backgroundColor: 'var(--popover)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--popover-foreground)',
    fontSize: '12px',
    boxShadow: '0 12px 32px -16px rgba(0, 0, 0, 0.35)',
  } as const
}

/** Shared axis/tick props so every chart stays on the brand token palette. */
const AXIS_TICK = { fill: 'var(--muted-foreground)', fontSize: 11 } as const
const GRID_STROKE = 'var(--border)'

export function OverviewView() {
  const { data, status, error, refetch } = useQuery<AdminOverview>({
    queryKey: ['admin-overview'],
    queryFn: () => api<AdminOverview>('/api/admin/overview'),
  })

  // payments ledger feeds the "Needs your attention" queue (PENDING intents)
  const payments = useQuery<AdminPaymentRow[]>({
    queryKey: ['admin-payments'],
    queryFn: () => api<AdminPaymentRow[]>('/api/admin/payments'),
  })

  return (
    <div className="space-y-6">
      <ViewHeading
        title="Overview"
        description="Registrar's snapshot of enrolment, applications and finances across all campuses."
      />

      {/* Needs-your-attention queue — pending payments + applications */}
      <NeedsAttentionSection
        applicationsPending={data?.applicationsPending ?? null}
        payments={payments}
      />

      <QueryBoundary
        status={status}
        error={error}
        onRetry={() => void refetch()}
        skeleton={<KpiGridSkeleton count={4} />}
      >
        {data && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon={Users}
              label="Active students"
              value={data.studentsActive}
              className="rule-top-gold"
            />
            <button
              type="button"
              onClick={() => navigate('/admin/applications')}
              aria-label="Pending applications — open applications"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-xl"
            >
              <KpiCard
                icon={Inbox}
                label="Pending applications"
                value={data.applicationsPending}
                delta={{ text: 'Review now →', positive: data.applicationsPending > 0 }}
                className="h-full w-full text-left transition-colors hover:border-gold-400/60 hover:bg-gold-400/5"
              />
            </button>
            <KpiCard
              icon={Wallet}
              label="Collected this term"
              value={fmtKES(data.collectionsThisTerm)}
            />
            <KpiCard
              icon={Landmark}
              label="Outstanding balances"
              value={fmtKES(data.outstandingBalance)}
              delta={{ text: `All-time collected ${fmtKES(data.collectionsTotal)}`, positive: true }}
            />
          </div>
        )}
      </QueryBoundary>

      {/* Quick actions — registrar shortcuts */}
      <Card className="kip-dots border-brand-100 dark:border-white/10">
        <CardContent className="flex flex-wrap items-center gap-2 p-4">
          <p className="mr-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Quick actions
          </p>
          <Button
            variant="outline"
            size="sm"
            className="min-h-11"
            onClick={() => navigate('/admin/students')}
          >
            <Users className="mr-2 h-4 w-4 text-primary" aria-hidden="true" />
            Enrol student
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="min-h-11"
            onClick={() => navigate('/admin/applications')}
          >
            <Inbox className="mr-2 h-4 w-4 text-primary" aria-hidden="true" />
            Review applications
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="min-h-11"
            onClick={() => navigate('/admin/fees')}
          >
            <Wallet className="mr-2 h-4 w-4 text-primary" aria-hidden="true" />
            Post fees
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="min-h-11"
            onClick={() => navigate('/admin/results')}
          >
            <Award className="mr-2 h-4 w-4 text-primary" aria-hidden="true" />
            Enter results
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="min-h-11"
            onClick={() => navigate('/admin/timetable')}
          >
            <CalendarDays className="mr-2 h-4 w-4 text-primary" aria-hidden="true" />
            Build timetable
          </Button>
        </CardContent>
      </Card>

      {/* Task 8-c: collections comparison + applications funnel */}
      <QueryBoundary
        status={status}
        error={error}
        onRetry={() => void refetch()}
        skeleton={<KpiGridSkeleton count={2} />}
      >
        {data && <CollectionsAndFunnelSection data={data} />}
      </QueryBoundary>

      <QueryBoundary
        status={status}
        error={error}
        onRetry={() => void refetch()}
        skeleton={<TableSkeleton rows={4} />}
      >
        {data && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Revenue trend */}
            <Card className="xl:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 font-display text-base">
                  <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
                  Revenue — last 8 months
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Confirmed payments per month (KES)
                </p>
              </CardHeader>
              <CardContent>
                <div aria-label="Revenue by month chart" role="img">
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart
                      data={data.revenueByMonth}
                      margin={{ top: 8, right: 12, left: 4, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={EMERALD} stopOpacity={0.32} />
                          <stop offset="100%" stopColor={EMERALD} stopOpacity={0.03} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickFormatter={monthLabel}
                        tick={AXIS_TICK}
                        stroke="var(--muted-foreground)"
                      />
                      <YAxis
                        tick={AXIS_TICK}
                        stroke="var(--muted-foreground)"
                        tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
                      />
                      <Tooltip
                        contentStyle={ChartTooltipStyle()}
                        formatter={(value: number | string) => [
                          fmtKES(Number(value)),
                          'Collected',
                        ]}
                        labelFormatter={(label: string) => monthLabel(label)}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke={EMERALD}
                        strokeWidth={2.5}
                        fill="url(#revenueFill)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Students by category donut */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-base">Students by category</CardTitle>
                <p className="text-xs text-muted-foreground">Active enrolments</p>
              </CardHeader>
              <CardContent>
                <div aria-label="Students by category chart" role="img">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={data.studentsByCategory}
                        dataKey="count"
                        nameKey="category"
                        innerRadius="55%"
                        outerRadius="80%"
                        paddingAngle={3}
                        strokeWidth={2}
                      >
                        {data.studentsByCategory.map((entry) => (
                          <Cell
                            key={entry.category}
                            fill={CATEGORY_COLORS[entry.category] ?? SAGE}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={ChartTooltipStyle()}
                        formatter={(value: number | string, name: string) => [
                          `${value} student${Number(value) === 1 ? '' : 's'}`,
                          name,
                        ]}
                      />
                      <Legend
                        iconType="circle"
                        formatter={(value: string) => (
                          <span style={{ fontSize: 12 }}>{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </QueryBoundary>

      <QueryBoundary
        status={status}
        error={error}
        onRetry={() => void refetch()}
        skeleton={<TableSkeleton rows={5} />}
      >
        {data && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Top courses bar */}
            <Card className="xl:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-base">Top courses by enrollment</CardTitle>
                <p className="text-xs text-muted-foreground">Active students per course (top 8)</p>
              </CardHeader>
              <CardContent>
                <div aria-label="Top courses by enrollment chart" role="img">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={data.enrollmentsByCourse}
                      layout="vertical"
                      margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} stroke="var(--muted-foreground)" />
                      <YAxis
                        type="category"
                        dataKey="course"
                        width={190}
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 10.5 }}
                        stroke="var(--muted-foreground)"
                        tickFormatter={(v: string) =>
                          v.length > 30 ? `${v.slice(0, 29)}…` : v
                        }
                      />
                      <Tooltip
                        contentStyle={ChartTooltipStyle()}
                        cursor={{ fill: 'rgba(38, 122, 72, 0.08)' }}
                        formatter={(value: number | string) => [
                          `${value} student${Number(value) === 1 ? '' : 's'}`,
                          'Enrolled',
                        ]}
                      />
                      <Bar dataKey="count" fill={EMERALD} radius={[0, 6, 6, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Students by campus */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 font-display text-base">
                  <Building2 className="h-4 w-4 text-primary" aria-hidden="true" />
                  Students by campus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.studentsByCampus.map((c) => {
                  const pct =
                    data.studentsActive > 0
                      ? Math.round((c.count / data.studentsActive) * 100)
                      : 0
                  return (
                    <div key={c.campusId} className="rounded-xl border p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{c.campus}</p>
                        <Badge variant="secondary" className="shrink-0">
                          {c.count}
                        </Badge>
                      </div>
                      <div
                        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted"
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${c.campus} share of active students`}
                      >
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-700 to-brand-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-[11px] text-muted-foreground">{pct}% of active students</p>
                    </div>
                  )
                })}
                <Button
                  variant="outline"
                  className="min-h-11 w-full"
                  onClick={() => navigate('/admin/students')}
                >
                  Manage students
                  <ArrowUpRight className="ml-2 h-4 w-4 text-gold-600 dark:text-gold-400" aria-hidden="true" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </QueryBoundary>

      {/* Recent payments */}
      <QueryBoundary
        status={status}
        error={error}
        onRetry={() => void refetch()}
        skeleton={<TableSkeleton rows={5} />}
      >
        {data && (
          <Card>
            <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="font-display text-base">Recent activity — payments</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="min-h-11"
                onClick={() => navigate('/admin/fees')}
              >
                Fees &amp; payments
                <ArrowUpRight className="ml-2 h-4 w-4 text-gold-600 dark:text-gold-400" aria-hidden="true" />
              </Button>
            </CardHeader>
            <CardContent>
              {data.recentPayments.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No payments recorded yet.
                </p>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden overflow-x-auto md:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-brand-200/70 bg-brand-50/70 hover:bg-brand-50/70 dark:border-white/10 dark:bg-brand-100 dark:hover:bg-brand-100">
                          <TableHead className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-500">Student</TableHead>
                          <TableHead className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-500">Course</TableHead>
                          <TableHead className="text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-500">Amount</TableHead>
                          <TableHead className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-500">Method</TableHead>
                          <TableHead className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-500">Reference</TableHead>
                          <TableHead className="text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-500">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.recentPayments.map((p) => (
                          <TableRow key={p.id} className="odd:bg-muted/40 hover:bg-brand-50/60 dark:hover:bg-brand-100/30">
                            <TableCell>
                              <p className="text-sm font-semibold">{p.studentName}</p>
                              <p className="font-mono text-[11px] text-muted-foreground">
                                {p.admissionNo}
                              </p>
                            </TableCell>
                            <TableCell className="max-w-56 truncate text-sm text-muted-foreground">
                              {p.course}
                            </TableCell>
                            <TableCell className="text-right text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                              {fmtKES(p.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-[10px] ${methodBadgeVariant(p.method)}`}>
                                {p.method}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-[11px] text-muted-foreground">
                              {p.reference}
                            </TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground">
                              {fmtDate(p.paidAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {/* Mobile stacked cards — gold-dot activity timeline */}
                  <ul className="space-y-3 md:hidden">
                    {data.recentPayments.map((p) => (
                      <li key={p.id} className="relative rounded-xl border border-l-2 border-l-gold-400/70 bg-card p-4 pl-5">
                        <span
                          aria-hidden="true"
                          className="absolute -left-[5px] top-6 h-2.5 w-2.5 rounded-full bg-gold-400 ring-4 ring-gold-400/20"
                        />
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{p.studentName}</p>
                            <p className="font-mono text-[11px] text-muted-foreground">
                              {p.admissionNo}
                            </p>
                          </div>
                          <p className="shrink-0 text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                            {fmtKES(p.amount)}
                          </p>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Badge className={`text-[10px] ${methodBadgeVariant(p.method)}`}>
                            {p.method}
                          </Badge>
                          <span className="font-mono text-[11px]">{p.reference}</span>
                          <span>· {fmtDate(p.paidAt)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </QueryBoundary>
    </div>
  )
}
