'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Award, BookOpenCheck, Printer, ScrollText, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { api } from '@/components/kip/lib/api'
import { gradeColor } from '@/components/kip/lib/format'
import { usePrintDoc } from '@/components/kip/portal/print-doc'
import { TranscriptDoc } from '@/components/kip/portal/student/views/print-docs'
import { KpiGridSkeleton, RowsSkeleton, ViewHeading, GradeBadge, gradeForClient } from '@/components/kip/portal/shared'
import type {
  ResultEntryDTO,
  StudentProfileFull,
  StudentResults,
} from '@/components/kip/portal/types'
import { cn } from '@/lib/utils'

const GRADE_ORDER = ['A', 'B', 'C', 'D', 'E']

export function ResultsView() {
  const { data, status, error, refetch } = useQuery<StudentResults>({
    queryKey: ['student-results'],
    queryFn: () => api<StudentResults>('/api/student/results'),
  })

  // student identity for the official printable transcript (letterhead block)
  const profile = useQuery<StudentProfileFull>({
    queryKey: ['student-profile'],
    queryFn: () => api<StudentProfileFull>('/api/student/profile'),
    enabled: status === 'success',
  })

  const { print, printDoc } = usePrintDoc(() =>
    data && profile.data ? <TranscriptDoc profile={profile.data} results={data} /> : null,
  )

  return (
    <QueryBoundary
      status={status}
      error={error}
      onRetry={() => void refetch()}
      skeleton={
        <div className="space-y-6">
          <RowsSkeleton rows={1} />
          <KpiGridSkeleton count={4} />
          <RowsSkeleton rows={3} />
        </div>
      }
    >
      {data && <ResultsBody data={data} onPrint={print} printDoc={printDoc} />}
    </QueryBoundary>
  )
}

function bestGrade(entries: ResultEntryDTO[]): string | null {
  for (const g of GRADE_ORDER) {
    if (entries.some((e) => e.grade === g)) return g
  }
  return null
}

function ResultsBody({
  data,
  onPrint,
  printDoc,
}: {
  data: StudentResults
  onPrint: () => void
  printDoc: React.ReactNode
}) {
  const { byStage, overall } = data

  if (byStage.length === 0) {
    return (
      <div className="space-y-6">
        <ViewHeading title="Results" description="Your published examination results." />
        <EmptyState
          icon={ScrollText}
          title="No results published yet"
          hint="Once your lecturers release marks for completed units, they will appear here."
          className="py-16"
        />
      </div>
    )
  }

  const allEntries = byStage.flatMap((s) => s.entries)
  const best = bestGrade(allEntries)

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <ViewHeading
          title="Results"
          description="Published examination results per term, with GPA and averages."
          actions={
            <Button variant="outline" className="focus-glow min-h-11" onClick={onPrint}>
              <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
              Print academic transcript
            </Button>
          }
        />
      </motion.div>

      {/* Overall cards */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        aria-label="Overall performance"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {/* Mean grade hero + overall cards */}
        <Card className="bg-brand-band kip-pattern overflow-hidden border-brand-800/60 text-[#f2efe6]">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-300">Mean grade</p>
            <p className="font-display text-gold-gradient mt-1.5 text-4xl font-bold leading-none">
              {gradeForClient(overall.average).grade}
            </p>
            <p className="mt-2 text-xs font-medium text-[#f2efe6]/70">
              {gradeForClient(overall.average).remark} · GPA {overall.gpa.toFixed(2)} / 4.00 · avg{' '}
              {overall.average.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">Cumulative GPA</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600/10 text-brand-700 dark:text-brand-300">
                <TrendingUp className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="font-display mt-2 text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
              {overall.gpa.toFixed(2)}
              <span className="ml-1 text-sm font-semibold text-muted-foreground">/ 4.00</span>
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">Weighted across all units</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">Average mark</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-400/15 text-gold-700 dark:text-gold-400">
                <TrendingUp className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="font-display mt-2 text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
              {overall.average.toFixed(1)}%
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">Mean of unit marks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">Units completed</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600/10 text-brand-700 dark:text-brand-300">
                <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="font-display mt-2 text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">{overall.unitsDone}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">With published results</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">Best grade</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-400/15 text-gold-700 dark:text-gold-400">
                <Award className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            {best ? (
              <div className="mt-2 flex items-center gap-2">
                <GradeBadge grade={best} className="text-base" />
                <span className="text-sm font-semibold text-muted-foreground">
                  {allEntries.filter((e) => e.grade === best).length} unit(s) at this grade
                </span>
              </div>
            ) : (
              <p className="font-display mt-2 text-2xl font-bold">—</p>
            )}
            <p className="mt-1 text-xs font-medium text-muted-foreground">Highest achieved</p>
          </CardContent>
        </Card>
      </motion.section>

      {/* Per-stage tabs */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1 }}
        aria-label="Results by term"
      >
        <Tabs defaultValue={byStage[0]?.stageLabel}>
          <TabsList className="max-w-full overflow-x-auto custom-scrollbar">
            {byStage.map((s) => (
              <TabsTrigger
                key={s.stageLabel}
                value={s.stageLabel}
                className="min-h-9 text-xs data-[state=active]:bg-brand-700! data-[state=active]:text-[#f2efe6]! dark:data-[state=active]:bg-brand-700! dark:data-[state=active]:text-[#f2efe6]!"
              >
                {s.stageLabel}
              </TabsTrigger>
            ))}
          </TabsList>
          {byStage.map((s) => (
            <TabsContent key={s.stageLabel} value={s.stageLabel} className="mt-4">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-display text-base font-semibold">{s.stageLabel} results</h2>
                    <p className="text-xs text-muted-foreground">
                      {s.entries.length} unit{ s.entries.length === 1 ? '' : 's'} ·{' '}
                      {s.entries[0]?.examBody ?? 'KNEC'}
                    </p>
                  </div>

                  {/* Desktop table */}
                  <div className="hidden overflow-x-auto sm:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="bg-brand-50 text-[11px] uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-brand-100">
                            Code
                          </TableHead>
                          <TableHead className="bg-brand-50 text-[11px] uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-brand-100">
                            Unit
                          </TableHead>
                          <TableHead className="bg-brand-50 text-right text-[11px] uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-brand-100">
                            Marks
                          </TableHead>
                          <TableHead className="bg-brand-50 text-center text-[11px] uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-brand-100">
                            Grade
                          </TableHead>
                          <TableHead className="bg-brand-50 text-[11px] uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-brand-100">
                            Remark
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {s.entries.map((e) => (
                          <TableRow key={e.id} className="odd:bg-muted/40 transition-colors hover:bg-brand-50/60 dark:hover:bg-brand-100/15">
                            <TableCell className="font-mono text-xs font-semibold text-brand-700 dark:text-gold-400">
                              {e.unitCode}
                            </TableCell>
                            <TableCell className="text-sm font-medium">{e.unitName}</TableCell>
                            <TableCell className="text-right text-sm font-semibold tabular-nums">
                              {e.marks.toFixed(0)}
                              <span className="text-muted-foreground">/100</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <GradeBadge grade={e.grade} />
                            </TableCell>
                            <TableCell className={cn('font-display italic', gradeColor(e.grade))}>
                              {e.remark ?? '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile stacked cards */}
                  <ul className="space-y-3 sm:hidden">
                    {s.entries.map((e) => (
                      <li key={e.id} className="rounded-xl border p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-mono text-[11px] font-semibold text-brand-700 dark:text-gold-400">{e.unitCode}</p>
                            <p className="mt-0.5 text-sm font-semibold leading-snug">{e.unitName}</p>
                          </div>
                          <GradeBadge grade={e.grade} className="shrink-0 text-base" />
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <Badge variant="outline" className="text-[10px] font-medium">
                            {e.term}
                          </Badge>
                          <p className="text-sm">
                            <span className={gradeColor(e.grade)}>{e.marks.toFixed(0)}/100</span>
                            <span className={cn('ml-2 font-display text-xs font-medium italic', gradeColor(e.grade))}>
                              {e.remark ?? '—'}
                            </span>
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <p className="font-display mt-4 text-xs italic text-muted-foreground">
                    Results are official once published by the examination office. For remarks or
                    corrections, contact the registrar within 14 days.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </motion.section>

      {printDoc}
    </div>
  )
}
