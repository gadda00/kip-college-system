'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  ClipboardEdit,
  Save,
  Users,
} from 'lucide-react'
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
import { navigate } from '@/components/kip/lib/router'
import {
  RowsSkeleton,
  TableSkeleton,
  ViewHeading,
  gradeForClient,
  GradeBadge,
} from '@/components/kip/portal/shared'
import type {
  LecturerClass,
  LecturerClassDetail,
  SavedResultsResponse,
} from '@/components/kip/portal/types'
import { cn } from '@/lib/utils'

/** Term labels offered on results entry (current-first, per registrar practice). */
const TERM_OPTIONS = ['2026/2027 T1', '2025/2026 T3', '2025/2026 T2', '2025/2026 T1']

export function ResultsEntryView({ unitId }: { unitId: string }) {
  if (!unitId) return <ResultsPicker />
  return <ResultsEntry unitId={unitId} />
}

// ---------------------------------------------------------------------------
// Unit picker (#/lecturer/results with no unit id)
// ---------------------------------------------------------------------------

function ResultsPicker() {
  const { data, status, error, refetch } = useQuery<LecturerClass[]>({
    queryKey: ['lecturer-classes'],
    queryFn: () => api<LecturerClass[]>('/api/lecturer/classes'),
  })

  return (
    <div className="space-y-6">
      <ViewHeading
        title="Enter results"
        description="Pick the unit you want to enter or update marks for."
      />
      <QueryBoundary
        status={status}
        error={error}
        onRetry={() => void refetch()}
        skeleton={<RowsSkeleton rows={4} />}
      >
        {data && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardEdit className="h-4 w-4 text-primary" aria-hidden="true" />
                Your units
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No units assigned yet"
                  hint="Units you teach will be listed here for results entry."
                  className="py-12"
                />
              ) : (
                <ul className="max-h-96 space-y-3 overflow-y-auto custom-scrollbar pr-1">
                  {data.map((c) => (
                    <li key={c.unitId}>
                      <button
                        type="button"
                        onClick={() => navigate(`/lecturer/results/${c.unitId}`)}
                        className="flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left transition-colors hover:border-primary/30 hover:bg-primary/5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{c.unitName}</p>
                          <p className="mt-0.5 font-mono text-[11px] text-primary">{c.unitCode}</p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {c.courseTitle} · {c.stageLabel} · {c.studentsCount} student
                            {c.studentsCount === 1 ? '' : 's'}
                          </p>
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-[10px]">
                          Enter →
                        </Badge>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
      </QueryBoundary>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Entry sheet (#/lecturer/results/:unitId)
// ---------------------------------------------------------------------------

function ResultsEntry({ unitId }: { unitId: string }) {
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
      skeleton={
        <div className="space-y-6">
          <TableSkeleton rows={1} />
          <TableSkeleton rows={6} />
        </div>
      }
    >
      {/* keyed by unit so marks state initialises fresh per unit */}
      {data && <EntrySheet key={unitId} unitId={unitId} data={data} />}
    </QueryBoundary>
  )
}

function EntrySheet({ unitId, data }: { unitId: string; data: LecturerClassDetail }) {
  const queryClient = useQueryClient()

  // initial marks: prefill from existing published results
  const initialMarks: Record<string, string> = {}
  for (const s of data.students) {
    if (s.result) initialMarks[s.id] = String(Math.round(s.result.marks))
  }
  const existingTerm = data.students.find((s) => s.result?.term)?.result?.term

  const [term, setTerm] = useState(
    existingTerm && TERM_OPTIONS.includes(existingTerm) ? existingTerm : TERM_OPTIONS[0]!,
  )
  const [marks, setMarks] = useState<Record<string, string>>(initialMarks)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState<SavedResultsResponse | null>(null)

  const save = useMutation({
    mutationFn: (entries: { studentId: string; marks: number }[]) =>
      post<SavedResultsResponse>('/api/lecturer/results', { unitId, term, entries }),
    onSuccess: (res) => {
      setSaved(res)
      toast.success('Results published', {
        description: `${res.saved.length} result${res.saved.length === 1 ? '' : 's'} saved for ${res.unit.code} — ${term}.`,
      })
      void queryClient.invalidateQueries({ queryKey: ['lecturer-class', unitId] })
      void queryClient.invalidateQueries({ queryKey: ['lecturer-overview'] })
    },
    onError: (err) => {
      setSaveError(err instanceof Error ? err.message : 'Could not save results — try again.')
    },
  })

  const rows = useMemo(() => {
    return data.students.map((s) => {
      const raw = marks[s.id] ?? ''
      const num = raw === '' ? null : Number(raw)
      const invalid = num !== null && (Number.isNaN(num) || num < 0 || num > 100)
      const preview = num !== null && !invalid ? gradeForClient(num) : null
      return { student: s, raw, num, invalid, preview }
    })
  }, [data, marks])

  const handleSave = () => {
    const entries: { studentId: string; marks: number }[] = []
    for (const r of rows) {
      if (r.raw.trim() === '') continue
      if (r.invalid) {
        setSaveError(`Fix the invalid mark for ${r.student.name} (0–100).`)
        return
      }
      if (r.num !== null) entries.push({ studentId: r.student.id, marks: r.num })
    }
    if (entries.length === 0) {
      setSaveError('Enter at least one mark before saving.')
      return
    }
    setSaveError(null)
    save.mutate(entries)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <ViewHeading
          title={`Results — ${data.unit.name}`}
          description={`${data.unit.code} · ${data.unit.course.title} · ${data.unit.stageLabel}`}
          actions={
            <Button
              variant="outline"
              className="min-h-11"
              onClick={() => navigate(`/lecturer/class/${unitId}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Class roster
            </Button>
          }
        />
      </motion.div>

            {saved && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                aria-live="polite"
              >
                <Card className="border-green-600/30 bg-green-500/5">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-base font-semibold">
                          Published — {saved.saved.length} result
                          {saved.saved.length === 1 ? '' : 's'} for {term}
                        </h2>
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {saved.saved.map((r) => (
                            <li
                              key={r.id}
                              className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs"
                            >
                              <span className="font-medium">{r.studentName}</span>
                              <span className="text-muted-foreground">{r.marks.toFixed(0)}</span>
                              <GradeBadge grade={r.grade} className="text-[10px]" />
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Students can now see these marks in their portal. Grades follow the KIP
                          scale (A ≥ 80, B 65–79, C 50–64, D 40–49, E &lt; 40).
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}

      {data.students.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No students enrolled at this stage"
                hint="You can only enter results when active students are at this term of the course."
                className="py-16"
              />
            ) : (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.05 }}
                aria-labelledby="entry-sheet"
              >
                <Card>
                  <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle id="entry-sheet" className="flex items-center gap-2 text-base">
                      <ClipboardEdit className="h-4 w-4 text-primary" aria-hidden="true" />
                      Marks entry
                      <Badge variant="secondary" className="text-[10px]">
                        {data.students.length} student{data.students.length === 1 ? '' : 's'}
                      </Badge>
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="term-select" className="whitespace-nowrap text-sm">
                          Term
                        </Label>
                        <Select value={term} onValueChange={setTerm}>
                          <SelectTrigger id="term-select" className="h-11 w-44" aria-label="Examination term">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TERM_OPTIONS.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={handleSave}
                        disabled={save.isPending}
                        className="min-h-11"
                      >
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
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Desktop table */}
                    <div className="hidden overflow-x-auto md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="sticky left-0 z-10 bg-card min-w-52">Student</TableHead>
                            <TableHead className="min-w-28">Admission No</TableHead>
                            <TableHead className="min-w-24 text-center">Existing</TableHead>
                            <TableHead className="min-w-36 text-center">Marks (0–100)</TableHead>
                            <TableHead className="min-w-24 text-center">Grade</TableHead>
                            <TableHead className="min-w-28">Remark</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rows.map((r) => (
                            <TableRow key={r.student.id}>
                              <TableCell className="sticky left-0 z-10 bg-card">
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
                                    setMarks((m) => ({ ...m, [r.student.id]: e.target.value }))
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
                        <li key={r.student.id} className="rounded-xl border p-4">
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
                              htmlFor={`marks-${r.student.id}`}
                              className="shrink-0 text-xs text-muted-foreground"
                            >
                              Marks
                            </Label>
                            <Input
                              id={`marks-${r.student.id}`}
                              type="number"
                              min={0}
                              max={100}
                              inputMode="numeric"
                              value={r.raw}
                              onChange={(e) => {
                                setMarks((m) => ({ ...m, [r.student.id]: e.target.value }))
                                setSaveError(null)
                              }}
                              aria-label={`Marks for ${r.student.name}`}
                              aria-invalid={r.invalid}
                              className={cn('h-10 w-24 text-center font-semibold', r.invalid && 'border-destructive')}
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
                      Leave a row blank to skip that student. Saving publishes marks immediately
                      (auto-graded on the KIP scale) and updates any existing entry.
                    </p>
                  </CardContent>
                </Card>
              </motion.section>
            )}
    </>
  )
}
