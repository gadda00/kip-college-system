'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import {
  CalendarClock,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Download,
  Image as ImageIcon,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Moon,
  Phone,
  Search,
  Sun,
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
import { navigate, useHashRoute } from '@/components/kip/lib/router'
import { portalHomeFor, useAuthStore } from '@/components/kip/stores/auth-store'
import { KipLink } from '@/components/kip/components/link'
import { KipCrest, KipLogo } from '@/components/kip/components/kip-logo'
import {
  EMAIL,
  EMAIL_HREF,
  INTAKE_NOTE,
  PHONE_DISPLAY,
  PHONE_TEL,
  WHATSAPP_URL,
} from '@/components/kip/site/contact-info'
import { cn } from '@/lib/utils'

/** Primary desktop bar links (lg+). Secondary pages live in "More" + footer. */
const NAV_ITEMS: { label: string; to: string }[] = [
  { label: 'Academics', to: '/academics' },
  { label: 'Admissions', to: '/admissions' },
  { label: 'Campuses', to: '/campuses' },
  { label: 'About', to: '/about' },
  { label: 'News', to: '/news' },
]

/** Secondary pages folded into the compact "More" dropdown. */
const MORE_ITEMS: { label: string; to: string; icon: typeof CalendarClock }[] = [
  { label: 'Events', to: '/events', icon: CalendarClock },
  { label: 'Gallery', to: '/gallery', icon: ImageIcon },
  { label: 'Downloads', to: '/downloads', icon: Download },
  { label: 'FAQs', to: '/faq', icon: CircleHelp },
  { label: 'Contact', to: '/contact', icon: Mail },
]

/** Full site list for the mobile Sheet — 48px tap targets. */
const MOBILE_ITEMS: { label: string; to: string }[] = [
  { label: 'Home', to: '/' },
  { label: 'Academics', to: '/academics' },
  { label: 'Admissions', to: '/admissions' },
  { label: 'Campuses', to: '/campuses' },
  { label: 'About', to: '/about' },
  { label: 'News', to: '/news' },
  { label: 'Events', to: '/events' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Downloads', to: '/downloads' },
  { label: 'FAQs', to: '/faq' },
  { label: 'Contact', to: '/contact' },
]

function isActive(current: string, to: string): boolean {
  if (to === '/') return current === ''
  return current === to.replace(/^\/+/, '')
}

/** Theme toggle for the dark sapphire utility bar. */
function UtilityThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const toggle = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  return (
    <button
      type="button"
      aria-label="Toggle light or dark theme"
      onClick={toggle}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#f2efe6]/85 transition-colors hover:bg-white/10 hover:text-white"
    >
      {/* icons swap via the `dark` class next-themes sets on <html> — no JS state needed */}
      <Sun className="hidden h-4 w-4 dark:block" aria-hidden="true" />
      <Moon className="block h-4 w-4 dark:hidden" aria-hidden="true" />
    </button>
  )
}

/** Theme toggle for the light main bar / mobile. */
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

/** Desktop nav link — a real anchor with a short gold underline when active. */
function DesktopNavLink({ label, to, active }: { label: string; to: string; active: boolean }) {
  return (
    <KipLink
      to={to}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative inline-flex min-h-11 items-center whitespace-nowrap rounded-md px-3 text-sm font-medium tracking-wide transition-colors duration-200 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring xl:px-3.5 xl:text-[15px]',
        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
      {active && (
        <span
          aria-hidden="true"
          className="absolute inset-x-3 -bottom-0.5 h-[3px] rounded-full bg-gold-500"
        />
      )}
    </KipLink>
  )
}

/**
 * Header lockup: crest + wordmark; the motto line joins from lg so the 1024px
 * nav bar stays comfortable and 360px phones stay clutter-free.
 */
function HeaderBrand() {
  return (
    <KipLink
      to="/"
      aria-label="KIP College — go to homepage"
      className="flex min-h-11 items-center gap-2.5 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <KipCrest className="h-9 w-9 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-base font-bold tracking-tight sm:text-lg">
          KIP COLLEGE
        </span>
        <span className="mt-1 hidden text-[9px] font-semibold tracking-[0.24em] text-gold-600 dark:text-gold-400 lg:inline">
          TRAINING FOR EXCELLENCE
        </span>
      </span>
    </KipLink>
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

  const moreActive = MORE_ITEMS.some((item) => isActive(current, item.to))

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

      {/* ── top utility bar (lg+): location · phone · WhatsApp · email · intakes · theme ── */}
      <div className="hidden bg-brand-950 lg:block">
        <div className="mx-auto flex h-11 max-w-7xl items-center justify-between gap-4 px-6 text-xs text-[#f2efe6]/80 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <span className="inline-flex items-center gap-1.5 truncate">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-500" aria-hidden="true" />
              Wikililye&ndash;Mulango Road, Kitui Town
            </span>
            <a
              href={PHONE_TEL}
              className="inline-flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-white"
            >
              <Phone className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
              {PHONE_DISPLAY}
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-white"
            >
              <MessageCircle className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
              WhatsApp
            </a>
            <a
              href={EMAIL_HREF}
              className="inline-flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-white"
            >
              <Mail className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
              {EMAIL}
            </a>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[#f2efe6]/90">
              <CalendarDays className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
              {INTAKE_NOTE}
            </span>
            <UtilityThemeToggle />
          </div>
        </div>
      </div>

      {/* ── main bar — warm paper with backdrop blur ── */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:h-[4.5rem] lg:gap-3 lg:px-8">
          <HeaderBrand />

          {/* desktop nav (lg+) */}
          <nav aria-label="Main navigation" className="hidden lg:block">
            <ul className="flex items-center gap-0.5 xl:gap-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <DesktopNavLink
                    label={item.label}
                    to={item.to}
                    active={isActive(current, item.to)}
                  />
                </li>
              ))}
              <li>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={cn(
                      'relative inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-md px-3 text-sm font-medium tracking-wide outline-none transition-colors duration-200 hover:bg-muted xl:px-3.5 xl:text-[15px]',
                      moreActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    More
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                    {moreActive && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3 -bottom-0.5 h-[3px] rounded-full bg-gold-500"
                      />
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {MORE_ITEMS.map((item) => (
                      <DropdownMenuItem key={item.to} asChild>
                        <KipLink to={item.to} className="min-h-11 cursor-pointer">
                          <item.icon className="mr-2 h-4 w-4" aria-hidden="true" />
                          {item.label}
                        </KipLink>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            </ul>
          </nav>

          {/* right actions (lg+) */}
          <div className="hidden items-center gap-2.5 lg:flex">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with KIP College on WhatsApp"
              title="Chat on WhatsApp"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-700/30 text-primary transition-colors hover:border-brand-700/60 hover:bg-brand-50 dark:hover:bg-brand-900/40"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
            </a>
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
                  <DropdownMenuItem asChild>
                    <KipLink to={portalHomeFor(user.role)} className="min-h-11 cursor-pointer">
                      <User className="mr-2 h-4 w-4" aria-hidden="true" />
                      My Portal
                      <span className="ml-auto text-xs text-muted-foreground">{user.role}</span>
                    </KipLink>
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
              <KipLink
                to="/login"
                className="inline-flex min-h-11 items-center whitespace-nowrap rounded-md px-2.5 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:bg-muted hover:text-foreground hover:underline xl:px-3 xl:text-[15px]"
              >
                Student Login
              </KipLink>
            )}
            <KipLink
              to="/apply"
              className="btn-gold inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full px-6 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Apply Now
            </KipLink>
          </div>

          {/* mobile quick actions (<lg): compact Apply · theme · menu */}
          <div className="flex items-center gap-1 lg:hidden">
            <KipLink
              to="/apply"
              className="btn-gold inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full px-4 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Apply
            </KipLink>
            <MobileThemeToggle />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open navigation menu"
                  aria-expanded={mobileOpen}
                  className="h-11 w-11"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex w-[85vw] max-w-xs flex-col p-0">
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>

                {/* brand row on paper — keeps the built-in close control high-contrast */}
                <div className="flex min-h-14 items-center justify-between border-b px-4 py-2 pr-12">
                  <KipLogo className="text-foreground" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Menu
                  </span>
                </div>

                {/* find-a-course faux input */}
                <div className="px-3 pt-3">
                  <KipLink
                    to="/academics"
                    className="flex min-h-11 items-center gap-2.5 rounded-xl border border-input bg-muted/60 px-3.5 text-sm text-muted-foreground transition-colors hover:border-brand-700/40 hover:bg-muted hover:text-foreground"
                  >
                    <Search className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                    Find a course&hellip;
                  </KipLink>
                </div>

                {/* full sitemap — 48px tap targets */}
                <nav
                  aria-label="Mobile navigation"
                  className="custom-scrollbar flex-1 overflow-y-auto px-3 py-3"
                >
                  <ul className="space-y-1">
                    {MOBILE_ITEMS.map((item) => {
                      const active = isActive(current, item.to)
                      return (
                        <li key={item.to}>
                          <KipLink
                            to={item.to}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                              'flex min-h-12 items-center rounded-lg px-3 text-[15px] font-medium transition-colors',
                              active
                                ? 'bg-gold-400/15 font-semibold text-gold-700 dark:text-gold-300'
                                : 'text-foreground hover:bg-muted',
                            )}
                          >
                            {item.label}
                          </KipLink>
                        </li>
                      )
                    })}
                  </ul>
                </nav>

                {/* bottom action block */}
                <div className="space-y-2.5 border-t p-4">
                  <KipLink
                    to="/apply"
                    className="btn-gold flex h-12 w-full items-center justify-center rounded-xl text-base font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    Apply Now
                  </KipLink>
                  {user ? (
                    <>
                      <KipLink
                        to={portalHomeFor(user.role)}
                        className="flex h-11 w-full items-center justify-center rounded-xl border border-brand-700/30 text-sm font-semibold text-foreground transition-colors hover:border-brand-700/60 hover:bg-muted"
                      >
                        My Portal ({user.role.toLowerCase()})
                      </KipLink>
                      <Button
                        variant="ghost"
                        className="h-11 w-full text-destructive"
                        onClick={handleLogout}
                      >
                        Log out
                      </Button>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <KipLink
                        to="/login"
                        className="flex h-11 items-center justify-center rounded-xl border border-brand-700/30 text-sm font-semibold text-foreground transition-colors hover:border-brand-700/60 hover:bg-muted"
                      >
                        Student Login
                      </KipLink>
                      <KipLink
                        to="/login/staff"
                        className="flex h-11 items-center justify-center rounded-xl border border-brand-700/30 text-sm font-semibold text-foreground transition-colors hover:border-brand-700/60 hover:bg-muted"
                      >
                        Staff Login
                      </KipLink>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-700 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-600"
                    >
                      <MessageCircle className="h-4.5 w-4.5" aria-hidden="true" />
                      WhatsApp
                    </a>
                    <a
                      href={PHONE_TEL}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-brand-700/30 text-sm font-semibold text-foreground transition-colors hover:border-brand-700/60 hover:bg-muted"
                    >
                      <Phone className="h-4.5 w-4.5" aria-hidden="true" />
                      Call
                    </a>
                  </div>
                  <p className="pt-0.5 text-center text-[11px] leading-relaxed text-muted-foreground">
                    {INTAKE_NOTE}
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
