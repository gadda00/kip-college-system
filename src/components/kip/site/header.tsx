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
import { KipLogo, KipCrest } from '@/components/kip/components/kip-logo'
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
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary-foreground/85 transition-colors hover:bg-white/15 hover:text-white"
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

      {/* top utility bar */}
      <div className="hidden bg-primary text-primary-foreground md:block">
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between gap-4 px-6 text-xs lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <span className="inline-flex items-center gap-1.5 truncate">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-sky-300" aria-hidden="true" />
              Wikililye&ndash;Mulango Road, Kitui Town
            </span>
            <a
              href="tel:+254703710879"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-sky-300"
            >
              <Phone className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" />
              0703 710 879
            </a>
            <a
              href="mailto:info@kipskitui.com"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-sky-300"
            >
              <Mail className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" />
              info@kipskitui.com
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-primary-foreground/90">
              <CalendarDays className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" />
              January &middot; May &middot; September intakes
            </span>
            <span aria-hidden="true" className="text-primary-foreground/30">
              |
            </span>
            <button
              type="button"
              className="text-primary-foreground/80 underline-offset-2 transition-colors hover:text-sky-300 hover:underline"
            >
              Alumni
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* main bar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
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
                  <button
                    type="button"
                    onClick={() => navigate(item.to)}
                    className={cn(
                      'relative rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive(current, item.to)
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {item.label}
                    {isActive(current, item.to) && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary"
                      />
                    )}
                  </button>
                </li>
              ))}
              <li>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={cn(
                      'inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors',
                      newsActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    News &amp; Events
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
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
                <button
                  type="button"
                  onClick={() => navigate('/faq')}
                  className={cn(
                    'relative rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    faqActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  FAQ
                  {faqActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary"
                    />
                  )}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/contact')}
                  className={cn(
                    'relative rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    current === 'contact'
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  Contact
                  {current === 'contact' && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary"
                    />
                  )}
                </button>
              </li>
            </ul>
          </nav>

          {/* right actions */}
          <div className="hidden items-center gap-2.5 xl:flex">
            <Button
              onClick={() => navigate('/apply')}
              className="min-h-11 bg-gradient-to-b from-sky-600 to-primary font-semibold shadow-sm hover:from-sky-500 hover:to-sky-700"
            >
              Apply Now
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex min-h-11 items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm font-medium outline-none transition-colors hover:bg-muted">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold uppercase text-primary-foreground">
                    {user.name.slice(0, 2)}
                  </span>
                  <span className="hidden max-w-28 truncate xl:inline">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <KipCrest className="h-5 w-5 text-primary" />
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
                className="min-h-11 font-medium"
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
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <KipLogo variant="mark" className="text-foreground" />
                  <span className="text-sm font-semibold">KIP College</span>
                </div>
                <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-3 py-4">
                  <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
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
                              ? 'bg-primary/10 text-primary'
                              : 'text-foreground hover:bg-muted',
                          )}
                        >
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="px-3 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
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
                                ? 'bg-primary/10 text-primary'
                                : 'text-foreground hover:bg-muted',
                            )}
                          >
                            <item.icon
                              className={cn(
                                'h-4.5 w-4.5 shrink-0',
                                active ? 'text-primary' : 'text-muted-foreground',
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
                    className="h-11 w-full bg-gradient-to-b from-sky-600 to-primary font-semibold hover:from-sky-500 hover:to-sky-700"
                  >
                    Apply Now
                  </Button>
                  {user ? (
                    <>
                      <Button
                        variant="outline"
                        className="h-11 w-full"
                        onClick={() => navigate(portalHomeFor(user.role))}
                      >
                        My Portal ({user.role.toLowerCase()})
                      </Button>
                      <Button variant="ghost" className="h-11 w-full text-destructive" onClick={handleLogout}>
                        Log out
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" className="h-11 w-full" onClick={() => navigate('/login')}>
                      Student Login
                    </Button>
                  )}
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
