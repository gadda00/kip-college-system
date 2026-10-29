'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, RotateCcw, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { CourseCard } from '@/components/kip/components/course-card'
import { EmptyState } from '@/components/kip/components/empty-state'
import { KipLink } from '@/components/kip/components/link'
import { CourseCardsSkeleton, ErrorPanel } from '@/components/kip/components/loading'
import { fmtKES } from '@/components/kip/lib/format'
import { currentRoute } from '@/components/kip/lib/router'
import {
  CAMPUS_OPTIONS,
  KCSE_GRADES,
  STUDY_MODE_OPTIONS,
  finderMetaFor,
  isGradeEligible,
  type CampusKey,
  type StudyMode,
} from '@/components/kip/lib/finder-meta'
import type { PublicCourse } from '@/components/kip/lib/types'
import { cn } from '@/lib/utils'

/** Budget slider bounds (KES per term). */
const BUDGET_MIN = 4_000
const BUDGET_MAX = 30_000
const BUDGET_STEP = 500
const BUDGET_DEFAULT = BUDGET_MAX

/** Result cards rendered inline before the "see all" link. */
const MAX_INLINE_RESULTS = 6

type PathwayFilter = '' | 'TECHNICAL' | 'BUSINESS' | 'KASNEB'

type FinderFilters = {
  pathway: PathwayFilter
  grade: string
  budget: number
  mode: string
  campus: string
}

const DEFAULT_FILTERS: FinderFilters = {
  pathway: '',
  grade: '',
  budget: BUDGET_DEFAULT,
  mode: '',
  campus: '',
}

const PATHWAY_OPTIONS: { value: PathwayFilter; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'TECHNICAL', label: 'Technical' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'KASNEB', label: 'KASNEB' },
]

function sameFilters(a: FinderFilters, b: FinderFilters): boolean {
  return (
    a.pathway === b.pathway &&
    a.grade === b.grade &&
    a.budget === b.budget &&
    a.mode === b.mode &&
    a.campus === b.campus
  )
}

/** Parse recognised finder params out of a route query (unknown values ignored). */
function filtersFromQuery(query: Record<string, string>): Partial<FinderFilters> {
  const next: Partial<FinderFilters> = {}
  const pathway = (query.pathway ?? '').toUpperCase()
  if (pathway === 'TECHNICAL' || pathway === 'BUSINESS' || pathway === 'KASNEB') {
    next.pathway = pathway
  }
  if (query.grade && KCSE_GRADES.includes(query.grade)) next.grade = query.grade
  const budget = Number.parseInt(query.budget ?? '', 10)
  if (Number.isFinite(budget) && budget >= BUDGET_MIN && budget <= BUDGET_DEFAULT) {
    next.budget = budget
  }
  if (query.mode && STUDY_MODE_OPTIONS.includes(query.mode)) next.mode = query.mode
  if (query.campus && CAMPUS_OPTIONS.some((c) => c.value === query.campus)) {
    next.campus = query.campus
  }
  return next
}

/** Serialise filters back to a query string (default values omitted). */
function filtersToQuery(f: FinderFilters): string {
  const params = new URLSearchParams()
  if (f.pathway) params.set('pathway', f.pathway)
  if (f.grade) params.set('grade', f.grade)
  if (f.budget !== BUDGET_DEFAULT) params.set('budget', String(f.budget))
  if (f.mode) params.set('mode', f.mode)
  if (f.campus) params.set('campus', f.campus)
  return params.toString()
}

/**
 * Interactive course finder: pathway / KCSE grade / per-term budget /
 * class-time / campus controls filtering the course catalogue client-side.
 *
 * Filter state lives in the hash query so results are shareable
 * (`#/?grade=C-&budget=10000`). It is written with `history.replaceState`
 * — a quiet URL update that adds no history entry and fires no `hashchange`,
 * so tweaking a slider never yanks the reader back to the top of the page
 * (both `navigate()` and the app shell scroll to top on route change).
 */
export function CourseFinder({
  courses,
  coursesError,
  onRetry,
}: {
  /** Full public course catalogue (undefined while loading). */
  courses?: PublicCourse[]
  coursesError?: unknown
  onRetry?: () => void
}) {
  const [filters, setFilters] = useState<FinderFilters>(DEFAULT_FILTERS)

  // Adopt shared/refreshed filter state from the URL once, after mount
  // (reading location.hash during render would break hydration).
  useEffect(() => {
    const adopted = filtersFromQuery(currentRoute().query)
    if (Object.keys(adopted).length === 0) return
    // apply the shared filters right after paint…
    const applyTimer = window.setTimeout(
      () => setFilters((prev) => ({ ...prev, ...adopted })),
      0,
    )
    // …then deep-link to the results, after the app shell's own mount-scroll
    const scrollTimer = window.setTimeout(() => {
      document.getElementById('finder')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300)
    return () => {
      window.clearTimeout(applyTimer)
      window.clearTimeout(scrollTimer)
    }
  }, [])

  // Quiet URL sync — replaceState, no hashchange, no history spam.
  const skipFirstSync = useRef(true)
  useEffect(() => {
    if (skipFirstSync.current) {
      skipFirstSync.current = false
      return
    }
    const query = filtersToQuery(filters)
    window.history.replaceState(null, '', query ? `#/?${query}` : '#/')
  }, [filters])

  // Follow external hash edits (manual URL changes / links back home).
  useEffect(() => {
    const onHashChange = () => {
      const route = currentRoute()
      if (route.path !== '') return
      setFilters((prev) => {
        const next = { ...DEFAULT_FILTERS, ...filtersFromQuery(route.query) }
        return sameFilters(prev, next) ? prev : next
      })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const results = useMemo(() => {
    if (!courses) return []
    return courses.filter((course) => {
      if (filters.pathway && course.category !== filters.pathway) return false
      const meta = finderMetaFor(course.code, course.level)
      if (filters.grade && !isGradeEligible(filters.grade, meta.minGrade)) return false
      if (course.tuitionPerTerm > filters.budget) return false
      if (filters.mode) {
        const matchesMode =
          filters.mode === 'Mixed'
            ? meta.modes.length >= 2
            : meta.modes.includes(filters.mode as StudyMode)
        if (!matchesMode) return false
      }
      if (filters.campus && !meta.campuses.includes(filters.campus as CampusKey)) return false
      return true
    })
  }, [courses, filters])

  const hasActiveFilters =
    filters.pathway !== '' ||
    filters.grade !== '' ||
    filters.budget !== BUDGET_DEFAULT ||
    filters.mode !== '' ||
    filters.campus !== ''

  const clearFilters = () => setFilters(DEFAULT_FILTERS)

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 sm:p-6">
        {/* ── controls ─────────────────────────────────────────── */}
        <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Pathway
            </Label>
            <ToggleGroup
              type="single"
              variant="outline"
              value={filters.pathway || 'ALL'}
              onValueChange={(value) => {
                const picked = PATHWAY_OPTIONS.find((o) => o.value === value)?.value ?? ''
                setFilters((f) => ({ ...f, pathway: picked }))
              }}
              aria-label="Filter by pathway"
              className="mt-2.5 flex w-full"
            >
              {PATHWAY_OPTIONS.map((option) => (
                <ToggleGroupItem
                  key={option.label}
                  value={option.value || 'ALL'}
                  className="h-11 min-w-0 flex-1 px-1 text-xs font-medium sm:text-sm"
                >
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div>
            <Label htmlFor="finder-grade" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              My KCSE mean grade
            </Label>
            <Select
              value={filters.grade || 'any'}
              onValueChange={(value) =>
                setFilters((f) => ({ ...f, grade: value === 'any' ? '' : value }))
              }
            >
              <SelectTrigger id="finder-grade" className="mt-2.5 h-11 w-full">
                <SelectValue placeholder="Any grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any grade</SelectItem>
                {KCSE_GRADES.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="finder-campus" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Campus
            </Label>
            <Select
              value={filters.campus || 'any'}
              onValueChange={(value) =>
                setFilters((f) => ({ ...f, campus: value === 'any' ? '' : value }))
              }
            >
              <SelectTrigger id="finder-campus" className="mt-2.5 h-11 w-full">
                <SelectValue placeholder="Any campus" />
              </SelectTrigger>
              <SelectContent>
                {CAMPUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value || 'any'} value={option.value || 'any'}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Budget per term
              </span>
              <span className="tnum text-sm font-semibold" aria-live="polite">
                Up to {fmtKES(filters.budget)}
              </span>
            </div>
            <Slider
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={BUDGET_STEP}
              value={[filters.budget]}
              onValueChange={(value) =>
                setFilters((f) => ({ ...f, budget: value[0] ?? f.budget }))
              }
              aria-label="Maximum tuition budget per term, in Kenya shillings"
              className="mt-3.5"
            />
            <div className="tnum mt-1.5 flex justify-between text-xs text-muted-foreground">
              <span>{fmtKES(BUDGET_MIN)}</span>
              <span>{fmtKES(BUDGET_MAX)}</span>
            </div>
          </div>

          <div className="sm:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Class times
            </span>
            <div role="group" aria-label="Filter by class times" className="mt-2.5 flex flex-wrap gap-2">
              {STUDY_MODE_OPTIONS.map((mode) => {
                const active = filters.mode === mode
                return (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilters((f) => ({ ...f, mode: active ? '' : mode }))}
                    className={cn(
                      'inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors',
                      active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background hover:bg-muted',
                    )}
                  >
                    {mode}
                  </button>
                )
              })}
              <span className="self-center text-xs text-muted-foreground">
                Mixed = a blend of day &amp; evening classes
              </span>
            </div>
          </div>
        </div>

        {/* ── results ──────────────────────────────────────────── */}
        <div className="mt-8 border-t pt-6">
          {coursesError ? (
            <ErrorPanel error={coursesError} onRetry={onRetry} />
          ) : courses === undefined ? (
            <div aria-busy="true" aria-label="Loading matching programmes">
              <CourseCardsSkeleton count={3} />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p aria-live="polite" className="text-sm text-muted-foreground">
                  <span className="tnum font-semibold text-foreground">{results.length}</span> of{' '}
                  <span className="tnum">{courses.length}</span> programmes match
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="min-h-11 gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Clear filters
                  </Button>
                )}
              </div>

              {results.length > 0 ? (
                <>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {results.slice(0, MAX_INLINE_RESULTS).map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <KipLink
                      to={filters.pathway ? `/academics?category=${filters.pathway}` : '/academics'}
                      className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-primary/30 px-5 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      See all <span className="tnum">{results.length}</span> programmes
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </KipLink>
                    <p className="text-xs text-muted-foreground">
                      Entry grades are indicative — bridging routes exist (e.g. CAMS&nbsp;→&nbsp;CPA).
                    </p>
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={SearchX}
                  title="No programmes match those filters"
                  hint="Try a higher budget, choose “Any grade”, or clear the class-time and campus filters."
                  action={
                    <Button onClick={clearFilters} className="min-h-11">
                      <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                      Clear filters
                    </Button>
                  }
                  className="mt-4"
                />
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
