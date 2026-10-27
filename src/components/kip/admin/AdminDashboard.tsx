'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Award,
  BookOpen,
  CalendarDays,
  FileSpreadsheet,
  Globe,
  Inbox,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Newspaper,
  Receipt,
  Users,
  Mail,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { KipLogo } from '@/components/kip/components/kip-logo'
import {
  PortalFullSkeleton,
  WrongPortalCard,
  initialsOf,
  usePortalGuard,
} from '@/components/kip/portal/shared'
import { api } from '@/components/kip/lib/api'
import { navigate } from '@/components/kip/lib/router'
import { useAuthStore } from '@/components/kip/stores/auth-store'
import type { SafeUser } from '@/components/kip/lib/types'
import { cn } from '@/lib/utils'

import { OverviewView } from '@/components/kip/admin/views/overview-view'
import { StudentsView } from '@/components/kip/admin/views/students-view'
import { StudentDetailView } from '@/components/kip/admin/views/student-detail-view'
import { ApplicationsView } from '@/components/kip/admin/views/applications-view'
import { CoursesView } from '@/components/kip/admin/views/courses-view'
import { CourseUnitsView } from '@/components/kip/admin/views/course-units-view'
import { FeesView } from '@/components/kip/admin/views/fees-view'
import { ResultsView } from '@/components/kip/admin/views/results-view'
import { TimetableView } from '@/components/kip/admin/views/timetable-view'
import { AnnouncementsView } from '@/components/kip/admin/views/announcements-view'
import { NewsView } from '@/components/kip/admin/views/news-view'
import { MessagesView } from '@/components/kip/admin/views/messages-view'
import { ReportsView } from '@/components/kip/admin/views/reports-view'
import type {
  AdminMessage,
  AdminOverview,
} from '@/components/kip/admin/types'

type AdminNavItem = {
  key: string
  label: string
  icon: LucideIcon
  to: string
  badge?: 'pending-applications' | 'new-messages'
}

const ADMIN_NAV: AdminNavItem[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, to: '/admin' },
  { key: 'students', label: 'Students', icon: Users, to: '/admin/students' },
  {
    key: 'applications',
    label: 'Applications',
    icon: Inbox,
    to: '/admin/applications',
    badge: 'pending-applications',
  },
  { key: 'courses', label: 'Courses', icon: BookOpen, to: '/admin/courses' },
  { key: 'fees', label: 'Fees & Payments', icon: Receipt, to: '/admin/fees' },
  { key: 'results', label: 'Results', icon: Award, to: '/admin/results' },
  { key: 'timetable', label: 'Timetable', icon: CalendarDays, to: '/admin/timetable' },
  { key: 'announcements', label: 'Announcements', icon: Megaphone, to: '/admin/announcements' },
  { key: 'news', label: 'News & Events', icon: Newspaper, to: '/admin/news' },
  { key: 'messages', label: 'Messages', icon: Mail, to: '/admin/messages', badge: 'new-messages' },
  { key: 'reports', label: 'Reports & Exports', icon: FileSpreadsheet, to: '/admin/reports' },
]

const SUB_VIEWS = new Set([
  'overview',
  'students',
  'applications',
  'courses',
  'fees',
  'results',
  'timetable',
  'announcements',
  'news',
  'messages',
  'reports',
])

/** Deep navy sidebar surface (dark variant). */
const SIDEBAR_BG = 'bg-[#0b1f3f]'
const SIDEBAR_TEXT = 'text-white'

function AdminIdentity({ user }: { user: SafeUser }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-amber-950"
        >
          {initialsOf(user.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{user.name}</p>
          <p className="truncate text-[11px] text-white/60">Registrar &amp; System Administrator</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge className="border-transparent bg-amber-400 text-[10px] font-bold text-amber-950 hover:bg-amber-400">
          ADMIN
        </Badge>
        <Badge
          variant="outline"
          className="border-white/15 bg-transparent text-[10px] font-medium text-white/70"
        >
          {user.email}
        </Badge>
      </div>
    </div>
  )
}

function AdminSidebarFooter({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="space-y-1 border-t border-white/10 pt-3">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="flex min-h-11 w-full items-center gap-3 border-l-2 border-transparent px-3 py-2.5 text-left text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
      >
        <Globe className="h-4 w-4 shrink-0" aria-hidden="true" />
        View website
      </button>
      <button
        type="button"
        onClick={onLogout}
        className="flex min-h-11 w-full items-center gap-3 border-l-2 border-transparent px-3 py-2.5 text-left text-sm font-medium text-red-300 transition-colors hover:bg-red-400/10 hover:text-red-200"
      >
        <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
        Logout
      </button>
    </div>
  )
}

function AdminNavList({ sub }: { sub: string }) {
  // badge counts (shared query keys with the corresponding views)
  const { data: overview } = useQuery<AdminOverview>({
    queryKey: ['admin-overview'],
    queryFn: () => api<AdminOverview>('/api/admin/overview'),
    staleTime: 30_000,
  })
  const { data: messages } = useQuery<AdminMessage[]>({
    queryKey: ['admin-messages'],
    queryFn: () => api<AdminMessage[]>('/api/admin/messages'),
    staleTime: 30_000,
  })

  const badgeCount = (badge?: AdminNavItem['badge']): number | null => {
    if (badge === 'pending-applications') return overview?.applicationsPending ?? null
    if (badge === 'new-messages')
      return messages ? messages.filter((m) => m.status === 'NEW').length : null
    return null
  }

  return (
    <nav aria-label="Admin sections" className="space-y-1">
      {ADMIN_NAV.map((item) => {
        const active = item.key === sub
        const Icon = item.icon
        const count = badgeCount(item.badge)
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => navigate(item.to)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-h-11 w-full items-center gap-3 border-l-2 px-3 py-2.5 text-left text-sm font-medium transition-colors',
              active
                ? 'border-amber-400 bg-white/10 text-white'
                : 'border-transparent text-white/60 hover:bg-white/5 hover:text-white',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {count !== null && count > 0 && (
              <span
                className={cn(
                  'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold',
                  item.badge === 'new-messages'
                    ? 'bg-red-400/90 text-red-950'
                    : 'bg-amber-400 text-amber-950',
                )}
                aria-label={`${count} ${item.badge === 'new-messages' ? 'new' : 'pending'}`}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}

function AdminSidebarContent({
  user,
  sub,
  onLogout,
}: {
  user: SafeUser
  sub: string
  onLogout: () => void
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5 px-1">
        <KipLogo className="text-white" />
        <span className="sr-only">KIP College admin console</span>
      </div>
      <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-400/90">
        Admin Console
      </p>
      <AdminIdentity user={user} />
      <AdminNavList sub={sub} />
      <AdminSidebarFooter onLogout={onLogout} />
    </div>
  )
}

/**
 * Admin dashboard shell — role guard, dark navy sidebar (Sheet drawer on
 * mobile) and sub-view resolution for all #/admin/* routes.
 */
export function AdminDashboard({ sub, id }: { sub: string; id?: string }) {
  const guard = usePortalGuard('ADMIN')
  const logout = useAuthStore((s) => s.logout)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // unknown sub-route → normalise to overview
  useEffect(() => {
    if (!SUB_VIEWS.has(sub)) navigate('/admin')
  }, [sub])

  // close the mobile drawer after any hash navigation
  useEffect(() => {
    const close = () => setDrawerOpen(false)
    window.addEventListener('hashchange', close)
    return () => window.removeEventListener('hashchange', close)
  }, [])

  const handleLogout = async () => {
    await logout()
    toast.success('Signed out', { description: 'You have been logged out securely.' })
    navigate('/login')
  }

  if (guard.state === 'loading') return <PortalFullSkeleton />
  if (guard.state === 'anonymous') return null
  if (guard.state === 'wrong') return <WrongPortalCard role={guard.user.role} />

  const activeSub = SUB_VIEWS.has(sub) ? sub : 'overview'

  const content: ReactNode =
    activeSub === 'overview' ? (
      <OverviewView />
    ) : activeSub === 'students' ? (
      id ? (
        <StudentDetailView studentId={id} />
      ) : (
        <StudentsView />
      )
    ) : activeSub === 'applications' ? (
      <ApplicationsView />
    ) : activeSub === 'courses' ? (
      id ? (
        <CourseUnitsView courseId={id} />
      ) : (
        <CoursesView />
      )
    ) : activeSub === 'fees' ? (
      <FeesView />
    ) : activeSub === 'results' ? (
      <ResultsView />
    ) : activeSub === 'timetable' ? (
      <TimetableView />
    ) : activeSub === 'announcements' ? (
      <AnnouncementsView />
    ) : activeSub === 'news' ? (
      <NewsView />
    ) : activeSub === 'messages' ? (
      <MessagesView />
    ) : (
      <ReportsView />
    )

  const sectionLabel =
    ADMIN_NAV.find((n) => n.key === activeSub)?.label ?? 'Admin Console'

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-8">
      <div className="gap-6 lg:flex lg:gap-8">
        {/* Desktop sidebar — dark deep-navy variant */}
        <aside className="hidden w-64 shrink-0 lg:block print:hidden">
          <div
            className={cn(
              'sticky top-28 rounded-xl border border-primary/40 p-4',
              SIDEBAR_BG,
              SIDEBAR_TEXT,
            )}
          >
            <AdminSidebarContent user={guard.user} sub={activeSub} onLogout={handleLogout} />
          </div>
        </aside>

        {/* Mobile sticky bar */}
        <div className="sticky top-16 z-30 -mx-4 mb-4 border-b bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden print:hidden">
          <div className="flex items-center justify-between gap-3">
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="min-h-11 min-w-11 gap-2">
                  <span className="sr-only">Open admin menu</span>
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className="text-sm font-semibold">Admin Console</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className={cn('w-72 overflow-y-auto border-white/10 p-0', SIDEBAR_BG, SIDEBAR_TEXT)}
              >
                <div className="p-4">
                  <SheetTitle className="sr-only">Admin console navigation</SheetTitle>
                  <AdminSidebarContent
                    user={guard.user}
                    sub={activeSub}
                    onLogout={handleLogout}
                  />
                </div>
              </SheetContent>
            </Sheet>
            <Badge variant="secondary" className="max-w-[45%] truncate">
              {sectionLabel}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-6">{content}</div>
      </div>
    </div>
  )
}
