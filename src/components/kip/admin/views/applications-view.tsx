'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  GraduationCap,
  Inbox,
  Mail,
  MapPin,
  Phone,
  ScrollText,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/kip/components/empty-state'
import { QueryBoundary } from '@/components/kip/components/loading'
import { api, patch } from '@/components/kip/lib/api'
import { fmtDate } from '@/components/kip/lib/format'
import { RowsSkeleton, ViewHeading } from '@/components/kip/portal/shared'
import { DialogBody, Field, SubmitButton } from '@/components/kip/admin/form-bits'
import type {
  AcceptApplicationResult,
  AdminApplication,
} from '@/components/kip/admin/types'
import { cn } from '@/lib/utils'

const STATUS_TABS = ['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'] as const

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'PENDING') return 'outline'
  if (status === 'ACCEPTED') return 'default'
  if (status === 'REJECTED') return 'destructive'
  return 'secondary'
}

function statusToneBadge(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'border-gold-400/50 bg-gold-400/15 text-gold-700 dark:text-gold-300'
    case 'ACCEPTED':
      return 'border-transparent bg-emerald-600/15 text-emerald-700 dark:text-emerald-400'
    case 'REJECTED':
      return 'border-transparent bg-red-600/15 text-red-700 dark:text-red-400'
    default:
      return 'border-transparent bg-muted text-muted-foreground'
  }
}

export function ApplicationsView() {
  const [filter, setFilter] = useState<string>('ALL')
  const [reviewId, setReviewId] = useState<string | null>(null)

  const { data, status, error, refetch } = useQuery<AdminApplication[]>({
    queryKey: ['admin-applications'],
    queryFn: () => api<AdminApplication[]>('/api/admin/applications'),
  })

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: data?.length ?? 0, PENDING: 0, ACCEPTED: 0, REJECTED: 0 }
    for (const a of data ?? []) {
      if (a.status in c) c[a.status] = (c[a.status] ?? 0) + 1
    }
    return c
  }, [data])

  const filtered = useMemo(() => {
    const rows = data ?? []
    return filter === 'ALL' ? rows : rows.filter((a) => a.status === filter)
  }, [data, filter])

  const reviewApp = (data ?? []).find((a) => a.id === reviewId) ?? null

  return (
    <div className="space-y-6">
      <ViewHeading
        title="Applications"
        description="Review online applications — accepting enrols the student and posts their first-term fees."
      />

      <QueryBoundary
        status={status}
        error={error}
        onRetry={() => void refetch()}
        skeleton={<RowsSkeleton rows={4} />}
      >
        {data && (
          <>
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList className="w-full overflow-x-auto custom-scrollbar sm:w-auto">
                {STATUS_TABS.map((t) => (
                  <TabsTrigger
                    key={t}
                    value={t}
                    className="min-h-9 flex-1 gap-1.5 data-[state=active]:bg-brand-700 dark:data-[state=active]:bg-brand-700 data-[state=active]:text-[#f2efe6] data-[state=active]:shadow-none sm:flex-none"
                  >
                    {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
                    <Badge variant="secondary" className="text-[10px]">
                      {counts[t] ?? 0}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {filtered.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title={`No ${filter === 'ALL' ? '' : filter.toLowerCase()} applications`}
                hint="New applications submitted from the website will appear here for review."
                className="py-16"
              />
            ) : (
              <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {filtered.map((a, i) => (
                  <li key={a.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                    >
                      <ApplicationCard app={a} onReview={() => setReviewId(a.id)} />
                    </motion.div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </QueryBoundary>

      {reviewApp && (
        <ReviewDialog
          key={`review-${reviewApp.id}`}
          app={reviewApp}
          onOpenChange={(open) => {
            if (!open) setReviewId(null)
          }}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Application card
// ---------------------------------------------------------------------------

function ApplicationCard({ app, onReview }: { app: AdminApplication; onReview: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const message = app.message ?? ''
  const isLong = message.length > 140

  return (
    <Card className={cn('h-full', app.status === 'PENDING' && 'border-l-2 border-l-gold-400/80')}>
      <CardContent className="flex h-full flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold">{app.applicantName}</p>
              <Badge className={`text-[10px] font-semibold ${statusToneBadge(app.status)}`}>
                {app.status}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Applied {fmtDate(app.createdAt)}
              {app.reviewedAt ? ` · reviewed ${fmtDate(app.reviewedAt)}` : ''}
            </p>
          </div>
          <Button variant="outline" size="sm" className="min-h-11 shrink-0" onClick={onReview}>
            {app.status === 'PENDING' ? 'Review' : 'View'}
          </Button>
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          <p className="flex items-center gap-2">
            <GraduationCap className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate font-medium text-foreground">
              {app.course?.title ?? 'Course'}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            {app.campus?.name ?? 'Campus'} · KCSE {app.kcseGrade} ({app.kcseYear})
          </p>
          <p className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate">{app.email}</span>
          </p>
          <p className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            {app.phone}
          </p>
        </div>

        {message && (
          <div className="rounded-lg bg-muted/40 p-3">
            <p className={cn('text-xs leading-relaxed', !expanded && 'line-clamp-2')}>{message}</p>
            {isLong && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-primary"
              >
                {expanded ? (
                  <>
                    Show less <ChevronUp className="h-3 w-3" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    Read more <ChevronDown className="h-3 w-3" aria-hidden="true" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Review dialog + credentials success state
// ---------------------------------------------------------------------------

function ReviewDialog({
  app,
  onOpenChange,
}: {
  app: AdminApplication
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [adminNote, setAdminNote] = useState(app.adminNote ?? '')
  const [result, setResult] = useState<AcceptApplicationResult | null>(null)
  const [confirmReject, setConfirmReject] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin-applications'] })
    void queryClient.invalidateQueries({ queryKey: ['admin-students'] })
    void queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
    void queryClient.invalidateQueries({ queryKey: ['admin-messages'] })
  }

  const review = useMutation({
    mutationFn: (action: 'accept' | 'reject') =>
      patch<AcceptApplicationResult | AdminApplication>(`/api/admin/applications/${app.id}`, {
        action,
        adminNote: adminNote.trim() || undefined,
      }),
    onSuccess: (res, action) => {
      if (action === 'accept' && 'student' in res) {
        setResult(res)
        toast.success('Application accepted', {
          description: `${res.student.name} enrolled as ${res.student.admissionNo}. ${res.feeItemsPosted} fee items posted.`,
        })
        invalidate()
      } else {
        toast.success('Application rejected', {
          description: `${app.applicantName} was notified with your note.`,
        })
        invalidate()
        onOpenChange(false)
      }
    },
    onError: (err) => {
      setFormError(err instanceof Error ? err.message : 'Could not review the application.')
    },
  })

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied`, { description: text })
    } catch {
      toast.error('Copy failed', { description: 'Select the text and copy manually.' })
    }
  }

  // ---- accepted credentials state (the wow moment) ----
  if (result) {
    const s = result.student
    return (
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="gold-rule mb-2 w-8" aria-hidden="true" />
            <DialogTitle className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              Student enrolled
            </DialogTitle>
            <DialogDescription>
              Share these credentials with {s.name} — they can sign in immediately and change the
              password from their portal.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
              aria-live="polite"
            >
              <div className="rounded-xl border border-emerald-600/30 bg-emerald-500/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                  Temporary credentials
                </p>
                <dl className="mt-3 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Student</dt>
                    <dd className="font-semibold">{s.name}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="truncate font-medium">{s.email}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Admission No</dt>
                    <dd className="font-mono font-bold text-primary">{s.admissionNo}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Course</dt>
                    <dd className="max-w-52 truncate text-right font-medium">{s.course}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Campus</dt>
                    <dd className="font-medium">{s.campus}</dd>
                  </div>
                </dl>
                <div className="mt-4 rounded-lg bg-brand-950 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gold-400">
                        Temp password
                      </p>
                      <p className="mt-0.5 break-all font-mono text-lg font-bold text-[#f2efe6]">
                        {s.tempPassword}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="btn-gold h-11 shrink-0"
                      onClick={() => void handleCopy(s.tempPassword, 'Password')}
                    >
                      <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-primary dark:bg-brand-100">
                  <ScrollText className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="text-sm">
                  <span className="font-semibold">{result.feeItemsPosted} fee items posted</span>{' '}
                  <span className="text-muted-foreground">
                    — registration, first-term tuition and exam fees for {s.course}.
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-dashed p-3 text-xs text-muted-foreground">
                <CalendarDays className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                Year 1 · Term 1 — results and timetable activate automatically.
              </div>
            </motion.div>
          </DialogBody>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              className="min-h-11"
              onClick={() => {
                void handleCopy(
                  `KIP College portal login — ${s.email} / ${s.tempPassword} (admission ${s.admissionNo})`,
                  'Login details',
                )
              }}
            >
              <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
              Copy all details
            </Button>
            <Button className="min-h-11" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // ---- review form ----
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="gold-rule mb-2 w-8" aria-hidden="true" />
          <DialogTitle>Review application</DialogTitle>
          <DialogDescription>
            {app.applicantName} · applied {fmtDate(app.createdAt)}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <dl className="grid grid-cols-1 gap-3 rounded-xl border p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Course</dt>
                <dd className="mt-0.5 font-medium">{app.course?.title}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Campus</dt>
                <dd className="mt-0.5 font-medium">{app.campus?.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">KCSE</dt>
                <dd className="mt-0.5 font-medium">
                  {app.kcseGrade} · {app.kcseYear}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Phone</dt>
                <dd className="mt-0.5 font-medium">{app.phone}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd className="mt-0.5 break-all font-medium">{app.email}</dd>
              </div>
              {app.guardianName && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">Guardian</dt>
                  <dd className="mt-0.5 font-medium">
                    {app.guardianName}
                    {app.guardianPhone ? ` · ${app.guardianPhone}` : ''}
                  </dd>
                </div>
              )}
              {app.message && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">Message</dt>
                  <dd className="mt-1 rounded-lg bg-muted/40 p-3 text-xs leading-relaxed">
                    {app.message}
                  </dd>
                </div>
              )}
              {app.adminNote && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">Previous note</dt>
                  <dd className="mt-0.5 text-xs italic text-muted-foreground">{app.adminNote}</dd>
                </div>
              )}
            </dl>

            <Field
              id="app-note"
              label="Admin note (optional)"
              hint="Stored with the application — e.g. intake advice or rejection reason."
            >
              <Textarea
                id="app-note"
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="e.g. Admitted to January 2027 intake…"
                disabled={app.status !== 'PENDING'}
              />
            </Field>

            {formError && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {formError}
              </p>
            )}

            {app.status === 'PENDING' ? (
              confirmReject ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                  <p className="text-sm font-semibold">Reject this application?</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {app.applicantName} will be marked as rejected
                    {adminNote.trim() ? ' with your note' : ''}. This cannot be undone.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="destructive"
                      className="min-h-11"
                      disabled={review.isPending}
                      onClick={() => review.mutate('reject')}
                    >
                      <XCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                      Yes, reject
                    </Button>
                    <Button
                      variant="outline"
                      className="min-h-11"
                      onClick={() => setConfirmReject(false)}
                      disabled={review.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <SubmitButton
                    pending={review.isPending && review.variables === 'accept'}
                    pendingLabel="Enrolling…"
                    className="flex-1"
                    onClick={() => review.mutate('accept')}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />
                    Accept &amp; enrol
                  </SubmitButton>
                  <Button
                    variant="outline"
                    className="min-h-11 flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={review.isPending}
                    onClick={() => setConfirmReject(true)}
                  >
                    <XCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                    Reject
                  </Button>
                </div>
              )
            ) : (
              <div className="rounded-xl border p-4 text-sm text-muted-foreground">
                This application was already reviewed
                {app.reviewedAt ? ` on ${fmtDate(app.reviewedAt)}` : ''}.
              </div>
            )}
          </div>
        </DialogBody>
        <DialogFooter className="mt-4">
          <Button variant="outline" className="min-h-11 w-full" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
