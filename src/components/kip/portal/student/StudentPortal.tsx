'use client'

import { useEffect } from 'react'
import {
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  IdCard,
  KeyRound,
  LayoutDashboard,
  Receipt,
  ShieldAlert,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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

/** Mobile bottom tab bar (<lg): the five everyday destinations. */
const STUDENT_BOTTOM_NAV: PortalNavItem[] = [
  { key: 'dashboard', label: 'Home', icon: LayoutDashboard, to: '/portal' },
  { key: 'fees', label: 'Fees', icon: Receipt, to: '/portal/fees' },
  { key: 'results', label: 'Results', icon: Award, to: '/portal/results' },
  { key: 'learning', label: 'Learning', icon: BookOpen, to: '/portal/learning' },
  { key: 'profile', label: 'Profile', icon: UserRound, to: '/portal/profile' },
]

/**
 * Fixed bottom tab bar for phones — visible below lg only, sapphire active
 * state, 44px+ touch targets and safe-area padding for home-indicator
 * devices. `print:hidden` (plus the global print-isolation CSS that hides
 * everything except the print portal) keeps it off printed statements.
 */
function StudentBottomNav({ sub }: { sub: string }) {
  return (
    <nav
      aria-label="Student portal sections"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 lg:hidden print:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {STUDENT_BOTTOM_NAV.map((item) => {
          const active = item.key === sub
          const Icon = item.icon
          return (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => navigate(item.to)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex min-h-[3.25rem] w-full flex-col items-center justify-center gap-1 px-1 py-1.5 text-[10px] font-medium transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-primary"
                  />
                )}
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** Light-on-dark chip tones for the sapphire sidebar identity panel. */
function statusTone(status: string): string {
  if (status === 'ACTIVE') return 'border-emerald-400/30 bg-emerald-400/15 text-emerald-300'
  if (status === 'GRADUATED') return 'border-gold-400/30 bg-gold-400/15 text-gold-300'
  return 'border-red-400/30 bg-red-400/10 text-red-300'
}

/**
 * SECURITY GATE — an account still using its issued temporary password is
 * locked out of everything except the change-password form. The flag is set
 * when an accepted application provisions the account and clears only via
 * POST /api/auth/password (which also logs the session out).
 */
function MustChangePasswordGate() {
  return (
    <section
      aria-labelledby="must-change-password"
      className="mx-auto max-w-lg pt-8 sm:pt-12"
    >
      <div className="rounded-2xl border border-gold-400/40 bg-gold-400/10 p-6 text-center sm:p-8">
        <ShieldAlert
          className="mx-auto h-10 w-10 text-gold-600 dark:text-gold-400"
          aria-hidden="true"
        />
        <h2 id="must-change-password" className="mt-3 text-lg font-bold">
          Set your own password to continue
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Your account is still using the temporary password the admissions office issued. For the
          security of your fees and results, replace it now — every other section unlocks
          immediately after.
        </p>
        <Button
          type="button"
          className="btn-gold mt-5 h-11 min-w-44 font-bold"
          onClick={() => navigate('/portal/profile')}
        >
          <KeyRound className="mr-2 h-4 w-4" aria-hidden="true" />
          Change password
        </Button>
      </div>
    </section>
  )
}

/** Sidebar identity card for the signed-in student — light-on-dark sapphire panel. */
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
  const mustChange = guard.state === 'ok' && guard.user.mustChangePassword

  // unknown sub-route → normalise to the dashboard
  useEffect(() => {
    if (!SUB_VIEWS.has(sub)) navigate('/portal')
  }, [sub])

  // temporary-password gate: park the student on the profile view until the
  // password is replaced (sub-views render the gate card meanwhile)
  useEffect(() => {
    if (mustChange && sub !== 'profile') navigate('/portal/profile')
  }, [mustChange, sub])

  if (guard.state === 'loading') return <PortalFullSkeleton />
  if (guard.state === 'anonymous') return null
  if (guard.state === 'wrong') return <WrongPortalCard role={guard.user.role} />

  const activeSub = SUB_VIEWS.has(sub) ? sub : 'dashboard'

  return (
    <>
      <PortalShell
        nav={STUDENT_NAV}
        sub={activeSub}
        portalLabel="Student Portal"
        identity={<StudentIdentity user={guard.user} />}
      >
        {mustChange && activeSub !== 'profile' ? (
          <MustChangePasswordGate />
        ) : (
          <>
            {activeSub === 'dashboard' && <DashboardView />}
            {activeSub === 'learning' && <LearningView />}
            {activeSub === 'fees' && <FeesView />}
            {activeSub === 'results' && <ResultsView />}
            {activeSub === 'timetable' && <TimetableView />}
            {activeSub === 'announcements' && <AnnouncementsView />}
            {activeSub === 'id-card' && <IdCardView />}
            {activeSub === 'profile' && <ProfileView />}
          </>
        )}
      </PortalShell>
      {/* bottom spacer so the fixed tab bar never covers the last row of
          content on small screens (nav height + safe area) */}
      <div aria-hidden="true" className="h-20 lg:hidden print:hidden" />
      <StudentBottomNav sub={activeSub} />
    </>
  )
}
