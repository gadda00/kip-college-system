'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, Clock, ListTree, Plus, Trash2 } from 'lucide-react'
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
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
import { api, del, post } from '@/components/kip/lib/api'
import { navigate } from '@/components/kip/lib/router'
import { fmtDuration, fmtKES } from '@/components/kip/lib/format'
import { TableSkeleton, ViewHeading } from '@/components/kip/portal/shared'
import { DialogBody, Field, FieldGrid, SubmitButton } from '@/components/kip/admin/form-bits'
import type { AdminCourseDetail } from '@/components/kip/admin/types'
import type { CourseUnit } from '@/components/kip/lib/types'

function categoryTone(category: string): string {
  switch (category) {
    case 'TECHNICAL':
      return 'border-transparent bg-emerald-600/10 text-emerald-700 dark:text-emerald-400'
    case 'KASNEB':
      return 'border-transparent bg-gold-400/15 text-gold-700 dark:text-gold-300'
    default:
      return 'border-transparent bg-teal-600/10 text-teal-700 dark:text-teal-400'
  }
}

export function CourseUnitsView({ courseId }: { courseId: string }) {
  const [addOpen, setAddOpen] = useState(false)
  const [deleting, setDeleting] = useState<CourseUnit | null>(null)

  const { data, status, error, refetch } = useQuery<AdminCourseDetail>({
    queryKey: ['admin-course', courseId],
    queryFn: () => api<AdminCourseDetail>(`/api/public/courses/${courseId}`),
    retry: false,
  })

  return (
    <div className="space-y-6">
      <ViewHeading
        title="Course units"
        description="Curriculum structure grouped by stage."
        actions={
          <Button variant="outline" className="min-h-11" onClick={() => navigate('/admin/courses')}>
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            All courses
          </Button>
        }
      />

      <QueryBoundary
        status={status}
        error={error}
        onRetry={() => void refetch()}
        skeleton={<TableSkeleton rows={6} />}
      >
        {data && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Course header */}
            <Card className="rule-top-gold relative overflow-hidden">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-primary dark:bg-brand-100">
                    <BookOpen className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold tracking-tight">{data.title}</h2>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {data.code}
                      </Badge>
                      <Badge className={`text-[10px] ${categoryTone(data.category)}`}>
                        {data.category}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {data.level}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {data.level} · {fmtDuration(data.durationMonths)} ·{' '}
                      {fmtKES(data.tuitionPerTerm)}/term · {data.units.length} units ·{' '}
                      {data.intakes.join(' / ')} intakes
                    </p>
                  </div>
                </div>
                <Button className="min-h-11 shrink-0" onClick={() => setAddOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                  Add Unit
                </Button>
              </CardContent>
            </Card>

            {/* Units by stage — collapsible accordions (open by default) */}
            {data.unitsByStage.length === 0 ? (
              <EmptyState
                icon={ListTree}
                title="No units yet"
                hint="Add units to build this course's curriculum."
                className="py-16"
              />
            ) : (
              <Accordion
                type="multiple"
                defaultValue={data.unitsByStage.map((g) => `stage-${g.stage}`)}
                className="space-y-4"
              >
                {data.unitsByStage.map((group) => (
                  <Card key={group.stage} className="overflow-hidden py-0">
                    <AccordionItem value={`stage-${group.stage}`} className="border-b-0">
                      <AccordionTrigger
                        className="hover:no-underline [&>svg:last-child]:hidden [&[data-state=open]>.stage-toggle]:rotate-45 px-4 py-4 sm:px-6"
                      >
                        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                          <ListTree className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                          <span className="font-display text-base font-semibold">
                            {group.stageLabel}
                          </span>
                          <Badge variant="secondary" className="text-[10px]">
                            {group.units.length} unit{group.units.length === 1 ? '' : 's'}
                          </Badge>
                        </span>
                        <span
                          aria-hidden="true"
                          className="stage-toggle flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-400/15 text-gold-700 transition-transform duration-200 dark:text-gold-300"
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-0">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-brand-200/70 bg-brand-50/70 hover:bg-brand-50/70 dark:border-white/10 dark:bg-brand-100 dark:hover:bg-brand-100">
                                <TableHead className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-500">Code</TableHead>
                                <TableHead className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-500">Unit name</TableHead>
                                <TableHead className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-500">Week hours</TableHead>
                                <TableHead className="text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-500">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {group.units.map((u) => (
                                <TableRow
                                  key={u.id}
                                  className="odd:bg-muted/40 hover:bg-brand-50/60 dark:hover:bg-brand-100/30"
                                >
                                  <TableCell className="font-mono text-xs text-primary">
                                    {u.code}
                                  </TableCell>
                                  <TableCell className="text-sm font-medium">{u.name}</TableCell>
                                  <TableCell className="text-center">
                                    <Badge variant="outline" className="gap-1 text-[10px]">
                                      <Clock className="h-3 w-3" aria-hidden="true" />
                                      {u.weekHours}h
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="min-h-11 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                      onClick={() => setDeleting(u)}
                                      aria-label={`Delete ${u.name}`}
                                    >
                                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                                      <span className="sr-only">Delete unit</span>
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Card>
                ))}
              </Accordion>
            )}

            <AddUnitDialog
              key={`add-unit-${addOpen}`}
              open={addOpen}
              onOpenChange={setAddOpen}
              courseId={courseId}
            />
            {deleting && (
              <DeleteUnitDialog unit={deleting} onClose={() => setDeleting(null)} />
            )}
          </motion.div>
        )}
      </QueryBoundary>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Add unit dialog
// ---------------------------------------------------------------------------

function AddUnitDialog({
  open,
  onOpenChange,
  courseId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
}) {
  const queryClient = useQueryClient()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [stage, setStage] = useState('1')
  const [stageLabel, setStageLabel] = useState('')
  const [weekHours, setWeekHours] = useState('4')
  const [formError, setFormError] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: () =>
      post<CourseUnit>(`/api/admin/courses/${courseId}/units`, {
        code: code.trim(),
        name: name.trim(),
        stage: Number(stage) || 1,
        stageLabel: stageLabel.trim() || undefined,
        weekHours: Number(weekHours) || 4,
      }),
    onSuccess: (unit) => {
      toast.success('Unit added', {
        description: `${unit.code} — ${unit.name} (${unit.stageLabel}, ${unit.weekHours}h/week).`,
      })
      onOpenChange(false)
      void queryClient.invalidateQueries({ queryKey: ['admin-course', courseId] })
      void queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
    },
    onError: (err) => {
      setFormError(err instanceof Error ? err.message : 'Could not add the unit.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || !name.trim()) {
      setFormError('Unit code and name are required.')
      return
    }
    setFormError(null)
    create.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="gold-rule mb-2 w-8" aria-hidden="true" />
          <DialogTitle>Add unit</DialogTitle>
          <DialogDescription>
            New unit joins the course curriculum immediately (results + timetable pick it up).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <div className="space-y-4">
              <FieldGrid>
                <Field id="u-code" label="Unit code" required hint="e.g. DIP-ICT-2.1">
                  <Input
                    id="u-code"
                    className="h-11 font-mono"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="COURSE-2.1"
                    required
                  />
                </Field>
                <Field id="u-name" label="Unit name" required>
                  <Input
                    id="u-name"
                    className="h-11"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Database Design"
                    required
                  />
                </Field>
              </FieldGrid>
              <FieldGrid>
                <Field id="u-stage" label="Stage (term)" required>
                  <Input
                    id="u-stage"
                    type="number"
                    min={1}
                    max={12}
                    className="h-11"
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    required
                  />
                </Field>
                <Field id="u-hours" label="Week hours">
                  <Input
                    id="u-hours"
                    type="number"
                    min={1}
                    max={40}
                    className="h-11"
                    value={weekHours}
                    onChange={(e) => setWeekHours(e.target.value)}
                  />
                </Field>
              </FieldGrid>
              <Field id="u-label" label="Stage label" hint="Blank → “Term {stage}”.">
                <Input
                  id="u-label"
                  className="h-11"
                  value={stageLabel}
                  onChange={(e) => setStageLabel(e.target.value)}
                  placeholder="e.g. Term 2 / Module II"
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
            <SubmitButton pending={create.isPending}>Add unit</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Delete unit confirm
// ---------------------------------------------------------------------------

function DeleteUnitDialog({ unit, onClose }: { unit: CourseUnit; onClose: () => void }) {
  const queryClient = useQueryClient()

  const remove = useMutation({
    mutationFn: () => del<{ deleted: boolean }>(`/api/admin/units/${unit.id}`),
    onSuccess: () => {
      toast.success('Unit deleted', { description: `${unit.code} — ${unit.name} removed.` })
      onClose()
      void queryClient.invalidateQueries({ queryKey: ['admin-course'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
    },
    onError: (err) => {
      toast.error('Could not delete unit', {
        description: err instanceof Error ? err.message : undefined,
      })
      onClose()
    },
  })

  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{unit.name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            Removes {unit.code} ({unit.stageLabel}) from the curriculum. Existing results for this
            unit are also removed; timetable entries are detached.
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
            {remove.isPending ? 'Deleting…' : 'Delete unit'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
