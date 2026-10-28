'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Heart, MapPin, Package, Printer, ShoppingBag, Star, Truck, User, Building2, GraduationCap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { StatusBadge, kes, EmptyState, MpesaBadge } from '@/components/shared/ui-bits'
import { ProductCard, type Product } from '@/components/store/product-card'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'

export function AccountView({ section }: { section?: string }) {
  const navigate = useUIStore((s) => s.navigate)
  const user = useAuthStore((s) => s.user)
  const refresh = useAuthStore((s) => s.refresh)

  const { data: ordersData } = useQuery<{ orders: any[] }>({
    queryKey: ['my-orders'],
    queryFn: async () => (await fetch('/api/orders')).json(),
    enabled: !!user,
  })
  const { data: wishData } = useQuery<{ items: { product: Product }[] }>({
    queryKey: ['wishlist'],
    queryFn: async () => (await fetch('/api/wishlist')).json(),
    enabled: !!user,
  })
  const { data: bulkData } = useQuery<{ bulkOrders: any[] }>({
    queryKey: ['my-bulk-orders'],
    queryFn: async () => (await fetch('/api/bulk-orders')).json(),
    enabled: !!user,
  })
  const { data: printData } = useQuery<{ jobs: any[] }>({
    queryKey: ['my-print-jobs'],
    queryFn: async () => (await fetch('/api/print-jobs')).json(),
    enabled: !!user,
  })

  if (!user) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <EmptyState
          icon={<User size={40} />}
          title="Sign in to view your account"
          description="Track orders, manage your wishlist and redeem loyalty points."
          action={<Button onClick={() => useUIStore.getState().setAuthOpen(true)}>Sign in</Button>}
        />
      </main>
    )
  }

  const orders = ordersData?.orders ?? []
  const paidOrders = orders.filter((o) => o.paymentStatus === 'PAID')
  const totalSpent = paidOrders.reduce((s, o) => s + o.total, 0)
  const wishlist = wishData?.items?.map((i) => i.product) ?? []

  const tab = section ?? 'overview'

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      {/* Profile header */}
      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-center gap-5 p-6">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-black text-primary">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-black tracking-tight">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email}{user.phone ? ` • ${user.phone}` : ''}</p>
            <div className="mt-1.5 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {user.role === 'SCHOOL' && (
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                  <GraduationCap size={12} /> {user.schoolName || 'School account'}
                </span>
              )}
              {user.town && <span className="flex items-center gap-1"><MapPin size={12} /> {user.town}</span>}
              {user.address && <span className="truncate">{user.address}</span>}
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{user.loyaltyPoints}</p>
              <p className="text-xs text-muted-foreground">Loyalty points</p>
            </div>
            <div>
              <p className="text-2xl font-black">{orders.length}</p>
              <p className="text-xs text-muted-foreground">Orders</p>
            </div>
            <div>
              <p className="text-2xl font-black text-primary">{kes(totalSpent).replace('KES ', '')}</p>
              <p className="text-xs text-muted-foreground">Total spent</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={tab} onValueChange={(v) => navigate('account', { section: v })}>
        <TabsList className="mb-6 h-auto flex-wrap">
          <TabsTrigger value="overview" className="gap-1.5"><User size={14} /> Overview</TabsTrigger>
          <TabsTrigger value="orders" className="gap-1.5"><Package size={14} /> Orders</TabsTrigger>
          <TabsTrigger value="wishlist" className="gap-1.5"><Heart size={14} /> Wishlist</TabsTrigger>
          {user.role === 'SCHOOL' && <TabsTrigger value="bulk" className="gap-1.5"><Building2 size={14} /> Bulk Orders</TabsTrigger>}
          <TabsTrigger value="print" className="gap-1.5"><Printer size={14} /> Print Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Loyalty card */}
          <Card className="overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-primary/10">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600">
                  <Star size={24} className="fill-current" />
                </div>
                <div>
                  <h3 className="text-lg font-black">KIPS Loyalty Programme</h3>
                  <p className="text-sm text-muted-foreground">
                    Earn 1 point per KES 100 spent. 1 point = KES 1 at checkout.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-amber-600 dark:text-amber-400">{user.loyaltyPoints}</p>
                <p className="text-xs text-muted-foreground">points available = {kes(user.loyaltyPoints)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: ShoppingBag, label: 'Recent orders', value: String(orders.length), hint: 'Lifetime orders' },
              { icon: Truck, label: 'In transit', value: String(orders.filter((o) => ['CONFIRMED', 'PROCESSING', 'PACKED', 'OUT_FOR_DELIVERY'].includes(o.status)).length), hint: 'Being processed' },
              { icon: Heart, label: 'Wishlist', value: String(wishlist.length), hint: 'Saved items' },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <s.icon size={20} />
                  </div>
                  <div>
                    <p className="text-xl font-black">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label} • {s.hint}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent orders preview */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Latest orders</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('account', { section: 'orders' })}>View all</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {orders.slice(0, 3).map((o) => (
                <button
                  key={o.id}
                  className="flex w-full flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-left text-sm hover:border-primary/40"
                  onClick={() => navigate('track', { orderNumber: o.orderNumber })}
                >
                  <div>
                    <p className="font-mono font-bold text-primary">{o.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString('en-KE', { dateStyle: 'medium' })} • {o.items.length} items
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={o.status} />
                    <span className="font-bold">{kes(o.total)}</span>
                  </div>
                </button>
              ))}
              {orders.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">No orders yet — your book journey starts soon!</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          {orders.length === 0 ? (
            <EmptyState
              icon={<Package size={40} />}
              title="No orders yet"
              description="When you place orders they'll appear here with live tracking."
              action={<Button onClick={() => navigate('shop')}>Start shopping</Button>}
            />
          ) : (
            orders.map((o) => (
              <Card key={o.id}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <button
                        className="font-mono text-base font-bold text-primary hover:underline"
                        onClick={() => navigate('track', { orderNumber: o.orderNumber })}
                      >
                        {o.orderNumber}
                      </button>
                      <p className="text-xs text-muted-foreground">
                        {new Date(o.createdAt).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={o.status} />
                      {o.paymentMethod === 'MPESA' && <MpesaBadge />}
                      <StatusBadge status={o.paymentStatus} />
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-2">
                      {o.items.slice(0, 4).map((it: any) => (
                        <div key={it.id} className="w-9">
                          {it.image ? (
                            <img src={it.image} alt={it.name} className="aspect-[3/4] w-full rounded object-cover shadow-sm" />
                          ) : (
                            <div className="flex aspect-[3/4] w-full items-center justify-center rounded bg-primary/10 text-[8px] font-bold text-primary">
                              {it.name.slice(0, 8)}
                            </div>
                          )}
                        </div>
                      ))}
                      {o.items.length > 4 && (
                        <span className="flex items-center text-xs text-muted-foreground">+{o.items.length - 4} more</span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-primary">{kes(o.total)}</p>
                      <p className="text-xs text-muted-foreground">{o.items.reduce((s: number, i: any) => s + i.quantity, 0)} items</p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => navigate('track', { orderNumber: o.orderNumber })}>
                      <Truck size={13} /> Track order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="wishlist" className="space-y-4">
          {wishlist.length === 0 ? (
            <EmptyState
              icon={<Heart size={40} />}
              title="Your wishlist is empty"
              description="Tap the heart on any product to save it for later."
              action={<Button onClick={() => navigate('shop')}>Browse products</Button>}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {wishlist.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          {(bulkData?.bulkOrders ?? []).length === 0 ? (
            <EmptyState
              icon={<Building2 size={40} />}
              title="No bulk requests yet"
              description="Submit your school book lists and get official quotations."
              action={<Button onClick={() => navigate('bulk')}>New bulk order</Button>}
            />
          ) : (
            bulkData!.bulkOrders.map((b) => {
              const items: any[] = JSON.parse(b.itemsJson || '[]')
              return (
                <Card key={b.id}>
                  <CardContent className="p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-mono font-bold text-primary">{b.reference}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(b.createdAt).toLocaleDateString('en-KE', { dateStyle: 'medium' })} • {b.schoolName}
                        </p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                    <Separator className="my-3" />
                    <ul className="space-y-1.5 text-sm">
                      {items.map((it: any, i: number) => (
                        <li key={i} className="flex justify-between text-muted-foreground">
                          <span>{it.name} × {it.qty}</span>
                          {it.unitPrice && <span>{kes(it.unitPrice * it.qty)}</span>}
                        </li>
                      ))}
                    </ul>
                    {b.quotedTotal != null && (
                      <div className="mt-3 flex justify-between border-t pt-3 text-sm font-bold">
                        <span>Quotation (with 5% school discount)</span>
                        <span className="text-primary">{kes(b.quotedTotal)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>

        <TabsContent value="print" className="space-y-4">
          {(printData?.jobs ?? []).length === 0 ? (
            <EmptyState
              icon={<Printer size={40} />}
              title="No print jobs yet"
              description="Submit documents for printing, copying and binding."
              action={<Button onClick={() => navigate('printing')}>New print job</Button>}
            />
          ) : (
            printData!.jobs.map((j) => (
              <Card key={j.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                  <div className="min-w-0">
                    <p className="font-mono font-bold text-primary">{j.reference}</p>
                    <p className="truncate text-sm font-medium">{j.documentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {j.pages} pages × {j.copies} • {j.paperSize} • {j.colorMode === 'BW' ? 'B&W' : j.colorMode} • {j.binding === 'NONE' ? 'No binding' : j.binding.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={j.status} />
                    <span className="font-bold text-primary">{kes(j.price)}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </main>
  )
}
