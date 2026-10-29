'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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
  PublishResultsResponse,
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
              <CardTitle className="flex items-center gap-2 font-display text-base">
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
                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-4 text-left transition-colors hover:border-gold-400/50 hover:bg-gold-400/10 focus-visible:border-ring"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{c.unitName}</p>
                          <div className="mt-1.5">
                            <span className="inline-flex items-center rounded-md bg-brand-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-brand-800 dark:bg-brand-100 dark:text-[#f2efe6]">
                              {c.unitCode}
                            </span>
                          </div>
                          <p className="mt-1.5 truncate text-xs text-muted-foreground">
                            {c.courseTitle} · {c.stageLabel} · {c.studentsCount} student
                            {c.studentsCount === 1 ? '' : 's'}
                          </p>
                        </div>
                        <Badge
                          className="shrink-0 border border-gold-400/40 bg-gold-400/15 text-[10px] font-semibold text-gold-700 hover:bg-gold-400/15 dark:text-gold-300"
                        >
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
  // marks under edit + the saved baseline they diverge from (a cell is dirty
  // when its text differs from the baseline — blank vs saved counts as a change)
  const [marks, setMarks] = useState<Record<string, string>>(initialMarks)
  const [baseline, setBaseline] = useState<Record<string, string>>(initialMarks)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState<SavedResultsResponse | null>(null)

  // spreadsheet focus management: one marks input per student row, desktop
  // table + mobile stack each keep their own ref (focus follows the visible one)
  const desktopInputs = useRef<(HTMLInputElement | null)[]>([])
  const mobileInputs = useRef<(HTMLInputElement | null)[]>([])

  // students whose existing result is still an unpublished draft for this sheet
  const draftCount = data.students.filter((s) => s.result && !s.result.published).length

  const save = useMutation({
    mutationFn: (args: {
      entries: { studentId: string; marks: number }[]
      publish: boolean
      /** marks snapshot at save time — rebaselines the sheet on success */
      snapshot: Record<string, string>
    }) =>
      post<SavedResultsResponse>('/api/lecturer/results', {
        unitId,
        term,
        entries: args.entries,
        publish: args.publish,
      }),
    onSuccess: (res, vars) => {
      setSaved(res)
      // the just-saved marks become the new clean baseline, so the dirty
      // count drops to zero and the unsaved-changes guard disengages
      setBaseline({ ...vars.snapshot })
      const n = res.saved.length
      if (res.published) {
        toast.success('Results published', {
          description: `${n} result${n === 1 ? '' : 's'} published for ${res.unit.code} — ${term}. Students can now see them.`,
        })
      } else {
        toast.success('Draft saved', {
          description: `${n} mark${n === 1 ? '' : 's'} saved as draft for ${res.unit.code} — ${term}. Publish when ready.`,
        })
      }
      void queryClient.invalidateQueries({ queryKey: ['lecturer-class', unitId] })
      void queryClient.invalidateQueries({ queryKey: ['lecturer-overview'] })
    },
    onError: (err) => {
      setSaveError(err instanceof Error ? err.message : 'Could not save results — try again.')
    },
  })

  const publishDrafts = useMutation({
    mutationFn: () => post<PublishResultsResponse>('/api/lecturer/results', { action: 'publish', unitId, term }),
    onSuccess: (res) => {
      toast.success('Drafts published', {
        description: `${res.publishedCount} draft result${res.publishedCount === 1 ? '' : 's'} for ${res.unit.code} are now visible to students.`,
      })
      setSaved(null)
      void queryClient.invalidateQueries({ queryKey: ['lecturer-class', unitId] })
      void queryClient.invalidateQueries({ queryKey: ['lecturer-overview'] })
    },
    onError: (err) => {
      setSaveError(err instanceof Error ? err.message : 'Could not publish drafts — try again.')
    },
  })

  const rows = useMemo(() => {
    return data.students.map((s) => {
      const raw = marks[s.id] ?? ''
      const num = raw === '' ? null : Number(raw)
      const invalid = num !== null && (Number.isNaN(num) || num < 0 || num > 100)
      const preview = num !== null && !invalid ? gradeForClient(num) : null
      const dirty = (baseline[s.id] ?? '') !== raw.trim()
      return { student: s, raw, num, invalid, preview, dirty }
    })
  }, [data, marks, baseline])

  // changed cells — drives the emerald indicator, the guard and the Save count
  const dirtyCount = rows.filter((r) => r.dirty).length

  // unsaved-changes guard: warn before the tab closes or another route loads.
  // hashchange covers unit switches / sidebar navigation (hash router); when
  // declined we restore this sheet's hash, which cancels the route change.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyCount === 0) return
      e.preventDefault()
      e.returnValue = ''
    }
    const onHashChange = () => {
      if (dirtyCount === 0) return
      if (window.location.hash.includes(`/lecturer/results/${unitId}`)) return
      const leave = window.confirm(
        `You have ${dirtyCount} unsaved mark${dirtyCount === 1 ? '' : 's'} for this unit. Leave without saving?`,
      )
      if (!leave) window.location.hash = `#/lecturer/results/${unitId}`
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    window.addEventListener('hashchange', onHashChange)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [unitId, dirtyCount])

  /** Focus the marks input of the student `index` rows away (Enter / ↓ / ↑). */
  const focusRow = (index: number) => {
    if (index < 0 || index >= rows.length) return
    const desktop = desktopInputs.current[index]
    const mobile = mobileInputs.current[index]
    const target = desktop && desktop.offsetParent !== null ? desktop : mobile
    target?.focus()
    target?.select()
  }

  const handleMarksKey = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault()
      focusRow(index + 1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      focusRow(index - 1)
    }
  }

  /** Clamp a typed mark into 0–100 when its cell is left; unparsable text stays flagged. */
  const clampOnBlur = (studentId: string) => {
    setMarks((m) => {
      const raw = (m[studentId] ?? '').trim()
      if (raw === '') return m
      const num = Number(raw)
      if (Number.isNaN(num)) return m
      const clamped = Math.min(100, Math.max(0, num))
      return clamped === num ? m : { ...m, [studentId]: String(clamped) }
    })
  }

  const collectEntries = (): { studentId: string; marks: number }[] | null => {
    const entries: { studentId: string; marks: number }[] = []
    for (const r of rows) {
      if (r.raw.trim() === '') continue
      if (r.invalid) {
        setSaveError(`Fix the invalid mark for ${r.student.name} (0–100).`)
        return null
      }
      if (r.num !== null) entries.push({ studentId: r.student.id, marks: r.num })
    }
    if (entries.length === 0) {
      setSaveError('Enter at least one mark before saving.')
      return null
    }
    setSaveError(null)
    return entries
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
                <Card
                  className={
                    saved.published
                      ? 'border-green-600/30 bg-green-500/5'
                      : 'border-gold-500/40 bg-gold-400/10'
                  }
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                          saved.published
                            ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                            : 'bg-gold-400/15 text-gold-700 dark:text-gold-300',
                        )}
                      >
                        <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="font-display text-base font-semibold">
                          {saved.published ? 'Published' : 'Draft saved'} — {saved.saved.length} result
                          {saved.saved.length === 1 ? '' : 's'} for {term}
                        </h2>
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {saved.saved.map((r) => (
                            <li
                              key={r.id}
                              className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs"
                            >
                              <span className="font-medium">{r.studentName}</span>
                              <span className="tabular-nums text-muted-foreground">
                                {r.marks.toFixed(0)}
                              </span>
                              <GradeBadge grade={r.grade} className="text-[10px]" />
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {saved.published
                            ? 'Students can now see these marks in their portal. Grades follow the KIP scale (A ≥ 80, B 65–79, C 50–64, D 40–49, E < 40).'
                            : 'These marks are hidden from students until you publish them (button below the sheet).'}
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
                    <CardTitle id="entry-sheet" className="flex flex-wrap items-center gap-2 font-display text-base">
                      <ClipboardEdit className="h-4 w-4 text-primary" aria-hidden="true" />
                      Marks entry
                      <Badge variant="secondary" className="text-[10px]">
                        {data.students.length} student{data.students.length === 1 ? '' : 's'}
                      </Badge>
                      {dirtyCount > 0 && (
                        <span
                          role="status"
                          className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-[10px] font-semibold text-success"
                        >
                          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                          </span>
                          {dirtyCount} unsaved change{dirtyCount === 1 ? '' : 's'}
                        </span>
                      )}
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
                        variant="outline"
                        onClick={() => {
                          const entries = collectEntries()
                          if (entries) save.mutate({ entries, publish: false, snapshot: marks })
                        }}
                        disabled={save.isPending}
                        className="min-h-11"
                      >
                        <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                        {dirtyCount > 0 ? `Save draft · ${dirtyCount}` : 'Save draft'}
                      </Button>
                      <Button
                        onClick={() => {
                          const entries = collectEntries()
                          if (entries) save.mutate({ entries, publish: true, snapshot: marks })
                        }}
                        disabled={save.isPending}
                        className="btn-gold min-h-11"
                      >
                        {save.isPending ? (
                          <>
                            <span
                              className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-brand-950/40 border-t-brand-950"
                              aria-hidden="true"
                            />
                            Saving…
                          </>
                        ) : (
                          <>
                            <BadgeCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                            Save &amp; publish
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Desktop table — sticky header + sticky student column */}
                    <div className="hidden max-h-[70vh] overflow-auto md:block">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="sticky left-0 top-0 z-20 min-w-52 bg-brand-50 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-[#f2efe6]">
                              Student
                            </TableHead>
                            <TableHead className="sticky top-0 z-20 min-w-28 bg-brand-50 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-[#f2efe6]">
                              Admission No
                            </TableHead>
                            <TableHead className="sticky top-0 z-20 min-w-24 bg-brand-50 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-[#f2efe6]">
                              Existing
                            </TableHead>
                            <TableHead className="sticky top-0 z-20 min-w-36 bg-brand-50 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-[#f2efe6]">
                              Marks (0–100)
                            </TableHead>
                            <TableHead className="sticky top-0 z-20 min-w-24 bg-brand-50 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-[#f2efe6]">
                              Grade
                            </TableHead>
                            <TableHead className="sticky top-0 z-20 min-w-28 bg-brand-50 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-[#f2efe6]">
                              Remark
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rows.map((r, i) => (
                            <TableRow key={r.student.id} className="odd:bg-muted">
                              <TableCell
                                className={cn(
                                  'sticky left-0 z-10',
                                  i % 2 === 1 ? 'bg-muted' : 'bg-card',
                                )}
                              >
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
                                  <Badge
                                    variant="outline"
                                    className="gap-1.5 border-brand-600/30 bg-brand-50 text-[10px] font-semibold text-brand-800 dark:bg-brand-100 dark:text-[#f2efe6]"
                                  >
                                    <BadgeCheck
                                      className="h-3 w-3 text-primary"
                                      aria-hidden="true"
                                    />
                                    {r.student.result.marks.toFixed(0)} · {r.student.result.grade}
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <Input
                                  ref={(el) => {
                                    desktopInputs.current[i] = el
                                  }}
                                  type="number"
                                  min={0}
                                  max={100}
                                  inputMode="numeric"
                                  value={r.raw}
                                  onChange={(e) => {
                                    setMarks((m) => ({ ...m, [r.student.id]: e.target.value }))
                                    setSaveError(null)
                                  }}
                                  onBlur={() => clampOnBlur(r.student.id)}
                                  onKeyDown={(e) => handleMarksKey(e, i)}
                                  aria-label={`Marks for ${r.student.name}`}
                                  aria-invalid={r.invalid}
                                  className={cn(
                                    // borderless-in-cell spreadsheet feel
                                    'mx-auto h-10 w-24 rounded-md border-0 bg-transparent text-center font-semibold tabular-nums shadow-none focus-visible:ring-2 focus-visible:ring-primary/40',
                                    r.dirty && 'bg-emerald-500/15',
                                    r.invalid &&
                                      'border border-destructive bg-destructive/5 focus-visible:ring-destructive/30',
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
                      {rows.map((r, i) => (
                        <li
                          key={r.student.id}
                          className={cn(
                            'rounded-xl border border-border/70 bg-card p-4',
                            r.dirty && 'border-success/30',
                          )}
                        >
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
                              ref={(el) => {
                                mobileInputs.current[i] = el
                              }}
                              type="number"
                              min={0}
                              max={100}
                              inputMode="numeric"
                              value={r.raw}
                              onChange={(e) => {
                                setMarks((m) => ({ ...m, [r.student.id]: e.target.value }))
                                setSaveError(null)
                              }}
                              onBlur={() => clampOnBlur(r.student.id)}
                              onKeyDown={(e) => handleMarksKey(e, i)}
                              aria-label={`Marks for ${r.student.name}`}
                              aria-invalid={r.invalid}
                              className={cn(
                                'h-11 w-24 rounded-md border-0 bg-transparent text-center font-semibold tabular-nums shadow-none focus-visible:ring-2 focus-visible:ring-primary/40',
                                r.dirty && 'bg-emerald-500/15',
                                r.invalid &&
                                  'border border-destructive bg-destructive/5 focus-visible:ring-destructive/30',
                              )}
                            />
                            {r.student.result && (
                              <Badge
                                variant="outline"
                                className="ml-auto border-brand-600/30 bg-brand-50 text-[10px] font-semibold text-brand-800 dark:bg-brand-100 dark:text-[#f2efe6]"
                              >
                                Was {r.student.result.marks.toFixed(0)} ·{' '}
                                {r.student.result.grade}
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
                      Leave a row blank to skip that student. Press <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">Enter</kbd> or{' '}
                      <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">↑</kbd>
                      <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">↓</kbd> to
                      move between students — marks snap into 0–100 when you leave a cell.{' '}
                      <strong>Save draft</strong> keeps marks hidden from students;{' '}
                      <strong>Save &amp; publish</strong> makes them visible immediately (auto-graded
                      on the KIP scale: A ≥ 80, B 65–79, C 50–64, D 40–49, E &lt; 40).
                    </p>
                    {draftCount > 0 && (
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold-500/40 bg-gold-400/10 p-4">
                        <p className="text-sm font-medium text-gold-700 dark:text-gold-300">
                          {draftCount} draft result{draftCount === 1 ? '' : 's'} for this unit are not
                          yet visible to students.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => publishDrafts.mutate()}
                          disabled={publishDrafts.isPending}
                          className="btn-gold min-h-9"
                        >
                          {publishDrafts.isPending ? 'Publishing…' : 'Publish drafts'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.section>
            )}
    </>
  )
}
