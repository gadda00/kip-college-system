'use client'

import { useEffect } from 'react'
import { CalendarDays, LayoutDashboard, Users } from 'lucide-react'
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

/**
 * Sidebar identity card for the signed-in lecturer — light-on-dark emerald
 * plate with a gold-ringed avatar, cream name and gold role chip (renders on
 * the dark desktop sidebar band and inside the mobile drawer alike).
 */
function LecturerIdentity({ user }: { user: SafeUser }) {
  const lp = user.lecturerProfile
  return (
    <div className="rounded-xl bg-brand-band kip-pattern p-4 ring-1 ring-inset ring-white/10">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-sm font-bold text-brand-950 ring-2 ring-gold-400/60"
        >
          {initialsOf(user.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#f2efe6]">{user.name}</p>
          <p className="truncate font-mono text-[11px] text-[#f2efe6]/50">{lp?.staffNo ?? '—'}</p>
        </div>
      </div>
      {lp && (
        <div className="mt-3 space-y-2">
          <span className="inline-flex max-w-full truncate rounded-full border border-gold-400/30 bg-gold-400/15 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-gold-300">
            {lp.title}
          </span>
          <p className="text-[11px] font-medium text-[#f2efe6]/60">{lp.department}</p>
          {lp.specialization && (
            <p className="line-clamp-2 text-[11px] leading-snug text-[#f2efe6]/50">
              {lp.specialization}
            </p>
          )}
        </div>
      )}
    </div>
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
