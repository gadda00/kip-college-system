'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, Receipt, Search, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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
import { QueryBoundary } from '@/components/kip/components/loading'
import { api, post } from '@/components/kip/lib/api'
import { fmtDate, fmtKES } from '@/components/kip/lib/format'
import { RowsSkeleton, TableSkeleton, ViewHeading } from '@/components/kip/portal/shared'
import { Field, FieldGrid, SubmitButton } from '@/components/kip/admin/form-bits'
import type {
  AdminCourse,
  AdminPaymentRow,
  AdminStudentRow,
  PostFeeResult,
  RecordPaymentResult,
} from '@/components/kip/admin/types'
import { cn } from '@/lib/utils'

const TERM_SUGGESTIONS = ['2026/2027 T1', '2026/2027 T2', '2025/2026 T3']
const FEE_TYPES = ['TUITION', 'REGISTRATION', 'EXAM', 'OTHER'] as const
const PAY_METHODS = ['MPESA', 'BANK', 'CASH'] as const

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

/**
 * Searchable student picker: text filter over /api/admin/students with a
 * scrollable list of results (name + admission no + course).
 */
function StudentPicker({
  students,
  selectedId,
  onSelect,
  idPrefix,
}: {
  students: AdminStudentRow[]
  selectedId: string
  onSelect: (id: string) => void
  idPrefix: string
}) {
  const [filter, setFilter] = useState('')
  const matches = useMemo(() => {
    const q = filter.trim().toLowerCase()
    const base = q
      ? students.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.admissionNo.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q),
        )
      : students
    return base.slice(0, 40)
  }, [students, filter])

  const selected = students.find((s) => s.id === selectedId) ?? null

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by name, admission no, email…"
          aria-label="Filter students"
          aria-controls={`${idPrefix}-results`}
          className="h-11 pl-9"
        />
      </div>
      <div
        id={`${idPrefix}-results`}
        role="listbox"
        aria-label="Matching students"
        className="max-h-44 overflow-y-auto custom-scrollbar rounded-xl border"
      >
        {matches.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            No students match “{filter}”.
          </p>
        ) : (
          <ul className="divide-y">
            {matches.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={s.id === selectedId}
                  onClick={() => onSelect(s.id)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors',
                    s.id === selectedId
                      ? 'bg-primary/10'
                      : 'hover:bg-muted/60',
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{s.name}</span>
                    <span className="block truncate font-mono text-[10px] text-muted-foreground">
                      {s.admissionNo} · {s.course.code}
                    </span>
                  </span>
                  {s.id === selectedId && (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {selected && (
        <p className="text-xs text-muted-foreground">
          Selected: <span className="font-medium text-foreground">{selected.name}</span> — current
          balance {selected.balance > 0 ? fmtKES(selected.balance) : 'Clear'}.
        </p>
      )}
    </div>
  )
}

export function FeesView() {
  const students = useQuery<AdminStudentRow[]>({
    queryKey: ['admin-students', ''],
    queryFn: () => api<AdminStudentRow[]>('/api/admin/students'),
    staleTime: 60_000,
  })
  const courses = useQuery<AdminCourse[]>({
    queryKey: ['admin-courses'],
    queryFn: () => api<AdminCourse[]>('/api/admin/courses'),
    staleTime: 60_000,
  })
  const payments = useQuery<AdminPaymentRow[]>({
    queryKey: ['admin-payments'],
    queryFn: () => api<AdminPaymentRow[]>('/api/admin/payments'),
  })

  return (
    <div className="space-y-6">
      <ViewHeading
        title="Fees & payments"
        description="Post fee items to students or whole courses, and confirm payments received."
      />

      <QueryBoundary
        status={students.status}
        error={students.error}
        onRetry={() => void students.refetch()}
        skeleton={<RowsSkeleton rows={2} />}
      >
        <Tabs defaultValue="post">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="post" className="min-h-9 flex-1 gap-2 sm:flex-none">
              <Receipt className="h-4 w-4" aria-hidden="true" />
              Post fees
            </TabsTrigger>
            <TabsTrigger value="pay" className="min-h-9 flex-1 gap-2 sm:flex-none">
              <Wallet className="h-4 w-4" aria-hidden="true" />
              Record payment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="post" className="mt-4">
            {courses.data && students.data && (
              <PostFeeForm
                students={students.data.filter((s) => s.status === 'ACTIVE')}
                courses={courses.data}
              />
            )}
          </TabsContent>

          <TabsContent value="pay" className="mt-4">
            {students.data && (
              <RecordPaymentForm students={students.data.filter((s) => s.status === 'ACTIVE')} />
            )}
          </TabsContent>
        </Tabs>
      </QueryBoundary>

      {/* Recent payments ledger */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
            Payments ledger
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            All confirmed payments, newest first ({payments.data?.length ?? 0} total).
          </p>
        </CardHeader>
        <CardContent>
          <QueryBoundary
            status={payments.status}
            error={payments.error}
            onRetry={() => void payments.refetch()}
            skeleton={<TableSkeleton rows={6} />}
          >
            {payments.data && payments.data.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="No payments recorded"
                hint="Recorded payments appear here immediately."
                className="py-12"
              />
            ) : (
              <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Desktop table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(payments.data ?? []).map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <p className="text-sm font-semibold">{p.studentName}</p>
                            <p className="font-mono text-[11px] text-muted-foreground">
                              {p.admissionNo}
                            </p>
                          </TableCell>
                          <TableCell className="max-w-48 truncate text-sm text-muted-foreground">
                            {p.course}
                          </TableCell>
                          <TableCell className="text-right text-sm font-bold text-green-600 dark:text-green-400">
                            {fmtKES(p.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-[10px] ${methodTone(p.method)}`}>
                              {p.method}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-[11px]">{p.reference}</TableCell>
                          <TableCell className="max-w-40 truncate text-xs text-muted-foreground">
                            {p.note ?? '—'}
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {fmtDate(p.paidAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Mobile stacked */}
                <ul className="space-y-3 md:hidden">
                  {(payments.data ?? []).map((p) => (
                    <li key={p.id} className="rounded-xl border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{p.studentName}</p>
                          <p className="font-mono text-[11px] text-muted-foreground">
                            {p.admissionNo}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-bold text-green-600 dark:text-green-400">
                          {fmtKES(p.amount)}
                        </p>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge className={`text-[10px] ${methodTone(p.method)}`}>{p.method}</Badge>
                        <span className="font-mono text-[11px]">{p.reference}</span>
                        <span>· {fmtDate(p.paidAt)}</span>
                      </div>
                      {p.note && (
                        <p className="mt-1.5 truncate text-xs text-muted-foreground">{p.note}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </QueryBoundary>
        </CardContent>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Post fee form (single student OR whole course)
// ---------------------------------------------------------------------------

function PostFeeForm({
  students,
  courses,
}: {
  students: AdminStudentRow[]
  courses: AdminCourse[]
}) {
  const queryClient = useQueryClient()
  const [target, setTarget] = useState<'student' | 'course'>('student')
  const [studentId, setStudentId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [term, setTerm] = useState(TERM_SUGGESTIONS[0]!)
  const [type, setType] = useState<string>('TUITION')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const selectedCourse = courses.find((c) => c.id === courseId) ?? null

  const create = useMutation({
    mutationFn: () =>
      post<PostFeeResult>('/api/admin/fees', {
        ...(target === 'student' ? { studentId } : { courseId }),
        term: term.trim(),
        type,
        description: description.trim(),
        amount: Number(amount),
        ...(dueDate ? { dueDate } : {}),
      }),
    onSuccess: (res) => {
      if (res.posted === 0) {
        toast.info('Nothing posted', { description: res.note ?? 'No active students in this course.' })
        return
      }
      toast.success('Fees posted', {
        description:
          target === 'student'
            ? `${fmtKES(Number(amount))} — ${description.trim()} (${term}). New balance ${fmtKES(res.balance ?? 0)}.`
            : `Posted to ${res.posted} active student${res.posted === 1 ? '' : 's'} of ${res.course} — ${fmtKES(Number(amount))} each.`,
      })
      setDescription('')
      setAmount('')
      setDueDate('')
      void queryClient.invalidateQueries({ queryKey: ['admin-students'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
    },
    onError: (err) => {
      setFormError(err instanceof Error ? err.message : 'Could not post the fee.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (target === 'student' && !studentId) {
      setFormError('Select a student first.')
      return
    }
    if (target === 'course' && !courseId) {
      setFormError('Select a course first.')
      return
    }
    if (!term.trim() || !description.trim() || !amount || Number(amount) <= 0) {
      setFormError('Term, description and a positive amount are required.')
      return
    }
    setFormError(null)
    create.mutate()
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Post a fee item</CardTitle>
          <p className="text-xs text-muted-foreground">
            Charge one student, or bulk-charge every active student in a course.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Target</Label>
              <RadioGroup
                value={target}
                onValueChange={(v) => setTarget(v as 'student' | 'course')}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                <label
                  htmlFor="tgt-student"
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm font-medium has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-primary/5"
                >
                  <RadioGroupItem value="student" id="tgt-student" />
                  Single student
                </label>
                <label
                  htmlFor="tgt-course"
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm font-medium has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-primary/5"
                >
                  <RadioGroupItem value="course" id="tgt-course" />
                  Whole course
                </label>
              </RadioGroup>
            </div>

            {target === 'student' ? (
              <Field id="pf-student" label="Student" required>
                <StudentPicker
                  students={students}
                  selectedId={studentId}
                  onSelect={setStudentId}
                  idPrefix="pf"
                />
              </Field>
            ) : (
              <Field
                id="pf-course"
                label="Course"
                required
                hint={
                  selectedCourse
                    ? `${selectedCourse.studentsCount} active student${selectedCourse.studentsCount === 1 ? '' : 's'} will be charged.`
                    : undefined
                }
              >
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger id="pf-course" className="h-11 w-full">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title} ({c.studentsCount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}

            <FieldGrid>
              <Field id="pf-term" label="Term" required>
                <Input
                  id="pf-term"
                  className="h-11"
                  list="fee-term-suggestions"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  required
                />
                <datalist id="fee-term-suggestions">
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
                placeholder={
                  type === 'TUITION'
                    ? 'e.g. Tuition Fee — 2026/2027 T1'
                    : type === 'EXAM'
                      ? 'e.g. KNEC Examination Fee'
                      : 'Description…'
                }
                required
              />
            </Field>

            <FieldGrid>
              <Field id="pf-amount" label="Amount per student (KES)" required>
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

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {target === 'course'
                  ? `Total impact: ${fmtKES((Number(amount) || 0) * (selectedCourse?.studentsCount ?? 0))} across the course.`
                  : 'Fee appears on the student statement immediately.'}
              </p>
              <SubmitButton pending={create.isPending} pendingLabel="Posting…">
                <Receipt className="mr-2 h-4 w-4" aria-hidden="true" />
                Post fee
              </SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Record payment form
// ---------------------------------------------------------------------------

function RecordPaymentForm({ students }: { students: AdminStudentRow[] }) {
  const queryClient = useQueryClient()
  const [studentId, setStudentId] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<string>('MPESA')
  const [reference, setReference] = useState('')
  const [note, setNote] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const selected = students.find((s) => s.id === studentId) ?? null

  const create = useMutation({
    mutationFn: () =>
      post<RecordPaymentResult>('/api/admin/payments', {
        studentId,
        amount: Number(amount),
        method,
        reference: reference.trim() || undefined,
        note: note.trim() || undefined,
      }),
    onSuccess: (res) => {
      toast.success('Payment recorded', {
        description: `${res.studentName} — ${fmtKES(res.amount)} via ${res.method} (ref ${res.reference}). New balance ${fmtKES(res.balance)}.`,
      })
      setAmount('')
      setReference('')
      setNote('')
      void queryClient.invalidateQueries({ queryKey: ['admin-payments'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-students'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
    },
    onError: (err) => {
      setFormError(err instanceof Error ? err.message : 'Could not record the payment.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId) {
      setFormError('Select a student first.')
      return
    }
    if (!amount || Number(amount) <= 0) {
      setFormError('Enter a positive amount.')
      return
    }
    setFormError(null)
    create.mutate()
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Record a payment</CardTitle>
          <p className="text-xs text-muted-foreground">
            Confirm a fee payment received at the office (M-Pesa, bank or cash).
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field id="rp-student" label="Student" required>
              <StudentPicker
                students={students}
                selectedId={studentId}
                onSelect={setStudentId}
                idPrefix="rp"
              />
            </Field>

            <FieldGrid>
              <Field
                id="rp-amount"
                label="Amount (KES)"
                required
                hint={selected ? `Current balance ${fmtKES(selected.balance)}` : undefined}
              >
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

            <FieldGrid>
              <Field id="rp-ref" label="Reference" hint="Blank → auto-generated.">
                <Input
                  id="rp-ref"
                  className="h-11 font-mono"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. QGH7X2LM90"
                />
              </Field>
              <Field id="rp-note" label="Note">
                <Input
                  id="rp-note"
                  className="h-11"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Part payment — tuition"
                />
              </Field>
            </FieldGrid>

            {formError && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {formError}
              </p>
            )}

            <div className="flex items-center justify-end">
              <SubmitButton pending={create.isPending} pendingLabel="Recording…">
                <Wallet className="mr-2 h-4 w-4" aria-hidden="true" />
                Record payment
              </SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
