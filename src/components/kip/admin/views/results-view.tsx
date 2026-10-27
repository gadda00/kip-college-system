'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Award, BadgeCheck, ClipboardEdit, Save, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { api, post } from '@/components/kip/lib/api'
import {
  GradeBadge,
  TableSkeleton,
  ViewHeading,
  gradeForClient,
} from '@/components/kip/portal/shared'
import type {
  AdminCourse,
  AdminResultsWorksheet,
} from '@/components/kip/admin/types'
import type { CourseDetail } from '@/components/kip/lib/types'
import { cn } from '@/lib/utils'

const TERM_OPTIONS = ['2026/2027 T1', '2026/2027 T2', '2025/2026 T3', '2025/2026 T2', '2025/2026 T1']
const ALL_COURSES = '__all__'

export function ResultsView() {
  const [courseId, setCourseId] = useState('')
  const [unitId, setUnitId] = useState('')
  const [term, setTerm] = useState(TERM_OPTIONS[0]!)

  const courses = useQuery<AdminCourse[]>({
    queryKey: ['admin-courses'],
    queryFn: () => api<AdminCourse[]>('/api/admin/courses'),
    staleTime: 60_000,
  })

  // units of the selected course (public course detail includes units)
  const courseDetail = useQuery<CourseDetail>({
    queryKey: ['admin-course', courseId],
    queryFn: () => api<CourseDetail>(`/api/public/courses/${courseId}`),
    enabled: courseId !== '',
    retry: false,
  })

  // reset unit when course changes
  const onCourseChange = (v: string) => {
    setCourseId(v)
    setUnitId('')
  }

  const worksheet = useQuery<AdminResultsWorksheet>({
    queryKey: ['admin-results-worksheet', courseId, unitId],
    queryFn: () =>
      api<AdminResultsWorksheet>(
        `/api/admin/results?courseId=${courseId}&unitId=${unitId}&term=${encodeURIComponent(term)}`,
      ),
    enabled: courseId !== '' && unitId !== '',
    retry: false,
  })

  const units = courseDetail.data?.units ?? []

  return (
    <div className="space-y-6">
      <ViewHeading
        title="Results manager"
        description="Enter and publish examination marks per unit — grades are computed automatically."
      />

      {/* Cascading selectors */}
      <Card>
        <CardContent className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3 sm:p-6">
          <div className="space-y-2">
            <Label htmlFor="rm-course" className="text-sm font-medium">
              Course
            </Label>
            <Select value={courseId || ALL_COURSES} onValueChange={(v) => onCourseChange(v === ALL_COURSES ? '' : v)}>
              <SelectTrigger id="rm-course" className="h-11 w-full" aria-label="Select course">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value={ALL_COURSES}>Select a course…</SelectItem>
                {(courses.data ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rm-unit" className="text-sm font-medium">
              Unit
            </Label>
            <Select
              value={unitId}
              onValueChange={setUnitId}
              disabled={courseId === '' || units.length === 0}
            >
              <SelectTrigger id="rm-unit" className="h-11 w-full" aria-label="Select unit">
                <SelectValue
                  placeholder={courseId === '' ? 'Pick a course first' : 'Select a unit'}
                />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {units.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.code} — {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rm-term" className="text-sm font-medium">
              Term
            </Label>
            <Input
              id="rm-term"
              className="h-11"
              list="rm-term-options"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              aria-label="Examination term"
            />
            <datalist id="rm-term-options">
              {TERM_OPTIONS.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>
        </CardContent>
      </Card>

      {courseId === '' ? (
        <EmptyState
          icon={ClipboardEdit}
          title="Pick a course and unit"
          hint="Select a course, then a unit and term to load the class worksheet."
          className="py-16"
        />
      ) : unitId === '' ? (
        <EmptyState
          icon={Award}
          title="Select a unit"
          hint={`${units.length} unit${units.length === 1 ? '' : 's'} available for this course.`}
          className="py-16"
        />
      ) : (
        <QueryBoundary
          status={worksheet.status}
          error={worksheet.error}
          onRetry={() => void worksheet.refetch()}
          skeleton={<TableSkeleton rows={6} />}
        >
          {worksheet.data && (
            <Worksheet
              key={`${unitId}-${term}`}
              worksheet={worksheet.data}
              term={term}
            />
          )}
        </QueryBoundary>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Marks worksheet
// ---------------------------------------------------------------------------

function Worksheet({
  worksheet,
  term,
}: {
  worksheet: AdminResultsWorksheet
  term: string
}) {
  const queryClient = useQueryClient()
  const [marks, setMarks] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const s of worksheet.students) {
      if (s.result) initial[s.studentId] = String(Math.round(s.result.marks))
    }
    return initial
  })
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedCount, setSavedCount] = useState<number | null>(null)

  const save = useMutation({
    mutationFn: (entries: { studentId: string; marks: number }[]) =>
      post<{ unit: { code: string }; saved: unknown[] }>('/api/admin/results', {
        unitId: worksheet.unit?.id,
        term,
        entries,
      }),
    onSuccess: (res) => {
      setSavedCount(res.saved.length)
      toast.success('Results published', {
        description: `${res.saved.length} result${res.saved.length === 1 ? '' : 's'} saved for ${res.unit.code} — ${term}.`,
      })
      void queryClient.invalidateQueries({ queryKey: ['admin-results-worksheet'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-students'] })
    },
    onError: (err) => {
      setSaveError(err instanceof Error ? err.message : 'Could not save results — try again.')
    },
  })

  const rows = useMemo(() => {
    return worksheet.students.map((s) => {
      const raw = marks[s.studentId] ?? ''
      const num = raw === '' ? null : Number(raw)
      const invalid = num !== null && (Number.isNaN(num) || num < 0 || num > 100)
      const preview = num !== null && !invalid ? gradeForClient(num) : null
      return { student: s, raw, num, invalid, preview }
    })
  }, [worksheet, marks])

  const handleSave = () => {
    const entries: { studentId: string; marks: number }[] = []
    for (const r of rows) {
      if (r.raw.trim() === '') continue
      if (r.invalid) {
        setSaveError(`Fix the invalid mark for ${r.student.name} (0–100).`)
        return
      }
      if (r.num !== null) entries.push({ studentId: r.student.studentId, marks: r.num })
    }
    if (entries.length === 0) {
      setSaveError('Enter at least one mark before saving.')
      return
    }
    setSaveError(null)
    save.mutate(entries)
  }

  if (worksheet.students.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No active students in this course"
        hint="Results can only be entered for courses with active students."
        className="py-16"
      />
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
            <ClipboardEdit className="h-4 w-4 text-primary" aria-hidden="true" />
            {worksheet.unit?.name}
            <Badge variant="outline" className="font-mono text-[10px]">
              {worksheet.unit?.code}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {worksheet.unit?.stageLabel}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {worksheet.students.length} student{worksheet.students.length === 1 ? '' : 's'}
            </Badge>
          </CardTitle>
          <Button onClick={handleSave} disabled={save.isPending} className="min-h-11">
            {save.isPending ? (
              <>
                <span
                  className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground"
                  aria-hidden="true"
                />
                Publishing…
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                Save &amp; publish
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {savedCount !== null && (
            <div
              role="status"
              className="mb-4 flex items-center gap-3 rounded-xl border border-green-600/30 bg-green-500/5 p-4"
            >
              <BadgeCheck className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" aria-hidden="true" />
              <p className="text-sm">
                <span className="font-semibold">
                  Published — {savedCount} result{savedCount === 1 ? '' : 's'} for {term}.
                </span>{' '}
                <span className="text-muted-foreground">
                  Students see the updated marks in their portals.
                </span>
              </p>
            </div>
          )}

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-52">Student</TableHead>
                  <TableHead className="min-w-28">Admission No</TableHead>
                  <TableHead className="min-w-24 text-center">Existing</TableHead>
                  <TableHead className="min-w-36 text-center">Marks (0–100)</TableHead>
                  <TableHead className="min-w-24 text-center">Grade</TableHead>
                  <TableHead className="min-w-28">Remark</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.student.studentId}>
                    <TableCell>
                      <p className="text-sm font-semibold">{r.student.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Term {r.student.currentTerm}
                      </p>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {r.student.admissionNo}
                    </TableCell>
                    <TableCell className="text-center">
                      {r.student.result ? (
                        <Badge variant="outline" className="gap-1.5 text-[10px]">
                          <BadgeCheck className="h-3 w-3 text-primary" aria-hidden="true" />
                          {r.student.result.marks.toFixed(0)} · {r.student.result.grade}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        inputMode="numeric"
                        value={r.raw}
                        onChange={(e) => {
                          setMarks((m) => ({ ...m, [r.student.studentId]: e.target.value }))
                          setSaveError(null)
                        }}
                        aria-label={`Marks for ${r.student.name}`}
                        aria-invalid={r.invalid}
                        className={cn(
                          'mx-auto h-10 w-24 text-center font-semibold',
                          r.invalid && 'border-destructive',
                        )}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      {r.preview ? (
                        <GradeBadge grade={r.preview.grade} />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.preview?.remark ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile stacked rows */}
          <ul className="space-y-3 md:hidden">
            {rows.map((r) => (
              <li key={r.student.studentId} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{r.student.name}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {r.student.admissionNo}
                    </p>
                  </div>
                  {r.preview && <GradeBadge grade={r.preview.grade} className="shrink-0" />}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <Label
                    htmlFor={`rm-marks-${r.student.studentId}`}
                    className="shrink-0 text-xs text-muted-foreground"
                  >
                    Marks
                  </Label>
                  <Input
                    id={`rm-marks-${r.student.studentId}`}
                    type="number"
                    min={0}
                    max={100}
                    inputMode="numeric"
                    value={r.raw}
                    onChange={(e) => {
                      setMarks((m) => ({ ...m, [r.student.studentId]: e.target.value }))
                      setSaveError(null)
                    }}
                    aria-label={`Marks for ${r.student.name}`}
                    aria-invalid={r.invalid}
                    className={cn(
                      'h-10 w-24 text-center font-semibold',
                      r.invalid && 'border-destructive',
                    )}
                  />
                  {r.student.result && (
                    <Badge variant="outline" className="ml-auto text-[10px]">
                      Was {r.student.result.marks.toFixed(0)} · {r.student.result.grade}
                    </Badge>
                  )}
                </div>
                {r.preview && (
                  <p className="mt-2 text-xs text-muted-foreground">{r.preview.remark}</p>
                )}
              </li>
            ))}
          </ul>

          {saveError && (
            <p role="alert" className="mt-4 text-sm font-medium text-destructive">
              {saveError}
            </p>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Leave a row blank to skip that student. Saving publishes marks immediately (auto-graded
            on the KIP scale: A ≥ 80, B 65–79, C 50–64, D 40–49, E &lt; 40) and updates existing
            entries.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
