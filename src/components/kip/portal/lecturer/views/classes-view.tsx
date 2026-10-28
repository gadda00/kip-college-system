'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  ClipboardEdit,
  Clock3,
  GraduationCap,
  Search,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/kip/components/empty-state'
import { QueryBoundary } from '@/components/kip/components/loading'
import { api } from '@/components/kip/lib/api'
import { navigate } from '@/components/kip/lib/router'
import { RowsSkeleton, ViewHeading } from '@/components/kip/portal/shared'
import type { LecturerClass } from '@/components/kip/portal/types'

export function ClassesView() {
  const { data, status, error, refetch } = useQuery<LecturerClass[]>({
    queryKey: ['lecturer-classes'],
    queryFn: () => api<LecturerClass[]>('/api/lecturer/classes'),
  })

  return (
    <QueryBoundary
      status={status}
      error={error}
      onRetry={() => void refetch()}
      skeleton={<RowsSkeleton rows={4} />}
    >
      {data && <ClassesBody classes={data} />}
    </QueryBoundary>
  )
}

/** Case-insensitive match across unit name, code, course and stage. */
function classMatches(c: LecturerClass, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [c.unitName, c.unitCode, c.courseTitle, c.stageLabel].some((field) =>
    field.toLowerCase().includes(q),
  )
}

function ClassesBody({ classes }: { classes: LecturerClass[] }) {
  const [query, setQuery] = useState('')
  const filtered = classes.filter((c) => classMatches(c, query))

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <ViewHeading
          title="My Classes"
          description="Units you teach, grouped by course, with class lists and results entry."
        />
      </motion.div>

      {/* Filter / search toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.03 }}
        className="flex flex-wrap items-center gap-2"
      >
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search units, codes, courses…"
            aria-label="Search your units"
            className="h-11 pl-9"
          />
        </div>
        <Badge variant="secondary" className="gap-1.5 py-1.5 pl-2 pr-3 text-xs">
          <BookOpen className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          {filtered.length}/{classes.length} unit{classes.length === 1 ? '' : 's'}
        </Badge>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        aria-label="Units taught"
      >
        {classes.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No classes assigned yet"
            hint="Units will appear here once the registrar assigns your teaching timetable."
            className="py-16"
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No units match your search"
            hint={`Nothing matches “${query.trim()}” — try a unit code or course name.`}
            className="py-16"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filtered.map((c, i) => (
              <Card key={c.unitId} className="card-lift overflow-hidden">
                {/* Cover — rotated brand gradients with code + enrolment chip */}
                <div className={`cover-${i % 8} relative h-24`} aria-hidden="true">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-transparent" />
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
                    <p className="font-mono text-xs font-bold tracking-widest text-white drop-shadow-sm">
                      {c.unitCode}
                    </p>
                    <span className="rounded-full bg-black/35 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                      {c.stageLabel}
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 left-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                      <Users className="h-3 w-3" aria-hidden="true" />
                      {c.studentsCount} student{c.studentsCount === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="gold-rule absolute bottom-0 left-3 w-10" aria-hidden="true" />
                </div>

                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                  <div className="min-w-0">
                    <CardTitle className="font-display text-base leading-snug">
                      {c.unitName}
                    </CardTitle>
                    <div className="mt-2">
                      <span className="inline-flex items-center rounded-md bg-brand-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-brand-800 dark:bg-brand-100 dark:text-[#f2efe6]">
                        {c.unitCode}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="gap-1.5 text-[10px] font-medium">
                      <GraduationCap className="h-3 w-3 text-primary" aria-hidden="true" />
                      <span className="max-w-52 truncate">{c.courseTitle}</span>
                    </Badge>
                    <Badge variant="outline" className="gap-1.5 text-[10px] font-medium">
                      <Clock3 className="h-3 w-3 text-primary" aria-hidden="true" />
                      {c.weeklyHours}h/week
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      onClick={() => navigate(`/lecturer/class/${c.unitId}`)}
                      className="min-h-11 flex-1"
                    >
                      Open class
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      onClick={() => navigate(`/lecturer/results/${c.unitId}`)}
                      variant="outline"
                      className="min-h-11 flex-1"
                    >
                      <ClipboardEdit className="mr-2 h-4 w-4" aria-hidden="true" />
                      Enter results
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  )
}
