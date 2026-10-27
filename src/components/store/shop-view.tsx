'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Filter, LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ProductCard, type Product } from '@/components/store/product-card'
import { LoadingGrid, EmptyState, kes } from '@/components/shared/ui-bits'
import { useUIStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils'

const SORTS = [
  { value: 'popular', label: 'Most popular' },
  { value: 'newest', label: 'Newest arrivals' },
  { value: 'price-asc', label: 'Price: low → high' },
  { value: 'price-desc', label: 'Price: high → low' },
  { value: 'rating', label: 'Top rated' },
]

export function ShopView() {
  const { params, navigate } = useUIStore()
  const [q, setQ] = useState(params.q ?? '')
  const [category, setCategory] = useState(params.category ?? '')
  const [level, setLevel] = useState('')
  const [subject, setSubject] = useState('')
  const [maxPrice, setMaxPrice] = useState<number>(3000)
  const [sort, setSort] = useState('popular')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const { data: catData } = useQuery<{ categories: any[] }>({
    queryKey: ['categories'],
    queryFn: async () => (await fetch('/api/categories')).json(),
  })

  const queryStr = useMemo(() => {
    const sp = new URLSearchParams()
    if (q.trim()) sp.set('q', q.trim())
    if (category) sp.set('category', category)
    if (level) sp.set('level', level)
    if (subject) sp.set('subject', subject)
    if (maxPrice < 3000) sp.set('maxPrice', String(maxPrice))
    sp.set('sort', sort)
    sp.set('limit', '60')
    return sp.toString()
  }, [q, category, level, subject, maxPrice, sort])

  const { data, isLoading } = useQuery<{ products: Product[]; facets: { levels: string[]; subjects: string[] } }>({
    queryKey: ['products', queryStr],
    queryFn: async () => (await fetch(`/api/products?${queryStr}`)).json(),
  })

  const activeFilters = [category, level, subject, maxPrice < 3000 ? `≤ ${kes(maxPrice)}` : ''].filter(Boolean)
  const activeCategory = catData?.categories.find((c: any) => c.slug === category)

  const filterPanel = (
    <div className="space-y-5">
      <div>
        <Label className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
        <div className="space-y-1.5">
          <button
            className={cn('w-full rounded-lg px-3 py-1.5 text-left text-sm hover:bg-muted', !category && 'bg-primary/10 font-medium text-primary')}
            onClick={() => setCategory('')}
          >
            All categories
          </button>
          {catData?.categories.map((c: any) => (
            <button
              key={c.slug}
              className={cn('w-full rounded-lg px-3 py-1.5 text-left text-sm hover:bg-muted', category === c.slug && 'bg-primary/10 font-medium text-primary')}
              onClick={() => setCategory(c.slug)}
            >
              {c.name} <span className="text-xs text-muted-foreground">({c._count?.products ?? 0})</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {data?.facets?.levels?.length > 0 && (
        <div>
          <Label className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Level / Class</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-full"><SelectValue placeholder="All levels" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all-levels">All levels</SelectItem>
              {data.facets.levels.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {data?.facets?.subjects?.length > 0 && (
        <div>
          <Label className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Subject</Label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-full"><SelectValue placeholder="All subjects" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all-subjects">All subjects</SelectItem>
              {data.facets.subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Max price: {kes(maxPrice)}
        </Label>
        <Slider
          value={[maxPrice]}
          onValueChange={([v]) => setMaxPrice(v)}
          max={3000}
          min={100}
          step={50}
          className="py-1"
          aria-label="Maximum price"
        />
        <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
          <span>KES 100</span>
          <span>KES 3,000+</span>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <Button variant="outline" className="w-full" onClick={() => { setCategory(''); setLevel(''); setSubject(''); setMaxPrice(3000) }}>
          <X size={14} /> Clear filters
        </Button>
      )}
    </div>
  )

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <button className="hover:text-primary" onClick={() => navigate('home')}>Home</button>
        <ChevronRight size={14} />
        <span className="font-medium text-foreground">{activeCategory?.name ?? 'All Products'}</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
          {activeCategory?.name ?? (q ? `Results for “${q}”` : 'All Products')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {activeCategory?.description ?? 'The full KIPS Kitui catalogue — books, stationery, art, electronics and more.'}
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters (desktop) */}
        <aside className="hidden w-60 shrink-0 lg:block" aria-label="Product filters">
          <div className="sticky top-44 rounded-xl border bg-card p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold">
              <SlidersHorizontal size={15} /> Filters
            </div>
            {filterPanel}
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-44">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search within catalogue…"
                className="h-10 rounded-full pl-4"
                aria-label="Search products"
              />
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-10 w-44 rounded-full" aria-label="Sort products">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORTS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="h-10 rounded-full lg:hidden"
              onClick={() => setFiltersOpen(true)}
            >
              <Filter size={15} /> Filters
              {activeFilters.length > 0 && (
                <Badge className="ml-1 size-5 items-center justify-center rounded-full bg-primary p-0 text-[10px]">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {activeFilters.map((f) => (
                <Badge key={f} variant="secondary" className="gap-1 rounded-full py-1 pl-3 pr-1.5">
                  {f}
                  <button
                    className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                    onClick={() => { setCategory(''); setLevel(''); setSubject(''); setMaxPrice(3000) }}
                    aria-label="Clear all filters"
                  >
                    <X size={11} />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {isLoading ? (
            <LoadingGrid />
          ) : !data?.products?.length ? (
            <EmptyState
              icon={<LayoutGrid size={40} strokeWidth={1.2} />}
              title="No products found"
              description="Try adjusting your search or filters — or ask our AI assistant for help finding what you need."
              action={
                <Button variant="outline" onClick={() => { setQ(''); setCategory(''); setLevel(''); setSubject(''); setMaxPrice(3000) }}>
                  Clear all filters
                </Button>
              }
            />
          ) : (
            <>
              <p className="mb-3 text-xs text-muted-foreground">
                Showing {data.products.length} product{data.products.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {data.products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile filters sheet */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="left" className="w-80 overflow-y-auto">
          <SheetHeader className="border-b">
            <SheetTitle className="flex items-center gap-2"><SlidersHorizontal size={16} /> Filters</SheetTitle>
            <SheetDescription>Narrow down the catalogue</SheetDescription>
          </SheetHeader>
          <div className="p-4">{filterPanel}</div>
          <div className="border-t p-4">
            <Button className="w-full" onClick={() => setFiltersOpen(false)}>
              Show {data?.products?.length ?? 0} results
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </main>
  )
}
