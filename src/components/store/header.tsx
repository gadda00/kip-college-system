'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BookOpen, Building2, ChevronDown, Clock, Leaf, MapPin, Menu, Moon, Package,
  Phone, Printer, Search, ShoppingBag, Sun, Truck, User, LogOut, LayoutDashboard,
  Heart, PackageSearch,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useTheme } from 'next-themes'
import { useUIStore } from '@/stores/ui-store'
import { useCartStore, cartCount } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

type Category = { id: string; name: string; slug: string; _count?: { products: number } }

export function KipsLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2" aria-label="KIPS Kitui home">
      <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <BookOpen size={20} strokeWidth={2.2} />
      </div>
      {!compact && (
        <div className="leading-none">
          <div className="text-lg font-black tracking-tight">
            KIPS <span className="text-primary">Kitui</span>
          </div>
          <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Books • Stationery • Printing
          </div>
        </div>
      )}
    </div>
  )
}

export function Header() {
  const { navigate, setCartOpen, setAuthOpen, view } = useUIStore()
  const { items } = useCartStore()
  const { user, logout } = useAuthStore()
  const { setTheme } = useTheme()
  const [search, setSearch] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const count = cartCount(items)

  const { data: catData } = useQuery<{ categories: Category[] }>({
    queryKey: ['categories'],
    queryFn: async () => (await fetch('/api/categories')).json(),
  })
  const { data: annData } = useQuery<{ announcements: { title: string; content: string }[] }>({
    queryKey: ['announcements'],
    queryFn: async () => (await fetch('/api/announcements')).json(),
    staleTime: 60_000,
  })

  const announcement = annData?.announcements?.[0]

  const doSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (search.trim()) navigate('shop', { q: search.trim() })
    setMobileOpen(false)
  }

  const navLinks: { label: string; action: () => void; active: boolean }[] = [
    { label: 'Shop', action: () => navigate('shop'), active: view === 'shop' },
    { label: 'Bulk Orders', action: () => navigate('bulk'), active: view === 'bulk' },
    { label: 'Printing', action: () => navigate('printing'), active: view === 'printing' },
    { label: 'Track Order', action: () => navigate('track'), active: view === 'track' },
    { label: 'About', action: () => navigate('about'), active: view === 'about' },
    { label: 'Contact', action: () => navigate('contact'), active: view === 'contact' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Announcement strip */}
      {announcement && (
        <div className="bg-primary text-primary-foreground">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5 text-center text-xs font-medium">
            <Truck size={13} aria-hidden />
            <span className="line-clamp-1">
              <strong className="font-bold">{announcement.title}:</strong> {announcement.content}
            </span>
          </div>
        </div>
      )}

      {/* Top info bar */}
      <div className="hidden border-b bg-muted/40 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><MapPin size={12} aria-hidden /> Kitui Town CBD, opposite matatu stage</span>
            <span className="flex items-center gap-1"><Phone size={12} aria-hidden /> +254 700 111 222</span>
            <span className="flex items-center gap-1"><Clock size={12} aria-hidden /> Mon–Sat 7:30am–6:30pm</span>
          </div>
          <span className="flex items-center gap-1 font-medium text-primary">
            <Truck size={12} aria-hidden /> FREE delivery on orders above KES 3,000
          </span>
        </div>
      </div>

      {/* Main header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center gap-3">
            <button className="shrink-0" onClick={() => navigate('home')} aria-label="Go to homepage">
              <KipsLogo />
            </button>

            {/* Search */}
            <form onSubmit={doSearch} className="relative hidden flex-1 md:flex" role="search">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search books, pens, calculators… e.g. 'KCSE Biology'"
                className="h-10 rounded-full border-muted bg-muted/50 pl-9 pr-24 text-sm"
                aria-label="Search products"
              />
              <Button type="submit" size="sm" className="absolute right-1 top-1/2 h-8 -translate-y-1/2 rounded-full px-4">
                Search
              </Button>
            </form>

            <div className="ml-auto flex items-center gap-1.5">
              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark')}
                aria-label="Toggle dark mode"
                className="rounded-full"
              >
                <Sun size={18} className="hidden dark:block" aria-hidden />
                <Moon size={18} className="dark:hidden" aria-hidden />
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCartOpen(true)}
                aria-label={`Open cart, ${count} items`}
                className="relative rounded-full"
              >
                <ShoppingBag size={19} />
                {count > 0 && (
                  <Badge className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-primary p-0 text-[10px] font-bold text-primary-foreground">
                    {count > 99 ? '99+' : count}
                  </Badge>
                )}
              </Button>

              {/* Account */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 rounded-full px-2 sm:px-3">
                      <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {user.name.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="hidden max-w-28 truncate text-sm font-medium sm:block">{user.name}</span>
                      <ChevronDown size={14} className="hidden text-muted-foreground sm:block" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60">
                    <DropdownMenuLabel className="flex flex-col">
                      <span className="text-sm font-semibold">{user.name}</span>
                      <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                      {user.loyaltyPoints > 0 && (
                        <span className="mt-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                          ⭐ {user.loyaltyPoints} loyalty points
                        </span>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                      <DropdownMenuItem onClick={() => navigate('admin')}>
                        <LayoutDashboard size={15} /> Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => navigate('account')}>
                      <User size={15} /> My Account
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('orders')}>
                      <Package size={15} /> My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('wishlist')}>
                      <Heart size={15} /> Wishlist
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={async () => {
                        await logout()
                        navigate('home')
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut size={15} /> Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => setAuthOpen(true)} className="rounded-full" size="sm">
                  <User size={15} className="sm:hidden" />
                  <span className="hidden sm:inline">Sign in</span>
                </Button>
              )}

              {/* Mobile menu */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full md:hidden" aria-label="Open menu">
                    <Menu size={20} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                  <div className="flex items-center justify-between border-b p-4">
                    <KipsLogo />
                  </div>
                  <div className="p-4">
                    <form onSubmit={doSearch} className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products…"
                        className="h-10 rounded-full pl-9"
                        aria-label="Search products"
                      />
                    </form>
                    <nav className="space-y-1" aria-label="Main navigation">
                      {navLinks.map((l) => (
                        <button
                          key={l.label}
                          onClick={l.action}
                          className={cn(
                            'w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-muted',
                            l.active && 'bg-primary/10 text-primary'
                          )}
                        >
                          {l.label}
                        </button>
                      ))}
                    </nav>
                    <div className="mt-4 border-t pt-4">
                      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categories</p>
                    </div>
                    <div className="max-h-64 space-y-1 overflow-y-auto scrollbar-thin">
                      {catData?.categories.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            navigate('shop', { category: c.slug })
                            setMobileOpen(false)
                          }}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Desktop nav + categories */}
          <nav className="hidden h-11 items-center gap-1 md:flex" aria-label="Main navigation">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold hover:bg-muted">
                <Menu size={16} aria-hidden /> All Categories
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                {catData?.categories.map((c) => (
                  <DropdownMenuItem key={c.id} onClick={() => navigate('shop', { category: c.slug })}>
                    <BookOpen size={15} /> {c.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {navLinks.map((l) => (
              <button
                key={l.label}
                onClick={l.action}
                className={cn(
                  'h-9 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                  l.active && 'bg-primary/10 text-primary'
                )}
              >
                {l.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Leaf size={12} className="text-primary" aria-hidden /> KICD-approved books</span>
              <span className="flex items-center gap-1"><Printer size={12} className="text-primary" aria-hidden /> Printing from KES 8/page</span>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

export function Footer() {
  const navigate = useUIStore((s) => s.navigate)
  const { data: catData } = useQuery<{ categories: Category[] }>({
    queryKey: ['categories'],
    queryFn: async () => (await fetch('/api/categories')).json(),
  })

  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <KipsLogo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Kitui&apos;s trusted bookstore since 2012. KICD-approved textbooks, the full KIPS revision
              series, stationery, school supplies and professional printing — all under one roof.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="rounded-full border bg-background px-3 py-1 text-xs font-semibold text-primary">
                🇰🇪 Proudly Kenyan
              </span>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {catData?.categories.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <button className="hover:text-primary" onClick={() => navigate('shop', { category: c.slug })}>
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button className="hover:text-primary" onClick={() => navigate('bulk')}>School bulk orders</button></li>
              <li><button className="hover:text-primary" onClick={() => navigate('printing')}>Printing & binding</button></li>
              <li><button className="hover:text-primary" onClick={() => navigate('track')}>Track your order</button></li>
              <li><button className="hover:text-primary" onClick={() => navigate('contact')}>Contact us</button></li>
              <li><button className="hover:text-primary" onClick={() => navigate('about')}>About KIPS Kitui</button></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">Visit Us</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex gap-2"><MapPin size={16} className="shrink-0 text-primary" aria-hidden /> KIPS Building, Kitui Town CBD, opposite matatu stage</li>
              <li className="flex gap-2"><Phone size={16} className="shrink-0 text-primary" aria-hidden /> +254 700 111 222 / +254 733 111 222</li>
              <li className="flex gap-2"><Clock size={16} className="shrink-0 text-primary" aria-hidden /> Mon–Sat: 7:30am–6:30pm, Sun: 2pm–5pm</li>
              <li className="flex gap-2"><Building2 size={16} className="shrink-0 text-primary" aria-hidden /> P.O. Box 456-90200, Kitui</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {['M-Pesa', 'Cash', 'Card'].map((m) => (
                <span key={m} className="rounded-md border bg-background px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} KIPS Kitui. All rights reserved. A branch of the KIPS Kenya family.</p>
          <p className="flex items-center gap-1.5">
            <PackageSearch size={13} aria-hidden /> Demo system — all payments simulated
          </p>
        </div>
      </div>
    </footer>
  )
}
