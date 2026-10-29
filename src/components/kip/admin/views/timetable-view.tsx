'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Clock, MapPin, Plus, Trash2, UserRound } from 'lucide-react'
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
import { TableSkeleton, ViewHeading, WEEKDAYS, fmtTimeSlot } from '@/components/kip/portal/shared'
import { WeeklyTimetableCard } from '@/components/kip/portal/timetable-grid'
import { DialogBody, Field, FieldGrid, SubmitButton } from '@/components/kip/admin/form-bits'
import type {
  AdminCourse,
  AdminLecturer,
  AdminTimetableEntry,
} from '@/components/kip/admin/types'
import type { CourseDetail } from '@/components/kip/lib/types'
import type { Campus } from '@/components/kip/lib/types'

const NO_SELECTION = '__none__'

export function TimetableView() {
  const [courseFilter, setCourseFilter] = useState(NO_SELECTION)
  const [campusFilter, setCampusFilter] = useState(NO_SELECTION)
  const [addOpen, setAddOpen] = useState(false)
  const [deleting, setDeleting] = useState<AdminTimetableEntry | null>(null)

  const params = useMemo(() => {
    const sp = new URLSearchParams()
    if (courseFilter !== NO_SELECTION) sp.set('courseId', courseFilter)
    if (campusFilter !== NO_SELECTION) sp.set('campusId', campusFilter)
    return sp.toString()
  }, [courseFilter, campusFilter])

  const entries = useQuery<AdminTimetableEntry[]>({
    queryKey: ['admin-timetable', params],
    queryFn: () => api<AdminTimetableEntry[]>(`/api/admin/timetable?${params}`),
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

  return (
    <div className="space-y-6">
      <ViewHeading
        title="Timetable"
        description="Build the weekly class schedule across courses, campuses and lecturers."
        actions={
          <Button className="min-h-11" onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Add Entry
          </Button>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-4">
          <Select
            value={courseFilter}
            onValueChange={(v) => setCourseFilter(v === NO_SELECTION ? NO_SELECTION : v)}
          >
            <SelectTrigger className="h-11 w-full sm:w-52" aria-label="Filter by course">
              <SelectValue placeholder="All courses" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value={NO_SELECTION}>All courses</SelectItem>
              {(courses.data ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={campusFilter} onValueChange={setCampusFilter}>
            <SelectTrigger className="h-11 w-full sm:w-52" aria-label="Filter by campus">
              <SelectValue placeholder="All campuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_SELECTION}>All campuses</SelectItem>
              {(campuses.data ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <QueryBoundary
        status={entries.status}
        error={entries.error}
        onRetry={() => void entries.refetch()}
        skeleton={<TableSkeleton rows={6} />}
      >
        {entries.data && (
          <>
            {entries.data.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No timetable entries"
                hint="Add entries to schedule classes — students and lecturers see them instantly."
                className="py-16"
                action={
                  <Button className="min-h-11" onClick={() => setAddOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                    Add Entry
                  </Button>
                }
              />
            ) : (
              <>
                {/* Visual weekly grid (shared with the portals) */}
                <WeeklyTimetableCard entries={entries.data} />

                {/* Manageable list */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="font-display text-base">
                      All entries ({entries.data.length})
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Delete an entry to remove it from every affected timetable.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                      {/* Desktop table */}
                      <div className="hidden overflow-x-auto md:block">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-brand-200/70 bg-brand-50/70 hover:bg-brand-50/70 dark:border-white/10 dark:bg-brand-100 dark:hover:bg-brand-100">
                              <TableHead className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-500">Day</TableHead>
                              <TableHead className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-500">Time</TableHead>
                              <TableHead className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-500">Unit</TableHead>
                              <TableHead className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-500">Course</TableHead>
                              <TableHead className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-500">Room</TableHead>
                              <TableHead className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-500">Lecturer</TableHead>
                              <TableHead className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-500">Campus</TableHead>
                              <TableHead className="text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-500">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {entries.data.map((e) => (
                              <TableRow key={e.id} className="odd:bg-muted/40 hover:bg-brand-50/60 dark:hover:bg-brand-100/30">
                                <TableCell className="text-sm font-medium">
                                  <span className="inline-flex rounded-md bg-brand-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#f2efe6]">
                                    {WEEKDAYS[e.dayOfWeek - 1] ?? '—'}
                                  </span>
                                </TableCell>
                                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                  {fmtTimeSlot(e.startTime)}–{fmtTimeSlot(e.endTime)}
                                </TableCell>
                                <TableCell>
                                  <p className="max-w-44 truncate text-sm">
                                    {e.unitName ?? 'General session'}
                                  </p>
                                  <p className="font-mono text-[10px] text-primary">
                                    {e.unitCode ?? '—'}
                                  </p>
                                </TableCell>
                                <TableCell className="max-w-40 truncate text-xs text-muted-foreground">
                                  {e.courseTitle}
                                </TableCell>
                                <TableCell className="text-sm">{e.room}</TableCell>
                                <TableCell className="max-w-36 truncate text-xs text-muted-foreground">
                                  {e.lecturerName ?? '—'}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {e.campusName ?? '—'}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="min-h-11 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => setDeleting(e)}
                                    aria-label="Delete entry"
                                  >
                                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                                    <span className="sr-only">Delete entry</span>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {/* Mobile stacked — sapphire class blocks */}
                      <ul className="space-y-3 md:hidden">
                        {entries.data.map((e) => (
                          <li
                            key={e.id}
                            className="rounded-xl border border-l-4 border-l-brand-600 bg-brand-50/50 p-4 dark:bg-brand-100/30"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <span className="inline-flex rounded-md bg-brand-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#f2efe6]">
                                  {WEEKDAYS[e.dayOfWeek - 1] ?? '—'}
                                </span>
                                <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" aria-hidden="true" />
                                  {fmtTimeSlot(e.startTime)}–{fmtTimeSlot(e.endTime)}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="min-h-11 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setDeleting(e)}
                                aria-label="Delete entry"
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </div>
                            <p className="mt-2 truncate text-sm font-medium">
                              {e.unitName ?? 'General session'}
                              <span className="ml-2 font-mono text-[10px] text-primary">
                                {e.unitCode ?? ''}
                              </span>
                            </p>
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {e.courseTitle}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3" aria-hidden="true" />
                                {e.room}
                              </span>
                              {e.lecturerName && (
                                <span className="inline-flex items-center gap-1">
                                  <UserRound className="h-3 w-3" aria-hidden="true" />
                                  {e.lecturerName}
                                </span>
                              )}
                              <span>{e.campusName ?? '—'}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </QueryBoundary>

      <AddEntryDialog key={`add-entry-${addOpen}`} open={addOpen} onOpenChange={setAddOpen} />

      {deleting && <DeleteEntryDialog entry={deleting} onClose={() => setDeleting(null)} />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Add entry dialog
// ---------------------------------------------------------------------------

function AddEntryDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [courseId, setCourseId] = useState('')
  const [unitId, setUnitId] = useState(NO_SELECTION)
  const [day, setDay] = useState('1')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('10:00')
  const [room, setRoom] = useState('')
  const [campusId, setCampusId] = useState(NO_SELECTION)
  const [lecturerId, setLecturerId] = useState(NO_SELECTION)
  const [formError, setFormError] = useState<string | null>(null)

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
  const lecturers = useQuery<AdminLecturer[]>({
    queryKey: ['admin-lecturers'],
    queryFn: () => api<AdminLecturer[]>('/api/admin/lecturers'),
    staleTime: 60_000,
  })
  const courseDetail = useQuery<CourseDetail>({
    queryKey: ['admin-course', courseId],
    queryFn: () => api<CourseDetail>(`/api/public/courses/${courseId}`),
    enabled: courseId !== '',
    retry: false,
  })

  // reset the unit whenever the course changes (event-driven)
  const handleCourseChange = (v: string) => {
    setCourseId(v)
    setUnitId(NO_SELECTION)
  }

  const create = useMutation({
    mutationFn: () =>
      post<AdminTimetableEntry>('/api/admin/timetable', {
        courseId,
        unitId: unitId === NO_SELECTION ? undefined : unitId,
        dayOfWeek: Number(day),
        startTime,
        endTime,
        room: room.trim(),
        campusId: campusId === NO_SELECTION ? undefined : campusId,
        lecturerId: lecturerId === NO_SELECTION ? undefined : lecturerId,
      }),
    onSuccess: (entry) => {
      toast.success('Timetable entry added', {
        description: `${WEEKDAYS[entry.dayOfWeek - 1]} ${fmtTimeSlot(entry.startTime)}–${fmtTimeSlot(entry.endTime)} · ${entry.unitName ?? 'General session'} · ${entry.room}.`,
      })
      onOpenChange(false)
      void queryClient.invalidateQueries({ queryKey: ['admin-timetable'] })
    },
    onError: (err) => {
      setFormError(err instanceof Error ? err.message : 'Could not add the entry.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseId) {
      setFormError('Select a course.')
      return
    }
    if (!room.trim()) {
      setFormError('Room is required.')
      return
    }
    if (endTime <= startTime) {
      setFormError('End time must be after the start time.')
      return
    }
    setFormError(null)
    create.mutate()
  }

  const units = courseDetail.data?.units ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="gold-rule mb-2 w-8" aria-hidden="true" />
          <DialogTitle>Add timetable entry</DialogTitle>
          <DialogDescription>
            Schedule a class — it appears instantly on student and lecturer timetables.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <div className="space-y-4">
              <Field id="tt-course" label="Course" required>
                <Select value={courseId} onValueChange={handleCourseChange}>
                  <SelectTrigger id="tt-course" className="h-11 w-full">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {(courses.data ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field
                id="tt-unit"
                label="Unit"
                hint={courseId === '' ? 'Pick a course to load its units.' : 'Optional — blank for general sessions.'}
              >
                <Select
                  value={unitId}
                  onValueChange={setUnitId}
                  disabled={courseId === '' || units.length === 0}
                >
                  <SelectTrigger id="tt-unit" className="h-11 w-full">
                    <SelectValue
                      placeholder={units.length === 0 ? 'No units in course' : 'General session'}
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem value={NO_SELECTION}>General session</SelectItem>
                    {units.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.code} — {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field id="tt-day" label="Day" required>
                <Select value={day} onValueChange={setDay}>
                  <SelectTrigger id="tt-day" className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEKDAYS.map((d, i) => (
                      <SelectItem key={d} value={String(i + 1)}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <FieldGrid>
                <Field id="tt-start" label="Start time" required>
                  <Input
                    id="tt-start"
                    type="time"
                    className="h-11"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </Field>
                <Field id="tt-end" label="End time" required>
                  <Input
                    id="tt-end"
                    type="time"
                    className="h-11"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </Field>
              </FieldGrid>

              <Field id="tt-room" label="Room" required>
                <Input
                  id="tt-room"
                  className="h-11"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. Lab 2 / Room 12"
                  required
                />
              </Field>

              <FieldGrid>
                <Field id="tt-campus" label="Campus">
                  <Select value={campusId} onValueChange={setCampusId}>
                    <SelectTrigger id="tt-campus" className="h-11 w-full">
                      <SelectValue placeholder="Any campus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_SELECTION}>Any campus</SelectItem>
                      {(campuses.data ?? []).map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field id="tt-lecturer" label="Lecturer">
                  <Select value={lecturerId} onValueChange={setLecturerId}>
                    <SelectTrigger id="tt-lecturer" className="h-11 w-full">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_SELECTION}>Unassigned</SelectItem>
                      {(lecturers.data ?? []).map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            <SubmitButton pending={create.isPending}>Add entry</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Delete entry confirm
// ---------------------------------------------------------------------------

function DeleteEntryDialog({
  entry,
  onClose,
}: {
  entry: AdminTimetableEntry
  onClose: () => void
}) {
  const queryClient = useQueryClient()

  const remove = useMutation({
    mutationFn: () => del<{ deleted: boolean }>(`/api/admin/timetable/${entry.id}`),
    onSuccess: () => {
      toast.success('Entry deleted', {
        description: `${WEEKDAYS[entry.dayOfWeek - 1]} ${fmtTimeSlot(entry.startTime)} — ${entry.unitName ?? 'General session'} removed.`,
      })
      onClose()
      void queryClient.invalidateQueries({ queryKey: ['admin-timetable'] })
    },
    onError: (err) => {
      toast.error('Could not delete entry', {
        description: err instanceof Error ? err.message : undefined,
      })
      onClose()
    },
  })

  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {WEEKDAYS[entry.dayOfWeek - 1]} {fmtTimeSlot(entry.startTime)} class?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Removes “{entry.unitName ?? 'General session'}” ({entry.unitCode ?? '—'}) from the{' '}
            {entry.courseTitle} timetable.
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
            {remove.isPending ? 'Deleting…' : 'Delete entry'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
