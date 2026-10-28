'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowRight, BadgeCheck, BookOpen, Calculator, ChevronRight, GraduationCap,
  Leaf, Package, Palette, PenTool, Printer, Sparkles, Star, Truck, Users, Backpack, Library, ClipboardList,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ProductCard, type Product } from '@/components/store/product-card'
import { kes } from '@/components/shared/ui-bits'
import { useUIStore } from '@/stores/ui-store'
import { useCartStore } from '@/stores/cart-store'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  BookOpen, GraduationCap, PenTool, Palette, Backpack, Calculator, ClipboardList, Library,
}

const HERO_IMG = 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f5136a730147.jpg'
const STUDENTS_IMG = 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/6684d0049d37.jpg'

export function HomeView() {
  const navigate = useUIStore((s) => s.navigate)
  const { recentlyViewed } = useCartStore()

  const { data: catData } = useQuery<{ categories: any[] }>({
    queryKey: ['categories'],
    queryFn: async () => (await fetch('/api/categories')).json(),
  })
  const { data: featData } = useQuery<{ products: Product[] }>({
    queryKey: ['products', 'featured'],
    queryFn: async () => (await fetch('/api/products?featured=1&limit=8&sort=popular')).json(),
  })
  const { data: newData } = useQuery<{ products: Product[] }>({
    queryKey: ['products', 'new'],
    queryFn: async () => (await fetch('/api/products?limit=4&sort=newest')).json(),
  })

  return (
    <main>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-amber-500/5">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 lg:grid-cols-2 lg:py-20">
          <div className="animate-fade-up space-y-6">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles size={12} className="mr-1" /> Trusted by Kitui schools & families since 2012
            </Badge>
            <h1 className="text-balance text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Every book your child needs.
              <span className="block text-primary">All in one place.</span>
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              KICD-approved CBC textbooks, the famous KIPS KCSE revision series, stationery, school
              supplies and professional printing — delivered across Kitui County with M-Pesa checkout.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="h-12 rounded-full px-7 text-base shadow-lg" onClick={() => navigate('shop')}>
                Shop Now <ArrowRight size={17} />
              </Button>
              <Button size="lg" variant="outline" className="h-12 rounded-full px-7 text-base" onClick={() => navigate('bulk')}>
                School Bulk Orders
              </Button>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Truck size={15} className="text-primary" /> Same-day town delivery</span>
              <span className="flex items-center gap-1.5"><BadgeCheck size={15} className="text-primary" /> KICD-approved stock</span>
              <span className="flex items-center gap-1.5"><Star size={15} className="text-amber-500" /> 4.8/5 parent rating</span>
            </div>
          </div>

          <div className="relative animate-fade-up [animation-delay:150ms]">
            <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl" aria-hidden />
            <img
              src={HERO_IMG}
              alt="Stack of colourful school textbooks and learning materials"
              className="relative aspect-[4/3] w-full rounded-2xl object-cover shadow-2xl"
            />
            <Card className="absolute -bottom-5 -left-3 w-44 shadow-xl sm:-left-8 sm:w-52">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-none">Back-to-School</p>
                    <p className="text-[11px] text-muted-foreground">Up to 15% off packs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="absolute -top-5 right-2 w-40 shadow-xl sm:-right-5 sm:w-44">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                    <Printer size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-none">Printing from</p>
                    <p className="text-[11px] text-muted-foreground">KES 8 / page</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats strip */}
        <div className="border-t bg-background/70 backdrop-blur">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x px-4 md:grid-cols-4">
            {[
              { icon: BookOpen, label: 'Curriculum titles', value: '2,000+' },
              { icon: Users, label: 'Schools served', value: '120+' },
              { icon: Package, label: 'Orders delivered', value: '8,500+' },
              { icon: Leaf, label: 'Years in Kitui', value: '13' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-center gap-3 px-2 py-4">
                <s.icon size={22} className="text-primary" aria-hidden />
                <div>
                  <div className="text-lg font-extrabold leading-none">{s.value}</div>
                  <div className="text-[11px] text-muted-foreground">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section className="mx-auto max-w-7xl px-4 py-12" aria-labelledby="categories-heading">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 id="categories-heading" className="text-2xl font-black tracking-tight sm:text-3xl">Shop by Category</h2>
            <p className="mt-1 text-sm text-muted-foreground">From PP1 to university — we&apos;ve got every level covered.</p>
          </div>
          <Button variant="ghost" className="hidden items-center gap-1 text-primary sm:flex" onClick={() => navigate('shop')}>
            View all <ChevronRight size={15} />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {catData?.categories.map((c: any, i: number) => {
            const Icon = iconMap[c.icon] ?? BookOpen
            return (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate('shop', { category: c.slug })}
                className="group relative overflow-hidden rounded-xl border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
              >
                {c.image && (
                  <img src={c.image} alt="" className="absolute inset-0 size-full object-cover opacity-[0.14] transition-opacity group-hover:opacity-25" />
                )}
                <div className="relative flex flex-col gap-2">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={22} />
                  </div>
                  <div className="text-sm font-bold leading-snug">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c._count?.products ?? 0} products</div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </section>

      {/* ============ FEATURED / BESTSELLERS ============ */}
      <section className="border-y bg-muted/30 py-12" aria-labelledby="bestsellers-heading">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 id="bestsellers-heading" className="flex items-center gap-2 text-2xl font-black tracking-tight sm:text-3xl">
                <Star size={26} className="fill-amber-400 text-amber-400" /> Bestsellers
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">What Kitui parents, students and teachers are buying right now.</p>
            </div>
            <Button variant="outline" className="rounded-full" onClick={() => navigate('shop')}>
              View all products
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featData?.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section className="mx-auto max-w-7xl px-4 py-12" aria-labelledby="services-heading">
        <div className="mb-6 text-center">
          <h2 id="services-heading" className="text-2xl font-black tracking-tight sm:text-3xl">More Than a Bookshop</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            A complete education ecosystem for Kitui — printing, school supplies, bulk procurement and study kits.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Printer, title: 'Printing & Binding', desc: 'Photocopy, print, scan, laminate and bind. Upload online, collect in 2 hours.',
              price: 'From KES 8/page', action: () => navigate('printing'), cta: 'Get a quote',
            },
            {
              icon: GraduationCap, title: 'School Bulk Orders', desc: 'Schools order full book lists, get 5% off and teacher reference copies.',
              price: '5% school discount', action: () => navigate('bulk'), cta: 'Request quote',
            },
            {
              icon: Backpack, title: 'Back-to-School Kits', desc: 'Complete grade kits with books, pens, geometry sets and bags — save 15%.',
              price: 'Kits from KES 3,450', action: () => navigate('shop', { category: 'bags-kits' }), cta: 'Browse kits',
            },
          ].map((s, i) => (
            <Card key={s.title} className="group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="flex flex-col gap-3 p-6">
                <div className={cn('flex size-12 items-center justify-center rounded-xl', i === 0 ? 'bg-amber-500/10 text-amber-600' : i === 1 ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-600')}>
                  <s.icon size={24} />
                </div>
                <h3 className="text-lg font-bold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                <Badge variant="outline" className="w-fit border-primary/30 bg-primary/5 text-primary">{s.price}</Badge>
                <Button variant="outline" className="mt-auto w-fit group-hover:border-primary group-hover:text-primary" onClick={s.action}>
                  {s.cta} <ArrowRight size={14} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ============ WHY KIPS + HOW IT WORKS ============ */}
      <section className="border-y bg-muted/30 py-12">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2">
          <div className="relative">
            <div className="absolute -inset-3 rounded-2xl bg-primary/10 blur-xl" aria-hidden />
            <img
              src={STUDENTS_IMG}
              alt="Smiling Kenyan students at their desks in a classroom"
              className="relative aspect-[4/3] w-full rounded-2xl object-cover shadow-xl"
            />
          </div>
          <div className="space-y-5">
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Why Kitui chooses KIPS</h2>
            <ul className="space-y-4">
              {[
                { icon: BadgeCheck, title: 'KICD-approved everything', desc: 'Every textbook we stock is approved by the Kenya Institute of Curriculum Development — no counterfeits, ever.' },
                { icon: Truck, title: 'Fast county-wide delivery', desc: 'Same-day in Kitui town, 1–2 days across the county and Mwingi, courier countrywide. FREE above KES 3,000.' },
                { icon: Star, title: 'Loyalty that pays', desc: 'Earn 1 point per KES 100 spent and redeem points as shillings on future orders.' },
                { icon: Printer, title: 'Full printing bureau', desc: 'From a single photocopy to spiral-bound KCSE past-paper bundles and hard-cover theses.' },
              ].map((f) => (
                <li key={f.title} className="flex gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <f.icon size={19} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{f.title}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============ NEW ARRIVALS ============ */}
      {newData && newData.products.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12" aria-labelledby="new-heading">
          <div className="mb-6">
            <h2 id="new-heading" className="text-2xl font-black tracking-tight sm:text-3xl">Fresh Off the Shelf</h2>
            <p className="mt-1 text-sm text-muted-foreground">Latest arrivals for the new term.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {newData.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ============ CTA ============ */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-primary-foreground sm:p-12">
          <div className="absolute -right-20 -top-20 size-64 rounded-full bg-white/10" aria-hidden />
          <div className="absolute -bottom-24 -left-10 size-52 rounded-full bg-white/10" aria-hidden />
          <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black sm:text-3xl">Ready for the new term?</h2>
              <p className="mt-2 max-w-md text-sm opacity-90">
                Order today and get everything delivered before opening day. Schools — request your bulk quote and pay on invoice.
              </p>
            </div>
            <div className="flex gap-3">
              <Button size="lg" variant="secondary" className="rounded-full" onClick={() => navigate('shop')}>
                Start Shopping
              </Button>
              <Button size="lg" variant="outline" className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={() => navigate('bulk')}>
                School Orders
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
