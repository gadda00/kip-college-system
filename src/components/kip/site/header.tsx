'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import {
  CalendarDays,
  ChevronDown,
  Image as ImageIcon,
  CircleHelp,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Moon,
  Newspaper,
  Phone,
  Sun,
  CalendarClock,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useHashRoute, navigate } from '@/components/kip/lib/router'
import { useAuthStore, portalHomeFor } from '@/components/kip/stores/auth-store'
import { KipLogo, KipLogoLight, KipCrest } from '@/components/kip/components/kip-logo'
import { cn } from '@/lib/utils'

const NAV_ITEMS: { label: string; to: string }[] = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Academics', to: '/academics' },
  { label: 'Campuses', to: '/campuses' },
  { label: 'Admissions', to: '/admissions' },
  { label: 'Downloads', to: '/downloads' },
]

/** Secondary links rendered in the mobile Sheet (with icons). */
const MOBILE_SECONDARY: { label: string; to: string; icon: typeof Newspaper }[] = [
  { label: 'News', to: '/news', icon: Newspaper },
  { label: 'Events', to: '/events', icon: CalendarClock },
  { label: 'Gallery', to: '/gallery', icon: ImageIcon },
  { label: 'FAQs', to: '/faq', icon: CircleHelp },
  { label: 'Contact', to: '/contact', icon: Mail },
]

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  const toggle = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  return (
    <button
      type="button"
      aria-label="Toggle light or dark theme"
      onClick={toggle}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#f2efe6]/85 transition-colors hover:bg-white/10 hover:text-gold-300"
    >
      {/* icons swap via the `dark` class next-themes sets on <html> — no JS state needed */}
      <Sun className="hidden h-4 w-4 dark:block" aria-hidden="true" />
      <Moon className="block h-4 w-4 dark:hidden" aria-hidden="true" />
    </button>
  )
}

function isActive(current: string, to: string): boolean {
  if (to === '/') return current === ''
  return current === to.replace(/^\//, '')
}

/** Desktop nav link: emerald text + short gold underline bar when active. */
function DesktopNavLink({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative whitespace-nowrap rounded-md px-3.5 py-2 text-[15px] font-medium tracking-wide transition-colors duration-200 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
      {active && (
        <span
          aria-hidden="true"
          className="absolute inset-x-3.5 -bottom-0.5 h-[3px] rounded-full bg-gold-500"
        />
      )}
    </button>
  )
}

export function Header() {
  const route = useHashRoute()
  const current = route.path
  const [mobileOpen, setMobileOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  // close the mobile drawer on any hash navigation (setState inside an
  // event callback, not directly in the effect body)
  useEffect(() => {
    const close = () => setMobileOpen(false)
    window.addEventListener('hashchange', close)
    return () => window.removeEventListener('hashchange', close)
  }, [])

  const newsActive = ['news', 'events', 'gallery'].includes(current)
  const faqActive = current === 'faq'

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch {
      // ignore — store already cleared
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      {/* top utility bar — deep emerald with fine gold accents */}
      <div className="hidden border-b border-gold-500/25 bg-brand-950 md:block">
        <div className="mx-auto flex h-11 max-w-7xl items-center justify-between gap-4 px-6 text-xs text-[#f2efe6]/80 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <span className="inline-flex items-center gap-1.5 truncate">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-gold-400" aria-hidden="true" />
              Wikililye&ndash;Mulango Road, Kitui Town
            </span>
            <a
              href="tel:+254703710879"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-gold-300"
            >
              <Phone className="h-3.5 w-3.5 text-gold-400" aria-hidden="true" />
              0703 710 879
            </a>
            <a
              href="mailto:info@kipskitui.com"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-gold-300"
            >
              <Mail className="h-3.5 w-3.5 text-gold-400" aria-hidden="true" />
              info@kipskitui.com
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[#f2efe6]/90">
              <CalendarDays className="h-3.5 w-3.5 text-gold-400" aria-hidden="true" />
              January &middot; May &middot; September intakes
            </span>
            <span aria-hidden="true" className="text-[#f2efe6]/30">
              |
            </span>
            <button
              type="button"
              className="text-[#f2efe6]/80 underline-offset-2 transition-colors hover:text-gold-300 hover:underline"
            >
              Alumni
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* main bar — warm paper with backdrop blur */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            aria-label="KIP College — go to homepage"
            className="flex min-h-11 items-center rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <KipLogo className="text-foreground" />
          </button>

          {/* desktop nav (xl+ — the full 9-entry bar needs the wider breakpoint) */}
          <nav aria-label="Main navigation" className="hidden xl:block">
            <ul className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <DesktopNavLink
                    label={item.label}
                    active={isActive(current, item.to)}
                    onClick={() => navigate(item.to)}
                  />
                </li>
              ))}
              <li>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={cn(
                      'relative inline-flex items-center gap-1 whitespace-nowrap rounded-md px-3.5 py-2 text-[15px] font-medium tracking-wide outline-none transition-colors duration-200 hover:bg-muted',
                      newsActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    News &amp; Events
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                    {newsActive && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3.5 -bottom-0.5 h-[3px] rounded-full bg-gold-500"
                      />
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => navigate('/news')} className="min-h-11 cursor-pointer">
                      <Newspaper className="mr-2 h-4 w-4" aria-hidden="true" /> News
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/events')} className="min-h-11 cursor-pointer">
                      <CalendarClock className="mr-2 h-4 w-4" aria-hidden="true" /> Events
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/gallery')} className="min-h-11 cursor-pointer">
                      <ImageIcon className="mr-2 h-4 w-4" aria-hidden="true" /> Gallery
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
              <li>
                <DesktopNavLink label="FAQ" active={faqActive} onClick={() => navigate('/faq')} />
              </li>
              <li>
                <DesktopNavLink
                  label="Contact"
                  active={current === 'contact'}
                  onClick={() => navigate('/contact')}
                />
              </li>
            </ul>
          </nav>

          {/* right actions */}
          <div className="hidden items-center gap-2.5 xl:flex">
            <Button
              onClick={() => navigate('/apply')}
              className="btn-gold min-h-11 px-6 font-semibold"
            >
              Apply Now
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex min-h-11 items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm font-medium outline-none transition-colors hover:bg-muted">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-xs font-bold uppercase text-[#f2efe6]">
                    {user.name.slice(0, 2)}
                  </span>
                  <span className="hidden max-w-28 truncate xl:inline">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <KipCrest className="h-5 w-5 text-gold-500" />
                    <span className="truncate">{user.name}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="min-h-11 cursor-pointer"
                    onClick={() => navigate(portalHomeFor(user.role))}
                  >
                    <User className="mr-2 h-4 w-4" aria-hidden="true" />
                    My Portal
                    <span className="ml-auto text-xs text-muted-foreground">{user.role}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="min-h-11 cursor-pointer text-destructive focus:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" aria-hidden="true" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
                className="min-h-11 border-brand-700/30 font-medium hover:border-gold-500/60 hover:text-gold-700 dark:hover:text-gold-400"
              >
                Student Login
              </Button>
            )}
          </div>

          {/* mobile hamburger */}
          <div className="flex items-center gap-1 xl:hidden">
            <div className="xl:hidden">
              <MobileThemeToggle />
            </div>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open navigation menu"
                  className="h-11 w-11"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex w-[85vw] max-w-xs flex-col p-0">
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                {/* emerald header band with the cream crest + wordmark */}
                <div className="flex items-center justify-between border-b border-gold-500/25 bg-brand-950 px-4 py-3.5">
                  <KipLogoLight />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-400">
                    Menu
                  </span>
                </div>
                <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-3 py-4">
                  <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-600 dark:text-gold-400">
                    Menu
                  </p>
                  <ul className="space-y-1">
                    {NAV_ITEMS.map((item) => (
                      <li key={item.to}>
                        <button
                          type="button"
                          onClick={() => navigate(item.to)}
                          className={cn(
                            'flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm font-medium transition-colors',
                            isActive(current, item.to)
                              ? 'bg-gold-400/15 font-semibold text-gold-700 dark:text-gold-300'
                              : 'text-foreground hover:bg-muted',
                          )}
                        >
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="px-3 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-600 dark:text-gold-400">
                    More
                  </p>
                  <ul className="space-y-1">
                    {MOBILE_SECONDARY.map((item) => {
                      const active = current === item.to.replace(/^\//, '')
                      return (
                        <li key={item.to}>
                          <button
                            type="button"
                            onClick={() => navigate(item.to)}
                            className={cn(
                              'flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition-colors',
                              active
                                ? 'bg-gold-400/15 font-semibold text-gold-700 dark:text-gold-300'
                                : 'text-foreground hover:bg-muted',
                            )}
                          >
                            <item.icon
                              className={cn(
                                'h-4.5 w-4.5 shrink-0',
                                active ? 'text-gold-600 dark:text-gold-400' : 'text-muted-foreground',
                              )}
                              aria-hidden="true"
                            />
                            {item.label}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
                <div className="space-y-2.5 border-t p-4">
                  <Button
                    onClick={() => navigate('/apply')}
                    className="btn-gold h-11 w-full font-semibold"
                  >
                    Apply Now
                  </Button>
                  {user ? (
                    <>
                      <Button
                        variant="outline"
                        className="h-11 w-full border-brand-700/30 hover:border-gold-500/60 hover:text-gold-700 dark:hover:text-gold-400"
                        onClick={() => navigate(portalHomeFor(user.role))}
                      >
                        My Portal ({user.role.toLowerCase()})
                      </Button>
                      <Button variant="ghost" className="h-11 w-full text-destructive" onClick={handleLogout}>
                        Log out
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      className="h-11 w-full border-brand-700/30 hover:border-gold-500/60 hover:text-gold-700 dark:hover:text-gold-400"
                      onClick={() => navigate('/login')}
                    >
                      Student Login
                    </Button>
                  )}
                  <p className="pt-1 text-center text-[11px] leading-relaxed text-muted-foreground">
                    January &middot; May &middot; September intakes
                    <br />
                    <a
                      href="tel:+254703710879"
                      className="font-medium text-primary transition-colors hover:text-gold-700 dark:hover:text-gold-400"
                    >
                      0703 710 879
                    </a>
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

function MobileThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const toggle = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle light or dark theme"
      onClick={toggle}
      className="h-11 w-11"
    >
      <Sun className="hidden h-5 w-5 dark:block" aria-hidden="true" />
      <Moon className="block h-5 w-5 dark:hidden" aria-hidden="true" />
    </Button>
  )
}
