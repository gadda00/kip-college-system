'use client'

import { Globe, LogOut, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { navigate } from '@/components/kip/lib/router'
import { useAuthStore } from '@/components/kip/stores/auth-store'
import { KipCrest } from '@/components/kip/components/kip-logo'
import { initialsOf } from '@/components/kip/portal/shared'

/** Per-portal chrome labels (matches the portal being rendered). */
const PORTAL_LABELS: Record<string, string> = {
  portal: 'Student Portal',
  lecturer: 'Lecturer Portal',
  admin: 'Admin Console',
}

/**
 * Dedicated top bar for the authenticated portals — deliberately NOT the
 * public marketing header: no site navigation, no Apply button, no utility
 * strip. A compact sapphire work bar with the crest, the portal name, the
 * signed-in user, a theme toggle and logout; "Back to website" exits to the
 * public site. Fixed height (h-16) so portal shells can anchor sticky
 * elements below it.
 */
export function PortalTopBar({ routePath }: { routePath: string }) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { resolvedTheme, setTheme } = useTheme()

  const label = PORTAL_LABELS[routePath] ?? 'Portal'

  const handleLogout = async () => {
    await logout()
    toast.success('Signed out', { description: 'You have been logged out securely.' })
    navigate('/login')
  }

  return (
    <header className="bg-brand-band sticky top-0 z-40 border-b border-white/10 text-[#f2efe6] print:hidden">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* crest + portal identity */}
        <div className="flex min-w-0 items-center gap-3">
          <KipCrest className="h-9 w-9 shrink-0" />
          <span className="hidden h-6 w-px bg-white/15 sm:block" aria-hidden="true" />
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold leading-tight sm:text-base">
              {label}
            </p>
            <p className="mt-0.5 hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-300/90 sm:block">
              KIP College
            </p>
          </div>
        </div>

        {/* user chip + actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {user && (
            <span className="flex min-w-0 items-center gap-2 rounded-full border border-white/15 bg-white/5 py-1 pl-1 pr-3">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-400 text-[10px] font-bold text-brand-950"
              >
                {initialsOf(user.name)}
              </span>
              <span className="hidden max-w-36 truncate text-xs font-semibold sm:block">
                {user.name}
              </span>
            </span>
          )}

          <button
            type="button"
            aria-label="Back to the public website"
            title="Back to website"
            onClick={() => navigate('/')}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#f2efe6]/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300"
          >
            <Globe className="h-4.5 w-4.5" aria-hidden="true" />
          </button>

          <button
            type="button"
            aria-label="Toggle light or dark theme"
            title="Toggle theme"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#f2efe6]/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300"
          >
            <Sun className="hidden h-4.5 w-4.5 dark:block" aria-hidden="true" />
            <Moon className="block h-4.5 w-4.5 dark:hidden" aria-hidden="true" />
          </button>

          <button
            type="button"
            aria-label="Sign out"
            title="Sign out"
            onClick={() => void handleLogout()}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-red-300/90 transition-colors hover:bg-red-400/15 hover:text-red-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300"
          >
            <LogOut className="h-4.5 w-4.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  )
}
