'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { Globe, LogOut, ShieldAlert, type LucideIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { KipLogo } from '@/components/kip/components/kip-logo'
import { navigate } from '@/components/kip/lib/router'
import { useAuthStore } from '@/components/kip/stores/auth-store'
import type { SafeUser } from '@/components/kip/lib/types'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

export type PortalGuardState =
  | { state: 'loading'; user: null }
  | { state: 'anonymous'; user: null }
  | { state: 'wrong'; user: SafeUser }
  | { state: 'ok'; user: SafeUser }

/**
 * Shared portal auth guard: waits for session hydration, redirects anonymous
 * visitors to /login and flags role mismatches ("wrong portal").
 */
export function usePortalGuard(
  role: 'ADMIN' | 'STUDENT' | 'LECTURER',
): PortalGuardState {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [loading, user])

  if (loading) return { state: 'loading', user: null }
  if (!user) return { state: 'anonymous', user: null }
  if (user.role !== role) return { state: 'wrong', user }
  return { state: 'ok', user }
}

/** Full-page skeleton shown while the session is being hydrated. */
export function PortalFullSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="hidden space-y-3 lg:block">
          <Skeleton className="h-28 w-full rounded-xl" />
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full" />
          ))}
        </div>
        <div className="space-y-6">
          <Skeleton className="h-9 w-72" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/** Friendly "wrong portal" card pointing the user to their own portal. */
export function WrongPortalCard({ role }: { role: 'ADMIN' | 'LECTURER' | 'STUDENT' }) {
  const target = role === 'ADMIN' ? '/admin' : role === 'LECTURER' ? '/lecturer' : '/portal'
  const label =
    role === 'ADMIN' ? 'Admin Dashboard' : role === 'LECTURER' ? 'Lecturer Portal' : 'Student Portal'
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400/15 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="h-6 w-6" aria-hidden="true" />
          </span>
          <Badge variant="secondary">Wrong portal</Badge>
          <h1 className="text-lg font-semibold">This area is for another account type</h1>
          <p className="text-sm text-muted-foreground">
            You are signed in with a <strong>{role.toLowerCase()}</strong> account. Head to your own
            area instead.
          </p>
          <Button onClick={() => navigate(target)} className="min-h-11 w-full">
            Continue to {label}
          </Button>
          <Button
            onClick={() => navigate('/login')}
            variant="ghost"
            className="min-h-11 w-full"
          >
            Use a different account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

export type PortalNavItem = {
  /** Sub-route key (matches the sub prop; base route uses 'dashboard'). */
  key: string
  label: string
  icon: LucideIcon
  to: string
}

function PortalNavList({
  nav,
  sub,
  tone = 'light',
}: {
  nav: PortalNavItem[]
  sub: string
  tone?: 'light' | 'dark'
}) {
  const dark = tone === 'dark'
  return (
    <nav aria-label="Portal sections" className="space-y-1">
      {nav.map((item) => {
        const active = item.key === sub
        const Icon = item.icon
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => navigate(item.to)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-h-11 w-full items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-left text-sm font-medium transition-colors',
              active
                ? dark
                  ? 'border-gold-400 bg-gold-400/15 text-gold-300'
                  : 'border-gold-500 bg-gold-400/15 text-gold-700 dark:text-gold-300'
                : dark
                  ? 'border-transparent text-[#f2efe6]/70 hover:bg-white/8 hover:text-white'
                  : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4 shrink-0',
                active ? (dark ? 'text-gold-400' : 'text-gold-600 dark:text-gold-400') : undefined,
              )}
              aria-hidden="true"
            />
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}

function PortalSidebarFooter({ onLogout, tone = 'light' }: { onLogout: () => void; tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark'
  return (
    <div className={cn('space-y-1 border-t pt-3', dark ? 'border-white/10' : undefined)}>
      <button
        type="button"
        onClick={() => navigate('/')}
        className={cn(
          'flex min-h-11 w-full items-center gap-3 border-l-2 border-transparent px-3 py-2.5 text-left text-sm font-medium transition-colors',
          dark
            ? 'text-[#f2efe6]/70 hover:bg-white/8 hover:text-white'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        <Globe className="h-4 w-4 shrink-0" aria-hidden="true" />
        Back to website
      </button>
      <button
        type="button"
        onClick={onLogout}
        className={cn(
          'flex min-h-11 w-full items-center gap-3 border-l-2 border-transparent px-3 py-2.5 text-left text-sm font-medium transition-colors',
          dark
            ? 'text-red-300/90 hover:bg-red-400/10 hover:text-red-200'
            : 'text-destructive/90 hover:bg-destructive/10 hover:text-destructive',
        )}
      >
        <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
        Logout
      </button>
    </div>
  )
}

/**
 * Portal layout: fixed-width sidebar on lg+, sticky mobile bar with a Sheet
 * drawer on smaller screens, and the sub-view content area.
 */
export function PortalShell({
  nav,
  sub,
  portalLabel,
  identity,
  children,
}: {
  nav: PortalNavItem[]
  sub: string
  portalLabel: string
  identity: ReactNode
  children: ReactNode
}) {
  const logout = useAuthStore((s) => s.logout)
  const [drawerOpen, setDrawerOpen] = useState(false)

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

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-8">
      <div className="gap-6 lg:flex lg:gap-8">
        {/* Desktop sidebar — deep emerald panel with gold accents */}
        <aside className="hidden w-64 shrink-0 lg:block print:hidden">
          <div className="bg-brand-band kip-pattern sticky top-28 space-y-5 rounded-xl border border-brand-800/60 p-4 text-[#f2efe6]">
            <KipLogo className="text-[#f2efe6]" />
            {identity}
            <PortalNavList nav={nav} sub={sub} tone="dark" />
            <PortalSidebarFooter onLogout={handleLogout} tone="dark" />
          </div>
        </aside>

        {/* Mobile sticky bar */}
        <div className="sticky top-16 z-30 -mx-4 mb-4 border-b bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden print:hidden">
          <div className="flex items-center justify-between gap-3">
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="min-h-11 min-w-11 gap-2">
                  <span className="sr-only">Open {portalLabel} menu</span>
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
                  <span className="text-sm font-semibold">{portalLabel}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 overflow-y-auto p-0">
                <div className="space-y-5 p-4">
                  <SheetTitle className="sr-only">{portalLabel} navigation</SheetTitle>
                  <KipLogo className="text-foreground" />
                  {identity}
                  <PortalNavList nav={nav} sub={sub} />
                  <PortalSidebarFooter onLogout={handleLogout} />
                </div>
              </SheetContent>
            </Sheet>
            <Badge variant="secondary" className="max-w-[45%] truncate">
              {nav.find((n) => n.key === sub)?.label ?? portalLabel}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-6">{children}</div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Small view pieces
// ---------------------------------------------------------------------------

/** Sub-view heading with optional actions (serif title keeps portals elegant). */
export function ViewHeading({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="gold-rule mb-2 w-8" aria-hidden="true" />
        <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/** KPI-card grid skeleton. */
export function KpiGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-xl" />
      ))}
    </div>
  )
}

/** Stacked rows skeleton for lists (announcements, materials, classes). */
export function RowsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  )
}

/** Table skeleton (statement, results, roster). */
export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full rounded-lg" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  )
}

/** "Name initials" for avatar circles. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
}

/** Letter-grade badge using the established grade colour scale. */
export function GradeBadge({ grade, className }: { grade: string; className?: string }) {
  const tone: Record<string, string> = {
    A: 'bg-green-600/15 text-green-700 dark:text-green-400',
    B: 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-400',
    C: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
    D: 'bg-orange-500/15 text-orange-700 dark:text-orange-400',
    E: 'bg-red-600/15 text-red-700 dark:text-red-400',
  }
  return (
    <Badge
      className={cn(
        'min-w-8 justify-center border-transparent font-bold',
        tone[grade] ?? 'bg-muted text-muted-foreground',
        className,
      )}
      aria-label={`Grade ${grade}`}
    >
      {grade}
    </Badge>
  )
}

/** KIP grading scale used across the portals (mirrors gradeFor()). */
export function gradeForClient(marks: number): { grade: string; remark: string } {
  if (marks >= 80) return { grade: 'A', remark: 'Excellent' }
  if (marks >= 65) return { grade: 'B', remark: 'Good' }
  if (marks >= 50) return { grade: 'C', remark: 'Credit' }
  if (marks >= 40) return { grade: 'D', remark: 'Pass' }
  return { grade: 'E', remark: 'Fail' }
}

// ---------------------------------------------------------------------------
// Timetable helpers
// ---------------------------------------------------------------------------

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const

/** ISO day-of-week for today (1 Mon … 5 Fri, 6 Sat, 7 Sun). */
export function todayDowClient(): number {
  const js = new Date().getDay()
  return js === 0 ? 7 : js
}

/** "08:00" → "8:00 AM" style display. */
export function fmtTimeSlot(time: string): string {
  const [hRaw, mRaw] = time.split(':')
  const h = Number(hRaw ?? 0)
  const m = mRaw ?? '00'
  const suffix = h < 12 ? 'AM' : 'PM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${m} ${suffix}`
}
