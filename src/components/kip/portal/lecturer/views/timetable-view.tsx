'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CalendarDays } from 'lucide-react'
import { EmptyState } from '@/components/kip/components/empty-state'
import { QueryBoundary } from '@/components/kip/components/loading'
import { api } from '@/components/kip/lib/api'
import { RowsSkeleton, ViewHeading } from '@/components/kip/portal/shared'
import { WeeklyTimetableCard } from '@/components/kip/portal/timetable-grid'
import type { TimetableEntryDTO } from '@/components/kip/portal/types'

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
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <ViewHeading
          title="Teaching Timetable"
          description="Your weekly teaching schedule across campuses, Monday to Friday."
        />
      </motion.div>

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
