'use client'

import { useEffect } from 'react'
import { CalendarDays, GraduationCap, LayoutDashboard, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  PortalFullSkeleton,
  PortalShell,
  WrongPortalCard,
  initialsOf,
  usePortalGuard,
  type PortalNavItem,
} from '@/components/kip/portal/shared'
import { navigate } from '@/components/kip/lib/router'
import type { SafeUser } from '@/components/kip/lib/types'

import { DashboardView } from '@/components/kip/portal/lecturer/views/dashboard-view'
import { ClassesView } from '@/components/kip/portal/lecturer/views/classes-view'
import { ClassDetailView } from '@/components/kip/portal/lecturer/views/class-detail-view'
import { ResultsEntryView } from '@/components/kip/portal/lecturer/views/results-entry-view'
import { TimetableView } from '@/components/kip/portal/lecturer/views/timetable-view'

const LECTURER_NAV: PortalNavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/lecturer' },
  { key: 'classes', label: 'My Classes', icon: Users, to: '/lecturer/classes' },
  { key: 'timetable', label: 'Timetable', icon: CalendarDays, to: '/lecturer/timetable' },
]

const SUB_VIEWS = new Set([...LECTURER_NAV.map((n) => n.key), 'class', 'results'])

/** Sidebar identity card for the signed-in lecturer. */
function LecturerIdentity({ user }: { user: SafeUser }) {
  const lp = user.lecturerProfile
  return (
    <Card className="border-primary/15 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
          >
            {initialsOf(user.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              {lp?.staffNo ?? '—'}
            </p>
          </div>
        </div>
        {lp && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium">{lp.title}</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-[10px] font-medium">
                {lp.department}
              </Badge>
            </div>
            {lp.specialization && (
              <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                {lp.specialization}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Lecturer portal shell — owns the role guard, sidebar navigation and sub-view
 * resolution for all #/lecturer/* routes (class/:unitId and results/:unitId
 * carry the unit id as the second route param).
 */
export function LecturerPortal({ sub, unitId }: { sub: string; unitId: string }) {
  const guard = usePortalGuard('LECTURER')

  // unknown sub-route → normalise to the dashboard
  useEffect(() => {
    if (!SUB_VIEWS.has(sub)) navigate('/lecturer')
  }, [sub])

  if (guard.state === 'loading') return <PortalFullSkeleton />
  if (guard.state === 'anonymous') return null
  if (guard.state === 'wrong') return <WrongPortalCard role={guard.user.role} />

  const activeSub = SUB_VIEWS.has(sub) ? sub : 'dashboard'
  // class detail + results entry both live under "My Classes"
  const navHighlight = activeSub === 'class' || activeSub === 'results' ? 'classes' : activeSub

  return (
    <PortalShell
      nav={LECTURER_NAV}
      sub={navHighlight}
      portalLabel="Lecturer Portal"
      identity={<LecturerIdentity user={guard.user} />}
    >
      {activeSub === 'dashboard' && <DashboardView />}
      {activeSub === 'classes' && <ClassesView />}
      {activeSub === 'class' &&
        (unitId ? (
          <ClassDetailView unitId={unitId} />
        ) : (
          <ClassesView />
        ))}
      {activeSub === 'results' && <ResultsEntryView unitId={unitId} />}
      {activeSub === 'timetable' && <TimetableView />}
    </PortalShell>
  )
}
