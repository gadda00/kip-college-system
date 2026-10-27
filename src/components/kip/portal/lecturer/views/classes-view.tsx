'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, ClipboardEdit, Clock3, GraduationCap, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

function ClassesBody({ classes }: { classes: LecturerClass[] }) {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <ViewHeading
          title="My Classes"
          description="Units you teach, grouped by course, with class lists and results entry."
        />
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
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {classes.map((c) => (
              <Card key={c.unitId} className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                  <div className="min-w-0">
                    <CardTitle className="flex items-center gap-2 text-base leading-snug">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <BookOpen className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">{c.unitName}</span>
                    </CardTitle>
                    <p className="mt-1.5 font-mono text-xs font-semibold text-primary">{c.unitCode}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {c.stageLabel}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="gap-1.5 text-[10px] font-medium">
                      <GraduationCap className="h-3 w-3 text-primary" aria-hidden="true" />
                      <span className="max-w-52 truncate">{c.courseTitle}</span>
                    </Badge>
                    <Badge variant="outline" className="gap-1.5 text-[10px] font-medium">
                      <Users className="h-3 w-3 text-primary" aria-hidden="true" />
                      {c.studentsCount} student{c.studentsCount === 1 ? '' : 's'}
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
