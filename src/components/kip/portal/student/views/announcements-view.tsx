'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Bell, BellRing, Star, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/kip/components/empty-state'
import { QueryBoundary } from '@/components/kip/components/loading'
import { api } from '@/components/kip/lib/api'
import { fmtDate } from '@/components/kip/lib/format'
import { RowsSkeleton, ViewHeading } from '@/components/kip/portal/shared'
import type { StudentAnnouncement } from '@/components/kip/portal/types'
import { cn } from '@/lib/utils'

export function AnnouncementsView() {
  const { data, status, error, refetch } = useQuery<StudentAnnouncement[]>({
    queryKey: ['student-announcements'],
    queryFn: () => api<StudentAnnouncement[]>('/api/student/announcements'),
  })

  return (
    <QueryBoundary
      status={status}
      error={error}
      onRetry={() => void refetch()}
      skeleton={<RowsSkeleton rows={4} />}
    >
      {data && <AnnouncementsBody announcements={data} />}
    </QueryBoundary>
  )
}

function audienceBadgeVariant(audience: string): 'default' | 'secondary' | 'outline' {
  if (audience === 'STUDENTS') return 'default'
  if (audience === 'STAFF') return 'outline'
  return 'secondary'
}

function AnnouncementsBody({ announcements }: { announcements: StudentAnnouncement[] }) {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <ViewHeading
          title="Announcements"
          description="Official notices from the registrar, finance and examination offices."
        />
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        aria-label="All announcements"
      >
        {announcements.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No announcements"
            hint="Official college notices will appear here."
            className="py-16"
          />
        ) : (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <BellRing className="h-4 w-4 text-gold-600 dark:text-gold-400" aria-hidden="true" />
                Notice board
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  {announcements.length} notice{announcements.length === 1 ? '' : 's'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="max-h-[32rem] space-y-3 overflow-y-auto custom-scrollbar pr-1">
                {announcements.map((a) => (
                  <li
                    key={a.id}
                    className={cn(
                      'rounded-xl border p-4 transition-colors hover:border-brand-600/30 hover:bg-brand-50/40 dark:hover:bg-brand-100/10',
                      a.pinned && 'border-gold-400/40 bg-gold-400/8',
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      {a.pinned && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-gold-500/30 bg-gold-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-gold-700 dark:text-gold-300">
                          <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                          Pinned
                        </span>
                      )}
                      <h3 className="text-sm font-semibold leading-snug">{a.title}</h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.body}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge variant={audienceBadgeVariant(a.audience)} className="gap-1 text-[10px]">
                        <Users className="h-3 w-3" aria-hidden="true" />
                        {a.audience === 'ALL' ? 'All students' : 'Students'}
                      </Badge>
                      <span className="inline-flex items-center rounded-md border border-gold-500/30 bg-gold-400/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-gold-700 dark:text-gold-300">
                        {fmtDate(a.createdAt)}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{a.authorName}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </motion.section>
    </div>
  )
}
