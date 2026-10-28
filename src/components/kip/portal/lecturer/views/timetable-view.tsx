'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { BookOpen, Building2, CalendarDays, Clock3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/kip/components/empty-state'
import { QueryBoundary } from '@/components/kip/components/loading'
import { api } from '@/components/kip/lib/api'
import { RowsSkeleton, ViewHeading } from '@/components/kip/portal/shared'
import { WeeklyTimetableCard } from '@/components/kip/portal/timetable-grid'
import type { TimetableEntryDTO } from '@/components/kip/portal/types'

/** "HH:MM" → minutes past midnight. */
const toMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

export function TimetableView() {
  const { data, status, error, refetch } = useQuery<TimetableEntryDTO[]>({
    queryKey: ['lecturer-timetable'],
    queryFn: () => api<TimetableEntryDTO[]>('/api/lecturer/timetable'),
  })

  return (
    <QueryBoundary
      status={status}
      error={error}
      onRetry={() => void refetch()}
      skeleton={<RowsSkeleton rows={4} />}
    >
      {data && <TimetableBody entries={data} />}
    </QueryBoundary>
  )
}

function TimetableBody({ entries }: { entries: TimetableEntryDTO[] }) {
  // presentation-only summary chips derived from the timetable payload
  const sessions = entries.length
  const weeklyHours = Math.round(
    entries.reduce((sum, e) => sum + (toMinutes(e.endTime) - toMinutes(e.startTime)) / 60, 0),
  )
  const units = new Set(entries.map((e) => e.unitId).filter(Boolean)).size
  const campuses = new Set(entries.map((e) => e.campusName).filter(Boolean)).size

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <ViewHeading
          title="Teaching Timetable"
          description="Your weekly teaching schedule across campuses, Monday to Friday."
        />
      </motion.div>

      {/* Summary toolbar chips */}
      {sessions > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.03 }}
          className="flex flex-wrap items-center gap-2"
          aria-label="Timetable summary"
        >
          <Badge
            variant="secondary"
            className="gap-1.5 py-1.5 pl-2 pr-3 text-xs font-medium tabular-nums"
          >
            <CalendarDays className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {sessions} session{sessions === 1 ? '' : 's'} weekly
          </Badge>
          <Badge
            variant="secondary"
            className="gap-1.5 py-1.5 pl-2 pr-3 text-xs font-medium tabular-nums"
          >
            <Clock3 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {weeklyHours}h contact time
          </Badge>
          <Badge
            variant="secondary"
            className="gap-1.5 py-1.5 pl-2 pr-3 text-xs font-medium tabular-nums"
          >
            <BookOpen className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {units} unit{units === 1 ? '' : 's'}
          </Badge>
          <Badge
            variant="secondary"
            className="gap-1.5 py-1.5 pl-2 pr-3 text-xs font-medium tabular-nums"
          >
            <Building2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {campuses} campus{campuses === 1 ? '' : 'es'}
          </Badge>
        </motion.div>
      )}

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        aria-label="Weekly teaching timetable"
      >
        {entries.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No teaching sessions scheduled"
            hint="Your timetable will appear here once sessions are assigned by the registrar."
            className="py-16"
          />
        ) : (
          <WeeklyTimetableCard entries={entries} />
        )}
      </motion.section>
    </div>
  )
}
