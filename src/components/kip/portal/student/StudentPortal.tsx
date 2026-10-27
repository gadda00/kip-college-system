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

function statusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' {
  if (status === 'ACTIVE') return 'default'
  if (status === 'GRADUATED') return 'secondary'
  return 'destructive'
}

/** Sidebar identity card for the signed-in student. */
function StudentIdentity({ user }: { user: SafeUser }) {
  const sp = user.studentProfile
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
              {sp?.admissionNo ?? '—'}
            </p>
          </div>
        </div>
        {sp && (
          <div className="mt-3 space-y-2">
            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
              {sp.course?.title ?? 'No course enrolled'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {sp.campus && (
                <Badge variant="outline" className="text-[10px] font-medium">
                  {sp.campus.name}
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px] font-medium">
                Year {sp.yearOfStudy} · Term {sp.currentTerm}
              </Badge>
              <Badge variant={statusBadgeVariant(sp.status)} className="text-[10px] font-medium">
                {sp.status === 'ACTIVE' ? 'Active' : sp.status}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
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
