'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BookOpen,
  ListTree,
  Pencil,
  Plus,
  Star,
  Trash2,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
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
import { api, del, patch, post } from '@/components/kip/lib/api'
import { navigate } from '@/components/kip/lib/router'
import { fmtDuration, fmtKES } from '@/components/kip/lib/format'
import { TableSkeleton, ViewHeading } from '@/components/kip/portal/shared'
import { DialogBody, Field, FieldGrid, SubmitButton } from '@/components/kip/admin/form-bits'
import type { AdminCourse } from '@/components/kip/admin/types'

const CATEGORIES = ['TECHNICAL', 'BUSINESS', 'KASNEB'] as const

function categoryTone(category: string): string {
  switch (category) {
    case 'TECHNICAL':
      return 'border-transparent bg-primary/10 text-primary'
    case 'KASNEB':
      return 'border-transparent bg-amber-400/15 text-amber-700 dark:text-amber-400'
    default:
      return 'border-transparent bg-emerald-600/10 text-emerald-700 dark:text-emerald-400'
  }
}

export function CoursesView() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminCourse | null>(null)
  const [deleting, setDeleting] = useState<AdminCourse | null>(null)

  const { data, status, error, refetch } = useQuery<AdminCourse[]>({
    queryKey: ['admin-courses'],
    queryFn: () => api<AdminCourse[]>('/api/admin/courses'),
  })

  return (
    <div className="space-y-6">
      <ViewHeading
        title="Courses"
        description="Manage programmes, fees and unit curricula across all categories."
        actions={
          <Button
            className="min-h-11"
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Add Course
          </Button>
        }
      />

      <QueryBoundary
        status={status}
        error={error}
        onRetry={() => void refetch()}
        skeleton={<TableSkeleton rows={8} />}
      >
        {data && data.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses yet"
            hint="Create your first programme to start accepting applications."
            className="py-16"
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              {/* Desktop table */}
              <div className="hidden overflow-x-auto xl:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="text-right">Tuition / term</TableHead>
                      <TableHead className="text-center">Units</TableHead>
                      <TableHead className="text-center">Students</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data ?? []).map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="min-w-64">
                          <p className="text-sm font-semibold">{c.title}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <Badge variant="outline" className="font-mono text-[10px]">
                              {c.code}
                            </Badge>
                            <Badge className={`text-[10px] ${categoryTone(c.category)}`}>
                              {c.category}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.level}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {fmtDuration(c.durationMonths)}
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold">
                          {fmtKES(c.tuitionPerTerm)}
                        </TableCell>
                        <TableCell className="text-center text-sm">{c.unitsCount}</TableCell>
                        <TableCell className="text-center text-sm">
                          {c.studentsCount}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-start gap-1">
                            <Badge
                              variant={c.isActive ? 'default' : 'secondary'}
                              className="text-[10px]"
                            >
                              {c.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {c.isFeatured && (
                              <Badge className="border-transparent bg-amber-400/15 text-[10px] text-amber-700 dark:text-amber-400">
                                <Star className="mr-1 h-3 w-3" aria-hidden="true" />
                                Featured
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="min-h-11"
                              onClick={() => navigate(`/admin/courses/${c.id}`)}
                              aria-label={`Manage units for ${c.title}`}
                            >
                              <ListTree className="h-4 w-4" aria-hidden="true" />
                              <span className="sr-only sm:not-sr-only sm:ml-1">Units</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="min-h-11"
                              onClick={() => {
                                setEditing(c)
                                setDialogOpen(true)
                              }}
                              aria-label={`Edit ${c.title}`}
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                              <span className="sr-only sm:not-sr-only sm:ml-1">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="min-h-11 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setDeleting(c)}
                              aria-label={`Delete ${c.title}`}
                              disabled={c.studentsCount > 0}
                              title={
                                c.studentsCount > 0
                                  ? 'Cannot delete a course with enrolled students'
                                  : undefined
                              }
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile / tablet cards */}
              <ul className="space-y-3 p-4 xl:hidden">
                {(data ?? []).map((c) => (
                  <li key={c.id} className="rounded-xl border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-snug">{c.title}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {c.code}
                          </Badge>
                          <Badge className={`text-[10px] ${categoryTone(c.category)}`}>
                            {c.category}
                          </Badge>
                          {c.isFeatured && (
                            <Badge className="border-transparent bg-amber-400/15 text-[10px] text-amber-700 dark:text-amber-400">
                              <Star className="mr-1 h-3 w-3" aria-hidden="true" />
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={c.isActive ? 'default' : 'secondary'}
                        className="shrink-0 text-[10px]"
                      >
                        {c.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {c.level} · {fmtDuration(c.durationMonths)} · {fmtKES(c.tuitionPerTerm)}/term ·{' '}
                      {c.unitsCount} units · {c.studentsCount} students
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-11"
                        onClick={() => navigate(`/admin/courses/${c.id}`)}
                      >
                        <ListTree className="mr-2 h-4 w-4" aria-hidden="true" />
                        Units
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-11"
                        onClick={() => {
                          setEditing(c)
                          setDialogOpen(true)
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-11 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleting(c)}
                        disabled={c.studentsCount > 0}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </QueryBoundary>

      <CourseDialog
        key={`course-${dialogOpen}-${editing?.id ?? 'new'}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        course={editing}
      />

      {deleting && (
        <DeleteCourseDialog
          course={deleting}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Add / edit course dialog
// ---------------------------------------------------------------------------

type CourseForm = {
  title: string
  category: string
  level: string
  examBody: string
  durationMonths: string
  intakeMonths: string
  tuitionPerTerm: string
  registrationFee: string
  examFee: string
  description: string
  requirements: string
  isActive: boolean
  isFeatured: boolean
}

const EMPTY_COURSE: CourseForm = {
  title: '',
  category: 'TECHNICAL',
  level: 'Certificate',
  examBody: 'KNEC',
  durationMonths: '12',
  intakeMonths: 'January,May,September',
  tuitionPerTerm: '',
  registrationFee: '',
  examFee: '',
  description: '',
  requirements: '',
  isActive: true,
  isFeatured: false,
}

function courseToForm(c: AdminCourse): CourseForm {
  return {
    title: c.title,
    category: c.category,
    level: c.level,
    examBody: c.examBody,
    durationMonths: String(c.durationMonths),
    intakeMonths: c.intakeMonths,
    tuitionPerTerm: String(c.tuitionPerTerm),
    registrationFee: String(c.registrationFee),
    examFee: String(c.examFee),
    description: c.description ?? '',
    requirements: c.requirements ?? '',
    isActive: c.isActive,
    isFeatured: c.isFeatured,
  }
}

function CourseDialog({
  open,
  onOpenChange,
  course,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: AdminCourse | null
}) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<CourseForm>(() =>
    course ? courseToForm(course) : EMPTY_COURSE,
  )
  const [formError, setFormError] = useState<string | null>(null)

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        title: form.title.trim(),
        category: form.category,
        level: form.level.trim(),
        examBody: form.examBody.trim(),
        durationMonths: Number(form.durationMonths) || 1,
        intakeMonths: form.intakeMonths.trim(),
        tuitionPerTerm: Number(form.tuitionPerTerm) || 0,
        registrationFee: Number(form.registrationFee) || 0,
        examFee: Number(form.examFee) || 0,
        description: form.description.trim(),
        requirements: form.requirements.trim(),
        isActive: form.isActive,
        isFeatured: form.isFeatured,
      }
      return course
        ? patch<AdminCourse>(`/api/admin/courses/${course.id}`, payload)
        : post<AdminCourse>('/api/admin/courses', payload)
    },
    onSuccess: (saved) => {
      toast.success(course ? 'Course updated' : 'Course created', {
        description: `${saved.title} (${saved.code}) — ${fmtKES(saved.tuitionPerTerm)}/term.`,
      })
      onOpenChange(false)
      void queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
    },
    onError: (err) => {
      setFormError(err instanceof Error ? err.message : 'Could not save the course.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.level.trim() || !form.examBody.trim()) {
      setFormError('Title, level and exam body are required.')
      return
    }
    setFormError(null)
    save.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{course ? `Edit ${course.code}` : 'Add course'}</DialogTitle>
          <DialogDescription>
            {course
              ? 'Update programme details, fees and visibility.'
              : 'New programmes appear on the public website when active.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <div className="space-y-4">
              <Field id="c-title" label="Title" required>
                <Input
                  id="c-title"
                  className="h-11"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Diploma in Human Resource Management"
                  required
                />
              </Field>
              <FieldGrid>
                <Field id="c-category" label="Category" required>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                  >
                    <SelectTrigger id="c-category" className="h-11 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field id="c-level" label="Level" required>
                  <Input
                    id="c-level"
                    className="h-11"
                    value={form.level}
                    onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                    placeholder="Certificate / Diploma / Professional"
                    required
                  />
                </Field>
              </FieldGrid>
              <FieldGrid>
                <Field id="c-exam" label="Exam body" required>
                  <Input
                    id="c-exam"
                    className="h-11"
                    value={form.examBody}
                    onChange={(e) => setForm((f) => ({ ...f, examBody: e.target.value }))}
                    placeholder="KNEC / KASNEB / NITA / TVET-CDACC"
                    required
                  />
                </Field>
                <Field id="c-duration" label="Duration (months)" required>
                  <Input
                    id="c-duration"
                    type="number"
                    min={1}
                    max={60}
                    className="h-11"
                    value={form.durationMonths}
                    onChange={(e) => setForm((f) => ({ ...f, durationMonths: e.target.value }))}
                    required
                  />
                </Field>
              </FieldGrid>
              <Field id="c-intakes" label="Intake months" hint="Comma-separated list.">
                <Input
                  id="c-intakes"
                  className="h-11"
                  value={form.intakeMonths}
                  onChange={(e) => setForm((f) => ({ ...f, intakeMonths: e.target.value }))}
                  placeholder="January,May,September"
                />
              </Field>
              <FieldGrid>
                <Field id="c-tuition" label="Tuition / term (KES)" required>
                  <Input
                    id="c-tuition"
                    type="number"
                    min={0}
                    className="h-11"
                    value={form.tuitionPerTerm}
                    onChange={(e) => setForm((f) => ({ ...f, tuitionPerTerm: e.target.value }))}
                    required
                  />
                </Field>
                <Field id="c-reg" label="Registration fee (KES)">
                  <Input
                    id="c-reg"
                    type="number"
                    min={0}
                    className="h-11"
                    value={form.registrationFee}
                    onChange={(e) => setForm((f) => ({ ...f, registrationFee: e.target.value }))}
                  />
                </Field>
              </FieldGrid>
              <Field id="c-examfee" label="Exam fee (KES)">
                <Input
                  id="c-examfee"
                  type="number"
                  min={0}
                  className="h-11"
                  value={form.examFee}
                  onChange={(e) => setForm((f) => ({ ...f, examFee: e.target.value }))}
                />
              </Field>
              <Field id="c-desc" label="Description">
                <Textarea
                  id="c-desc"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="What the programme covers…"
                />
              </Field>
              <Field id="c-req" label="Requirements">
                <Textarea
                  id="c-req"
                  rows={3}
                  value={form.requirements}
                  onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
                  placeholder="KCSE entry requirements…"
                />
              </Field>
              <div className="space-y-3 rounded-xl border p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label htmlFor="c-active" className="text-sm font-medium">
                      Active
                    </Label>
                    <p className="text-xs text-muted-foreground">Visible on the website.</p>
                  </div>
                  <Switch
                    id="c-active"
                    checked={form.isActive}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label htmlFor="c-featured" className="text-sm font-medium">
                      Featured
                    </Label>
                    <p className="text-xs text-muted-foreground">Highlighted on the home page.</p>
                  </div>
                  <Switch
                    id="c-featured"
                    checked={form.isFeatured}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, isFeatured: v }))}
                  />
                </div>
              </div>
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
              disabled={save.isPending}
            >
              Cancel
            </Button>
            <SubmitButton pending={save.isPending}>
              {course ? 'Save changes' : 'Create course'}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Delete confirm
// ---------------------------------------------------------------------------

function DeleteCourseDialog({ course, onClose }: { course: AdminCourse; onClose: () => void }) {
  const queryClient = useQueryClient()

  const remove = useMutation({
    mutationFn: () => del<{ deleted: boolean }>(`/api/admin/courses/${course.id}`),
    onSuccess: () => {
      toast.success('Course deleted', { description: `${course.title} (${course.code}) removed.` })
      onClose()
      void queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
    },
    onError: (err) => {
      // e.g. 400 "Cannot delete a course with enrolled students"
      toast.error('Could not delete course', {
        description: err instanceof Error ? err.message : 'Try again in a moment.',
      })
      onClose()
    },
  })

  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{course.title}”?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the course and its {course.unitsCount} units. Courses with
            enrolled students cannot be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="min-h-11" disabled={remove.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="min-h-11 bg-destructive text-white hover:bg-destructive/90"
            disabled={remove.isPending}
            onClick={(e) => {
              e.preventDefault()
              remove.mutate()
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            {remove.isPending ? 'Deleting…' : 'Delete course'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

