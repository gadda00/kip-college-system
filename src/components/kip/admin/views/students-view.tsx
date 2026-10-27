'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, UserPlus, Users, IdCard, X } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { api, post } from '@/components/kip/lib/api'
import { navigate } from '@/components/kip/lib/router'
import { fmtKES } from '@/components/kip/lib/format'
import { TableSkeleton, ViewHeading } from '@/components/kip/portal/shared'
import { DialogBody, Field, FieldGrid, SubmitButton } from '@/components/kip/admin/form-bits'
import { StudentIdCardDialog } from '@/components/kip/admin/views/id-card-dialog'
import type {
  AdminCourse,
  AdminStudentRow,
} from '@/components/kip/admin/types'
import type { Campus } from '@/components/kip/lib/types'

const STATUS_OPTIONS = ['ALL', 'ACTIVE', 'GRADUATED', 'SUSPENDED'] as const

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'ACTIVE') return 'default'
  if (status === 'GRADUATED') return 'secondary'
  if (status === 'SUSPENDED') return 'destructive'
  return 'outline'
}

/** Debounce a value by ~300ms for search inputs. */
function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

const ALL = '__all__'

export function StudentsView() {
  const [q, setQ] = useState('')
  const [courseId, setCourseId] = useState(ALL)
  const [campusId, setCampusId] = useState(ALL)
  const [status, setStatus] = useState<string>('ALL')
  const [addOpen, setAddOpen] = useState(false)
  const [idCardStudentId, setIdCardStudentId] = useState<string | null>(null)
  const debouncedQ = useDebounced(q.trim())

  const params = useMemo(() => {
    const sp = new URLSearchParams()
    if (debouncedQ) sp.set('q', debouncedQ)
    if (courseId !== ALL) sp.set('courseId', courseId)
    if (campusId !== ALL) sp.set('campusId', campusId)
    if (status !== 'ALL') sp.set('status', status)
    return sp.toString()
  }, [debouncedQ, courseId, campusId, status])

  const students = useQuery<AdminStudentRow[]>({
    queryKey: ['admin-students', params],
    queryFn: () => api<AdminStudentRow[]>(`/api/admin/students?${params}`),
  })
  const courses = useQuery<AdminCourse[]>({
    queryKey: ['admin-courses'],
    queryFn: () => api<AdminCourse[]>('/api/admin/courses'),
    staleTime: 60_000,
  })
  const campuses = useQuery<Campus[]>({
    queryKey: ['public-campuses'],
    queryFn: () => api<Campus[]>('/api/public/campuses'),
    staleTime: 60_000,
  })

  const hasFilters = debouncedQ !== '' || courseId !== ALL || campusId !== ALL || status !== 'ALL'

  return (
    <div className="space-y-6">
      <ViewHeading
        title="Students"
        description="Search, filter and enrol students across all courses and campuses."
        actions={
          <Button onClick={() => setAddOpen(true)} className="min-h-11">
            <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
            Add Student
          </Button>
        }
      />

      {/* Filter bar */}
      <Card>
        <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, admission no, email…"
              aria-label="Search students"
              className="h-11 pl-9"
            />
          </div>
          <Select value={courseId} onValueChange={setCourseId}>
            <SelectTrigger className="h-11 w-full" aria-label="Filter by course">
              <SelectValue placeholder="All courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All courses</SelectItem>
              {(courses.data ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={campusId} onValueChange={setCampusId}>
            <SelectTrigger className="h-11 w-full" aria-label="Filter by campus">
              <SelectValue placeholder="All campuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All campuses</SelectItem>
              {(campuses.data ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-11 w-full" aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === 'ALL' ? 'All statuses' : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button
                variant="outline"
                className="min-h-11 shrink-0 px-3"
                aria-label="Clear filters"
                onClick={() => {
                  setQ('')
                  setCourseId(ALL)
                  setCampusId(ALL)
                  setStatus('ALL')
                }}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <QueryBoundary
        status={students.status}
        error={students.error}
        onRetry={() => void students.refetch()}
        skeleton={<TableSkeleton rows={8} />}
      >
        {students.data && students.data.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students match"
            hint={hasFilters ? 'Try adjusting the search or filters.' : 'Add your first student to get started.'}
            action={
              !hasFilters ? (
                <Button onClick={() => setAddOpen(true)} className="min-h-11">
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                  Add Student
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Campus</TableHead>
                      <TableHead>Year / Term</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(students.data ?? []).map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="min-w-56">
                          <p className="text-sm font-semibold">{s.name}</p>
                          <p className="font-mono text-[11px] text-muted-foreground">
                            {s.admissionNo}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{s.email}</p>
                        </TableCell>
                        <TableCell className="max-w-56">
                          <p className="truncate text-sm">{s.course.title}</p>
                          <Badge variant="outline" className="mt-1 text-[10px]">
                            {s.course.code}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {s.campus.name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          Y{s.yearOfStudy} · T{s.currentTerm}
                        </TableCell>
                        <TableCell className="text-right">
                          {s.balance > 0 ? (
                            <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                              {fmtKES(s.balance)}
                            </span>
                          ) : (
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              Clear
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(s.status)} className="text-[10px]">
                            {s.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="min-h-11"
                              onClick={() => navigate(`/admin/students/${s.id}`)}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="min-h-11"
                              aria-label={`Open ID card for ${s.name}`}
                              onClick={() => setIdCardStudentId(s.id)}
                            >
                              <IdCard className="h-4 w-4" aria-hidden="true" />
                              ID Card
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile stacked cards */}
              <ul className="space-y-3 p-4 lg:hidden">
                {(students.data ?? []).map((s) => (
                  <li key={s.id} className="rounded-xl border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{s.name}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {s.admissionNo}
                        </p>
                      </div>
                      <Badge variant={statusVariant(s.status)} className="shrink-0 text-[10px]">
                        {s.status}
                      </Badge>
                    </div>
                    <p className="mt-1.5 truncate text-xs text-muted-foreground">
                      {s.course.title} · {s.campus.name} · Y{s.yearOfStudy} T{s.currentTerm}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      {s.balance > 0 ? (
                        <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                          {fmtKES(s.balance)}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          Clear
                        </span>
                      )}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-11"
                          onClick={() => navigate(`/admin/students/${s.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-11 px-3"
                          aria-label={`Open ID card for ${s.name}`}
                          onClick={() => setIdCardStudentId(s.id)}
                        >
                          <IdCard className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only sm:not-sr-only sm:ml-1">ID</span>
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </QueryBoundary>

      <AddStudentDialog
        key={`add-student-${addOpen}`}
        open={addOpen}
        onOpenChange={setAddOpen}
        courses={courses.data ?? []}
        campuses={campuses.data ?? []}
      />

      {idCardStudentId && (
        <StudentIdCardDialog
          open
          onOpenChange={(o) => {
            if (!o) setIdCardStudentId(null)
          }}
          studentId={idCardStudentId}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Add student dialog
// ---------------------------------------------------------------------------

type AddStudentForm = {
  name: string
  email: string
  phone: string
  password: string
  courseId: string
  campusId: string
  yearOfStudy: string
  currentTerm: string
  kcseGrade: string
  guardianName: string
  guardianPhone: string
}

const EMPTY_FORM: AddStudentForm = {
  name: '',
  email: '',
  phone: '',
  password: 'Student@123',
  courseId: '',
  campusId: '',
  yearOfStudy: '1',
  currentTerm: '1',
  kcseGrade: '',
  guardianName: '',
  guardianPhone: '',
}

function AddStudentDialog({
  open,
  onOpenChange,
  courses,
  campuses,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  courses: AdminCourse[]
  campuses: Campus[]
}) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<AddStudentForm>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: () =>
      post<AdminStudentRow>('/api/admin/students', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
        courseId: form.courseId,
        campusId: form.campusId,
        yearOfStudy: Number(form.yearOfStudy) || 1,
        currentTerm: Number(form.currentTerm) || 1,
        kcseGrade: form.kcseGrade.trim() || undefined,
        guardianName: form.guardianName.trim() || undefined,
        guardianPhone: form.guardianPhone.trim() || undefined,
      }),
    onSuccess: (student) => {
      toast.success('Student enrolled', {
        description: `${student.name} admitted as ${student.admissionNo} (${student.course.code}).`,
      })
      onOpenChange(false)
      void queryClient.invalidateQueries({ queryKey: ['admin-students'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
    },
    onError: (err) => {
      setFormError(err instanceof Error ? err.message : 'Could not create the student.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.courseId ||
      !form.campusId
    ) {
      setFormError('Name, email, password, course and campus are required.')
      return
    }
    setFormError(null)
    create.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add student</DialogTitle>
          <DialogDescription>
            Create a student account with an auto-generated admission number. The student can
            change the password later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <div className="space-y-4">
              <Field id="st-name" label="Full name" required>
                <Input
                  id="st-name"
                  className="h-11"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Mary Njeri"
                  required
                />
              </Field>
              <FieldGrid>
                <Field id="st-email" label="Email" required>
                  <Input
                    id="st-email"
                    type="email"
                    className="h-11"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="student@students.kipcollege.ac.ke"
                    required
                  />
                </Field>
                <Field id="st-phone" label="Phone">
                  <Input
                    id="st-phone"
                    className="h-11"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+254 7…"
                  />
                </Field>
              </FieldGrid>
              <Field id="st-password" label="Password" required hint="Default shown — share with the student.">
                <Input
                  id="st-password"
                  className="h-11 font-mono"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                />
              </Field>
              <FieldGrid>
                <Field id="st-course" label="Course" required>
                  <Select
                    value={form.courseId}
                    onValueChange={(v) => setForm((f) => ({ ...f, courseId: v }))}
                  >
                    <SelectTrigger id="st-course" className="h-11 w-full">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field id="st-campus" label="Campus" required>
                  <Select
                    value={form.campusId}
                    onValueChange={(v) => setForm((f) => ({ ...f, campusId: v }))}
                  >
                    <SelectTrigger id="st-campus" className="h-11 w-full">
                      <SelectValue placeholder="Select campus" />
                    </SelectTrigger>
                    <SelectContent>
                      {campuses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGrid>
              <FieldGrid>
                <Field id="st-year" label="Year of study">
                  <Input
                    id="st-year"
                    type="number"
                    min={1}
                    max={8}
                    className="h-11"
                    value={form.yearOfStudy}
                    onChange={(e) => setForm((f) => ({ ...f, yearOfStudy: e.target.value }))}
                  />
                </Field>
                <Field id="st-term" label="Current term">
                  <Input
                    id="st-term"
                    type="number"
                    min={1}
                    max={12}
                    className="h-11"
                    value={form.currentTerm}
                    onChange={(e) => setForm((f) => ({ ...f, currentTerm: e.target.value }))}
                  />
                </Field>
              </FieldGrid>
              <FieldGrid>
                <Field id="st-kcse" label="KCSE grade">
                  <Input
                    id="st-kcse"
                    className="h-11"
                    value={form.kcseGrade}
                    onChange={(e) => setForm((f) => ({ ...f, kcseGrade: e.target.value }))}
                    placeholder="e.g. B-"
                  />
                </Field>
                <Field id="st-gphone" label="Guardian phone">
                  <Input
                    id="st-gphone"
                    className="h-11"
                    value={form.guardianPhone}
                    onChange={(e) => setForm((f) => ({ ...f, guardianPhone: e.target.value }))}
                    placeholder="+254 7…"
                  />
                </Field>
              </FieldGrid>
              <Field id="st-gname" label="Guardian name">
                <Input
                  id="st-gname"
                  className="h-11"
                  value={form.guardianName}
                  onChange={(e) => setForm((f) => ({ ...f, guardianName: e.target.value }))}
                  placeholder="e.g. Peter Njeri"
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
            <SubmitButton pending={create.isPending} pendingLabel="Enrolling…">
              Enrol student
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
