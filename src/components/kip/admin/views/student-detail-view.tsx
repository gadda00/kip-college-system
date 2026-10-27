'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  CalendarDays,
  IdCard,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Receipt,
  ShieldAlert,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/kip/components/empty-state'
import { QueryBoundary, DetailSkeleton } from '@/components/kip/components/loading'
import { api, patch, post } from '@/components/kip/lib/api'
import { navigate } from '@/components/kip/lib/router'
import { fmtDate, fmtKES } from '@/components/kip/lib/format'
import { GradeBadge, ViewHeading } from '@/components/kip/portal/shared'
import { DialogBody, Field, FieldGrid, SubmitButton } from '@/components/kip/admin/form-bits'
import { StudentIdCardDialog } from '@/components/kip/admin/views/id-card-dialog'
import type {
  AdminStudentDetail,
  PostFeeResult,
  RecordPaymentResult,
} from '@/components/kip/admin/types'

const TERM_SUGGESTIONS = ['2026/2027 T1', '2026/2027 T2', '2025/2026 T3']
const FEE_TYPES = ['TUITION', 'REGISTRATION', 'EXAM', 'OTHER'] as const
const PAY_METHODS = ['MPESA', 'BANK', 'CASH'] as const

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' {
  if (status === 'ACTIVE') return 'default'
  if (status === 'GRADUATED') return 'secondary'
  return 'destructive'
}

function feeTypeTone(type: string): string {
  switch (type) {
    case 'TUITION':
      return 'border-transparent bg-primary/10 text-primary'
    case 'REGISTRATION':
      return 'border-transparent bg-amber-400/15 text-amber-700 dark:text-amber-400'
    case 'EXAM':
      return 'border-transparent bg-orange-500/15 text-orange-700 dark:text-orange-400'
    default:
      return 'border-transparent bg-muted text-muted-foreground'
  }
}

function methodTone(method: string): string {
  switch (method) {
    case 'MPESA':
      return 'border-transparent bg-green-600/15 text-green-700 dark:text-green-400'
    case 'BANK':
      return 'border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400'
    default:
      return 'border-transparent bg-muted text-muted-foreground'
  }
}

export function StudentDetailView({ studentId }: { studentId: string }) {
  const { data, status, error, refetch } = useQuery<AdminStudentDetail>({
    queryKey: ['admin-student', studentId],
    queryFn: () => api<AdminStudentDetail>(`/api/admin/students/${studentId}`),
    retry: false,
  })

  const [postFeeOpen, setPostFeeOpen] = useState(false)
  const [recordPayOpen, setRecordPayOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [idCardOpen, setIdCardOpen] = useState(false)

  return (
    <div className="space-y-6">
      <ViewHeading
        title="Student profile"
        description="Full record — fees, payments, results and enrolment."
        actions={
          <Button variant="outline" className="min-h-11" onClick={() => navigate('/admin/students')}>
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            All students
          </Button>
        }
      />

      <QueryBoundary
        status={status}
        error={error}
        onRetry={() => void refetch()}
        skeleton={<DetailSkeleton />}
      >
        {data && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <ProfileHeader
              student={data}
              onEdit={() => setEditOpen(true)}
              onIdCard={() => setIdCardOpen(true)}
            />
            <FeesSection
              student={data}
              onPostFee={() => setPostFeeOpen(true)}
              onRecordPayment={() => setRecordPayOpen(true)}
            />
            <ResultsSection student={data} />
            <TimetableSummary student={data} />

            <PostFeeDialog
              key={`post-fee-${postFeeOpen}`}
              open={postFeeOpen}
              onOpenChange={setPostFeeOpen}
              student={data}
            />
            <RecordPaymentDialog
              key={`record-pay-${recordPayOpen}`}
              open={recordPayOpen}
              onOpenChange={setRecordPayOpen}
              student={data}
            />
            <EditStudentDialog
              key={`edit-student-${editOpen}`}
              open={editOpen}
              onOpenChange={setEditOpen}
              student={data}
            />
            <StudentIdCardDialog
              open={idCardOpen}
              onOpenChange={setIdCardOpen}
              studentId={studentId}
            />
          </motion.div>
        )}
      </QueryBoundary>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Profile header + status control
// ---------------------------------------------------------------------------

function ProfileHeader({
  student,
  onEdit,
  onIdCard,
}: {
  student: AdminStudentDetail
  onEdit: () => void
  onIdCard: () => void
}) {
  const queryClient = useQueryClient()

  const changeStatus = useMutation({
    mutationFn: (status: string) =>
      patch<AdminStudentDetail>(`/api/admin/students/${student.id}`, { status }),
    onSuccess: (updated) => {
      toast.success('Status updated', {
        description: `${updated.user.name} is now ${updated.status}.`,
      })
      void queryClient.invalidateQueries({ queryKey: ['admin-student', student.id] })
      void queryClient.invalidateQueries({ queryKey: ['admin-students'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
    },
    onError: (err) => {
      toast.error('Could not update status', {
        description: err instanceof Error ? err.message : undefined,
      })
    },
  })

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground"
            >
              {student.user.name
                .split(' ')
                .map((p) => p[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </span>
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">{student.user.name}</h2>
                <Badge variant={statusVariant(student.status)} className="text-[10px]">
                  {student.status}
                </Badge>
              </div>
              <p className="font-mono text-sm text-primary">{student.admissionNo}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  {student.user.email}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                  {student.user.phone ?? '—'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {student.campus.name}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Badge variant="outline" className="text-[10px]">
                  {student.course.code}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {student.course.level}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  Year {student.yearOfStudy} · Term {student.currentTerm}
                </Badge>
                {student.kcseGrade && (
                  <Badge variant="outline" className="text-[10px]">
                    KCSE {student.kcseGrade}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="status-select" className="whitespace-nowrap text-sm">
                Status
              </Label>
              <Select
                value={student.status}
                onValueChange={(v) => changeStatus.mutate(v)}
                disabled={changeStatus.isPending}
              >
                <SelectTrigger id="status-select" className="h-11 w-40" aria-label="Change student status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
                  <SelectItem value="GRADUATED">GRADUATED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="min-h-11" onClick={onIdCard}>
              <IdCard className="mr-2 h-4 w-4" aria-hidden="true" />
              ID Card
            </Button>
            <Button variant="outline" className="min-h-11" onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
              Edit profile
            </Button>
          </div>
        </div>

        {(student.guardianName || student.guardianPhone || student.address) && (
          <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl bg-muted/40 p-4 text-xs text-muted-foreground sm:grid-cols-3">
            <p>
              <span className="font-semibold text-foreground">Guardian:</span>{' '}
              {student.guardianName ?? '—'}
            </p>
            <p>
              <span className="font-semibold text-foreground">Guardian phone:</span>{' '}
              {student.guardianPhone ?? '—'}
            </p>
            <p className="truncate">
              <span className="font-semibold text-foreground">Address:</span>{' '}
              {student.address ?? '—'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Fees tab (statement + post fee + record payment)
// ---------------------------------------------------------------------------

function FeesSection({
  student,
  onPostFee,
  onRecordPayment,
}: {
  student: AdminStudentDetail
  onPostFee: () => void
  onRecordPayment: () => void
}) {
  const paidPct =
    student.totalCharged > 0
      ? Math.min(100, Math.round((student.totalPaid / student.totalCharged) * 100))
      : 0

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Receipt className="h-4 w-4 text-primary" aria-hidden="true" />
          Fees &amp; payments
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="min-h-11" onClick={onPostFee}>
            Post fee item
          </Button>
          <Button size="sm" variant="outline" className="min-h-11" onClick={onRecordPayment}>
            <Wallet className="mr-2 h-4 w-4" aria-hidden="true" />
            Record payment
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Total charged</p>
            <p className="mt-1 text-lg font-bold">{fmtKES(student.totalCharged)}</p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Total paid</p>
            <p className="mt-1 text-lg font-bold text-green-600 dark:text-green-400">
              {fmtKES(student.totalPaid)}
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Balance</p>
            <p
              className={`mt-1 text-lg font-bold ${
                student.balance > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-green-600 dark:text-green-400'
              }`}
            >
              {student.balance > 0 ? fmtKES(student.balance) : 'Clear'}
            </p>
          </div>
        </div>
        <div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={paidPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Fee payment progress"
          >
            <div className="h-full rounded-full bg-primary" style={{ width: `${paidPct}%` }} />
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {paidPct}% of charged fees collected
          </p>
        </div>

        <Tabs defaultValue="charges">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="charges" className="min-h-9 flex-1 sm:flex-none">
              Fee items ({student.feeItems.length})
            </TabsTrigger>
            <TabsTrigger value="payments" className="min-h-9 flex-1 sm:flex-none">
              Payments ({student.payments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="charges" className="mt-4">
            {student.feeItems.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No fee items yet"
                hint="Post tuition, registration or exam fees to this student."
                className="py-10"
              />
            ) : (
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Term</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Due</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.feeItems.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="whitespace-nowrap text-xs font-medium">
                          {f.term}
                        </TableCell>
                        <TableCell className="max-w-56 truncate text-sm">{f.description}</TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] ${feeTypeTone(f.type)}`}>{f.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold">
                          {fmtKES(f.amount)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {fmtDate(f.dueDate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="payments" className="mt-4">
            {student.payments.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="No payments yet"
                hint="Record M-Pesa, bank or cash payments against this student."
                className="py-10"
              />
            ) : (
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paid on</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {fmtDate(p.paidAt)}
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold text-green-600 dark:text-green-400">
                          {fmtKES(p.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] ${methodTone(p.method)}`}>{p.method}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-[11px]">{p.reference}</TableCell>
                        <TableCell className="max-w-44 truncate text-xs text-muted-foreground">
                          {p.note ?? '—'}
                          {p.recordedBy ? ` · by ${p.recordedBy}` : ''}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Results + timetable summary
// ---------------------------------------------------------------------------

function ResultsSection({ student }: { student: AdminStudentDetail }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="h-4 w-4 text-primary" aria-hidden="true" />
          Results ({student.results.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {student.results.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No results recorded"
            hint="Use the Results manager to enter and publish marks for this student's units."
            className="py-10"
          />
        ) : (
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead className="text-center">Marks</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                  <TableHead>Remark</TableHead>
                  <TableHead className="text-center">Published</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.results.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <p className="text-sm font-medium">{r.unitName}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {r.unitCode} · {r.stageLabel}
                      </p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {r.term}
                    </TableCell>
                    <TableCell className="text-center text-sm font-semibold">
                      {r.marks.toFixed(0)}
                    </TableCell>
                    <TableCell className="text-center">
                      <GradeBadge grade={r.grade} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.remark ?? '—'}</TableCell>
                    <TableCell className="text-center">
                      {r.published ? (
                        <BadgeCheck className="mx-auto h-4 w-4 text-primary" aria-label="Published" />
                      ) : (
                        <ShieldAlert className="mx-auto h-4 w-4 text-amber-500" aria-label="Unpublished" />
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
  )
}

function TimetableSummary({ student }: { student: AdminStudentDetail }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold">
              {student.timetableCount} weekly class{student.timetableCount === 1 ? '' : 'es'}{' '}
              scheduled
            </p>
            <p className="text-xs text-muted-foreground">
              {student.course.title} · {student.campus.name}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="min-h-11"
          onClick={() => navigate(`/admin/timetable`)}
        >
          Open timetable builder
        </Button>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Dialogs
// ---------------------------------------------------------------------------

function PostFeeDialog({
  open,
  onOpenChange,
  student,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: AdminStudentDetail
}) {
  const queryClient = useQueryClient()
  const [term, setTerm] = useState(TERM_SUGGESTIONS[0]!)
  const [type, setType] = useState<string>('TUITION')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: () =>
      post<PostFeeResult>('/api/admin/fees', {
        studentId: student.id,
        term: term.trim(),
        type,
        description: description.trim(),
        amount: Number(amount),
        ...(dueDate ? { dueDate } : {}),
      }),
    onSuccess: (res) => {
      toast.success('Fee item posted', {
        description: `${fmtKES(Number(amount))} — ${description.trim()} (${term}). New balance ${fmtKES(res.balance ?? 0)}.`,
      })
      onOpenChange(false)
      void queryClient.invalidateQueries({ queryKey: ['admin-student', student.id] })
      void queryClient.invalidateQueries({ queryKey: ['admin-students'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
    },
    onError: (err) => {
      setFormError(err instanceof Error ? err.message : 'Could not post the fee item.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!term.trim() || !description.trim() || !amount || Number(amount) <= 0) {
      setFormError('Term, description and a positive amount are required.')
      return
    }
    setFormError(null)
    create.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Post fee item</DialogTitle>
          <DialogDescription>
            Charge {student.user.name} ({student.admissionNo}).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <div className="space-y-4">
              <FieldGrid>
                <Field id="pf-term" label="Term" required>
                  <Input
                    id="pf-term"
                    className="h-11"
                    list="term-suggestions"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    required
                  />
                  <datalist id="term-suggestions">
                    {TERM_SUGGESTIONS.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </Field>
                <Field id="pf-type" label="Type" required>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="pf-type" className="h-11 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FEE_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGrid>
              <Field id="pf-desc" label="Description" required>
                <Input
                  id="pf-desc"
                  className="h-11"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Tuition Fee — 2026/2027 T1"
                  required
                />
              </Field>
              <FieldGrid>
                <Field id="pf-amount" label="Amount (KES)" required>
                  <Input
                    id="pf-amount"
                    type="number"
                    min={1}
                    className="h-11"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </Field>
                <Field id="pf-due" label="Due date">
                  <Input
                    id="pf-due"
                    type="date"
                    className="h-11"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </Field>
              </FieldGrid>
              {formError && (
                <p role="alert" className="text-sm font-medium text-destructive">
                  {formError}
                </p>
              )}
            </div>
          </DialogBody>
          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => onOpenChange(false)}
              disabled={create.isPending}
            >
              Cancel
            </Button>
            <SubmitButton pending={create.isPending} pendingLabel="Posting…">
              Post fee
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function RecordPaymentDialog({
  open,
  onOpenChange,
  student,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: AdminStudentDetail
}) {
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<string>('MPESA')
  const [reference, setReference] = useState('')
  const [note, setNote] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: () =>
      post<RecordPaymentResult>('/api/admin/payments', {
        studentId: student.id,
        amount: Number(amount),
        method,
        reference: reference.trim() || undefined,
        note: note.trim() || undefined,
      }),
    onSuccess: (res) => {
      toast.success('Payment recorded', {
        description: `${fmtKES(res.amount)} via ${res.method} — ref ${res.reference}. New balance ${fmtKES(res.balance)}.`,
      })
      onOpenChange(false)
      void queryClient.invalidateQueries({ queryKey: ['admin-student', student.id] })
      void queryClient.invalidateQueries({ queryKey: ['admin-students'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-payments'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
    },
    onError: (err) => {
      setFormError(err instanceof Error ? err.message : 'Could not record the payment.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) {
      setFormError('Enter a positive amount.')
      return
    }
    setFormError(null)
    create.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            Confirm a payment for {student.user.name} ({student.admissionNo}). Current balance{' '}
            {fmtKES(student.balance)}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <div className="space-y-4">
              <FieldGrid>
                <Field id="rp-amount" label="Amount (KES)" required>
                  <Input
                    id="rp-amount"
                    type="number"
                    min={1}
                    className="h-11"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </Field>
                <Field id="rp-method" label="Method" required>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger id="rp-method" className="h-11 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAY_METHODS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGrid>
              <Field
                id="rp-ref"
                label="Reference"
                hint="Leave blank to auto-generate (e.g. MPESA…)"
              >
                <Input
                  id="rp-ref"
                  className="h-11 font-mono"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. QGH7X2LM90"
                />
              </Field>
              <Field id="rp-note" label="Note">
                <Textarea
                  id="rp-note"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Part payment — tuition"
                />
              </Field>
              {formError && (
                <p role="alert" className="text-sm font-medium text-destructive">
                  {formError}
                </p>
              )}
            </div>
          </DialogBody>
          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => onOpenChange(false)}
              disabled={create.isPending}
            >
              Cancel
            </Button>
            <SubmitButton pending={create.isPending} pendingLabel="Recording…">
              Record payment
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditStudentDialog({
  open,
  onOpenChange,
  student,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: AdminStudentDetail
}) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(student.user.name)
  const [phone, setPhone] = useState(student.user.phone ?? '')
  const [year, setYear] = useState(String(student.yearOfStudy))
  const [term, setTerm] = useState(String(student.currentTerm))
  const [formError, setFormError] = useState<string | null>(null)

  const update = useMutation({
    mutationFn: () =>
      patch<AdminStudentDetail>(`/api/admin/students/${student.id}`, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        yearOfStudy: Number(year) || student.yearOfStudy,
        currentTerm: Number(term) || student.currentTerm,
      }),
    onSuccess: (updated) => {
      toast.success('Profile updated', {
        description: `${updated.user.name} — Year ${updated.yearOfStudy} Term ${updated.currentTerm}.`,
      })
      onOpenChange(false)
      void queryClient.invalidateQueries({ queryKey: ['admin-student', student.id] })
      void queryClient.invalidateQueries({ queryKey: ['admin-students'] })
    },
    onError: (err) => {
      setFormError(err instanceof Error ? err.message : 'Could not update the profile.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setFormError('Name is required.')
      return
    }
    setFormError(null)
    update.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update {student.admissionNo}'s contact details and stage.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <div className="space-y-4">
              <Field id="es-name" label="Full name" required>
                <Input
                  id="es-name"
                  className="h-11"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Field>
              <Field id="es-phone" label="Phone">
                <Input
                  id="es-phone"
                  className="h-11"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 7…"
                />
              </Field>
              <FieldGrid>
                <Field id="es-year" label="Year of study">
                  <Input
                    id="es-year"
                    type="number"
                    min={1}
                    max={8}
                    className="h-11"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />
                </Field>
                <Field id="es-term" label="Current term">
                  <Input
                    id="es-term"
                    type="number"
                    min={1}
                    max={12}
                    className="h-11"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                  />
                </Field>
              </FieldGrid>
              {formError && (
                <p role="alert" className="text-sm font-medium text-destructive">
                  {formError}
                </p>
              )}
            </div>
          </DialogBody>
          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => onOpenChange(false)}
              disabled={update.isPending}
            >
              Cancel
            </Button>
            <SubmitButton pending={update.isPending}>Save changes</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
