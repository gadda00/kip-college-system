'use client'

import { useEffect } from 'react'
import {
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  IdCard,
  LayoutDashboard,
  Receipt,
  UserRound,
} from 'lucide-react'
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
import { cn } from '@/lib/utils'

import { DashboardView } from '@/components/kip/portal/student/views/dashboard-view'
import { LearningView } from '@/components/kip/portal/student/views/learning-view'
import { FeesView } from '@/components/kip/portal/student/views/fees-view'
import { ResultsView } from '@/components/kip/portal/student/views/results-view'
import { TimetableView } from '@/components/kip/portal/student/views/timetable-view'
import { AnnouncementsView } from '@/components/kip/portal/student/views/announcements-view'
import { ProfileView } from '@/components/kip/portal/student/views/profile-view'
import { IdCardView } from '@/components/kip/portal/student/views/id-card-view'

const STUDENT_NAV: PortalNavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/portal' },
  { key: 'learning', label: 'My Learning', icon: BookOpen, to: '/portal/learning' },
  { key: 'fees', label: 'Fees', icon: Receipt, to: '/portal/fees' },
  { key: 'results', label: 'Results', icon: Award, to: '/portal/results' },
  { key: 'timetable', label: 'Timetable', icon: CalendarDays, to: '/portal/timetable' },
  { key: 'announcements', label: 'Announcements', icon: Bell, to: '/portal/announcements' },
  { key: 'id-card', label: 'ID Card', icon: IdCard, to: '/portal/id-card' },
  { key: 'profile', label: 'Profile', icon: UserRound, to: '/portal/profile' },
]

const SUB_VIEWS = new Set(STUDENT_NAV.map((n) => n.key))

/** Light-on-dark chip tones for the emerald sidebar identity panel. */
function statusTone(status: string): string {
  if (status === 'ACTIVE') return 'border-emerald-400/30 bg-emerald-400/15 text-emerald-300'
  if (status === 'GRADUATED') return 'border-gold-400/30 bg-gold-400/15 text-gold-300'
  return 'border-red-400/30 bg-red-400/10 text-red-300'
}

/** Sidebar identity card for the signed-in student — light-on-dark emerald panel. */
function StudentIdentity({ user }: { user: SafeUser }) {
  const sp = user.studentProfile
  return (
    <div className="rounded-xl border border-white/10 bg-brand-950/50 p-3">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-[#f2efe6] ring-2 ring-gold-400/60"
        >
          {initialsOf(user.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#f2efe6]">{user.name}</p>
          <p className="mt-1 inline-flex max-w-full items-center truncate rounded-md border border-gold-400/30 bg-gold-400/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-gold-300">
            {sp?.admissionNo ?? '—'}
          </p>
        </div>
      </div>
      {sp && (
        <div className="mt-3 space-y-2">
          <p className="line-clamp-2 text-xs leading-snug text-[#f2efe6]/60">
            {sp.course?.title ?? 'No course enrolled'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sp.campus && (
              <span className="rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-[#f2efe6]/80">
                {sp.campus.name}
              </span>
            )}
            <span className="rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-[#f2efe6]/80">
              Year {sp.yearOfStudy} · Term {sp.currentTerm}
            </span>
            <span
              className={cn(
                'rounded-md border px-1.5 py-0.5 text-[10px] font-semibold',
                statusTone(sp.status),
              )}
            >
              {sp.status === 'ACTIVE' ? 'Active' : sp.status}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Student portal shell — owns the role guard, sidebar navigation and sub-view
 * resolution for all #/portal/* routes.
 */
export function StudentPortal({ sub }: { sub: string }) {
  const guard = usePortalGuard('STUDENT')

  // unknown sub-route → normalise to the dashboard
  useEffect(() => {
    if (!SUB_VIEWS.has(sub)) navigate('/portal')
  }, [sub])

  if (guard.state === 'loading') return <PortalFullSkeleton />
  if (guard.state === 'anonymous') return null
  if (guard.state === 'wrong') return <WrongPortalCard role={guard.user.role} />

  const activeSub = SUB_VIEWS.has(sub) ? sub : 'dashboard'

  return (
    <PortalShell
      nav={STUDENT_NAV}
      sub={activeSub}
      portalLabel="Student Portal"
      identity={<StudentIdentity user={guard.user} />}
    >
      {activeSub === 'dashboard' && <DashboardView />}
      {activeSub === 'learning' && <LearningView />}
      {activeSub === 'fees' && <FeesView />}
      {activeSub === 'results' && <ResultsView />}
      {activeSub === 'timetable' && <TimetableView />}
      {activeSub === 'announcements' && <AnnouncementsView />}
      {activeSub === 'id-card' && <IdCardView />}
      {activeSub === 'profile' && <ProfileView />}
    </PortalShell>
  )
}
