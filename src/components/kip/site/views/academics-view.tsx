'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { BookOpen, CheckCircle2, Search, SearchX } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { CourseCard } from '@/components/kip/components/course-card'
import { EmptyState } from '@/components/kip/components/empty-state'
import { CourseCardsSkeleton, ErrorPanel } from '@/components/kip/components/loading'
import { PageHero } from '@/components/kip/components/page-hero'
import { api } from '@/components/kip/lib/api'
import { categoryMeta } from '@/components/kip/lib/format'
import type { PublicCourse } from '@/components/kip/lib/types'
import { navigate } from '@/components/kip/lib/router'

const CATEGORY_TABS = ['', 'TECHNICAL', 'BUSINESS', 'KASNEB'] as const
const TAB_LABELS: Record<(typeof CATEGORY_TABS)[number], string> = {
  '': 'All',
  TECHNICAL: 'Technical',
  BUSINESS: 'Business',
  KASNEB: 'KASNEB',
}

export function AcademicsView({ initialCategory = '' }: { initialCategory?: string }) {
  const validInitial = (CATEGORY_TABS as readonly string[]).includes(initialCategory)
    ? initialCategory
    : ''
  const [category, setCategory] = useState<string>(validInitial)
  const [search, setSearch] = useState('')

  const courses = useQuery({
    queryKey: ['public-courses', 'academics'],
    queryFn: () => api<PublicCourse[]>('/api/public/courses'),
  })

  const filtered = useMemo(() => {
    const list = courses.data ?? []
    const q = search.trim().toLowerCase()
    return list.filter((c) => {
      if (category && c.category !== category) return false
      if (!q) return true
      return (
        c.title.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      )
    })
  }, [courses.data, category, search])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { '': 0, TECHNICAL: 0, BUSINESS: 0, KASNEB: 0 }
    for (const c of courses.data ?? []) {
      counts[''] = (counts[''] ?? 0) + 1
      counts[c.category] = (counts[c.category] ?? 0) + 1
    }
    return counts
  }, [courses.data])

  return (
    <div>
      <PageHero
        eyebrow="Study with us"
        title="Academic Programmes"
        subtitle="Explore our full catalogue of diplomas, certificates, artisan and professional courses — filter by faculty or search by name."
        breadcrumb={[{ label: 'Academics' }]}
      />

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8" aria-label="Course catalogue">
        {/* category quick-cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(['TECHNICAL', 'BUSINESS', 'KASNEB'] as const).map((cat) => {
            const meta = categoryMeta(cat)
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(category === cat ? '' : cat)}
                aria-pressed={category === cat}
                className={`group flex min-h-11 items-center gap-4 rounded-xl border p-3 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                  category === cat
                    ? 'card-lift border-brand-600 bg-brand-50 shadow-sm dark:border-gold-400/60 dark:bg-brand-100/50'
                    : 'card-lift border-border bg-card hover:border-gold-500/50 hover:shadow-sm'
                }`}
              >
                <span className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
                  <img src={meta.image} alt="" aria-hidden="true" className="h-full w-full object-cover" loading="lazy" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{meta.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {courses.isPending ? '…' : `${categoryCounts[cat] ?? 0} courses`}
                  </span>
                </span>
                {category === cat && (
                  <CheckCircle2
                    className="h-5 w-5 shrink-0 text-gold-600 dark:text-gold-400"
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* filter bar */}
        <div className="sticky top-16 z-20 mt-8 flex flex-col gap-3 rounded-xl border border-brand-900/10 bg-background/95 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/85 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            value={category || 'all'}
            onValueChange={(v) => setCategory(v === 'all' ? '' : v)}
          >
            <TabsList aria-label="Filter courses by category" className="h-auto w-auto gap-2 bg-transparent p-0">
              {CATEGORY_TABS.map((tab) => (
                <TabsTrigger
                  key={tab || 'all'}
                  value={tab || 'all'}
                  className="h-11 min-h-11 flex-none rounded-full border border-stone-300 bg-card px-4 text-xs font-medium text-muted-foreground transition-colors hover:border-gold-500/60 hover:text-foreground data-[state=active]:border-brand-700 data-[state=active]:bg-brand-700 data-[state=active]:text-[#f2efe6] data-[state=active]:shadow-sm dark:border-stone-700 dark:text-stone-300 dark:data-[state=active]:border-brand-600 dark:data-[state=active]:bg-brand-600 dark:data-[state=active]:text-[#f2efe6] sm:text-sm"
                >
                  {TAB_LABELS[tab]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <label htmlFor="course-search" className="sr-only">
              Search courses
            </label>
            <Input
              id="course-search"
              type="search"
              placeholder="Search by course name or code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 min-w-0 pl-9"
            />
          </div>
        </div>

        {/* results */}
        <div className="mt-6" aria-live="polite">
          {courses.isPending ? (
            <CourseCardsSkeleton count={9} />
          ) : courses.isError ? (
            <ErrorPanel error={courses.error} onRetry={() => courses.refetch()} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No matching courses"
              hint={
                search
                  ? `No programmes match "${search}". Try a different keyword or clear your filters.`
                  : 'No courses in this category at the moment.'
              }
              action={
                <Button
                  variant="outline"
                  className="min-h-11 hover:border-gold-500/60"
                  onClick={() => {
                    setSearch('')
                    setCategory('')
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <>
              <p className="mb-5 text-sm text-muted-foreground" role="status">
                Showing <strong className="font-semibold text-foreground">{filtered.length}</strong>{' '}
                {filtered.length === 1 ? 'programme' : 'programmes'}
                {category && <> in {categoryMeta(category).label}</>}
                {search && <> matching &ldquo;{search}&rdquo;</>}
              </p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((course, i) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(i, 8) * 0.04 }}
                  >
                    <CourseCard course={course} />
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* helper strip */}
      {courses.isSuccess && (
        <section
          className="bg-brand-band kip-grain relative overflow-hidden text-[#f2efe6]"
          aria-label="More information"
        >
          <div aria-hidden="true" className="kip-pattern absolute inset-0" />
          <div
            aria-hidden="true"
            className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-gold-400/10 blur-3xl"
          />
          <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-16 text-center sm:px-6 lg:px-8">
            <div className="mb-1 flex items-center justify-center gap-3">
              <span className="gold-rule w-6" aria-hidden="true" />
              <p className="eyebrow text-gold-400">Not sure where to start?</p>
              <span className="gold-rule w-6" aria-hidden="true" />
            </div>
            <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
              We&rsquo;ll Help You Choose
            </h2>
            <p className="max-w-xl text-pretty text-sm leading-relaxed text-[#f2efe6]/75 sm:text-base">
              Talk to our admissions team or ask the KIP Assistant — we&rsquo;ll match your KCSE results,
              budget and career goals to the right programme.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => navigate('/admissions')}
                className="btn-gold min-h-11 border-0 text-brand-950 hover:bg-gold-400 hover:text-brand-950"
              >
                <BookOpen className="mr-2 h-4 w-4" aria-hidden="true" />
                View entry requirements
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/contact')}
                className="min-h-11 border-white/25 bg-white/5 text-[#f2efe6] hover:border-gold-400/60 hover:bg-white/10 hover:text-gold-300 dark:border-white/25 dark:bg-white/5 dark:text-[#f2efe6] dark:hover:border-gold-400/60 dark:hover:bg-white/10 dark:hover:text-gold-300"
              >
                Contact admissions
              </Button>
            </div>
          </div>
        </section>
      )}
      {courses.isPending && (
        <div className="border-t bg-muted/40">
          <Skeleton className="h-16 rounded-none" />
        </div>
      )}
    </div>
  )
}
