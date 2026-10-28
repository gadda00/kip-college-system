'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BadgeCheck, CheckCircle2, Circle, ClipboardList, Home, Loader2, Package, PackageSearch,
  RefreshCw, Truck, Warehouse, XCircle, Smartphone, Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { StatusBadge, kes, EmptyState, MpesaBadge } from '@/components/shared/ui-bits'
import { ProductImage } from '@/components/shared/book-cover'
import { useUIStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils'

const TIMELINE = [
  { key: 'PENDING', label: 'Order placed', icon: ClipboardList, desc: 'We received your order' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: BadgeCheck, desc: 'Payment confirmed, processing started' },
  { key: 'PROCESSING', label: 'Packing', icon: Warehouse, desc: 'Your items are being packed' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for delivery', icon: Truck, desc: 'Rider on the way to you' },
  { key: 'DELIVERED', label: 'Delivered', icon: Home, desc: 'Enjoy your books!' },
]

export function TrackView({ orderNumber: initial }: { orderNumber?: string }) {
  const navigate = useUIStore((s) => s.navigate)
  const [orderNumber, setOrderNumber] = useState(initial ?? '')
  const [searched, setSearched] = useState(!!initial)

  const { data, isLoading, refetch, isFetching } = useQuery<{ order: any } | { error: string }>({
    queryKey: ['track', orderNumber],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${orderNumber}`)
      return res.json()
    },
    enabled: searched && !!orderNumber,
    refetchInterval: (q) => {
      const d = q.state.data as any
      return d?.order && d.order.paymentStatus === 'PROCESSING' ? 2000 : false
    },
  })

  const order = (data as any)?.order
  const error = (data as any)?.error

  const statusIndex = order ? TIMELINE.findIndex((t) => t.key === order.status) : -1
  const cancelled = order?.status === 'CANCELLED'

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Track Your Order</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enter your order number (e.g. KPS-123456) to see live status.</p>
      </div>

      {/* Search box */}
      <form
        className="mx-auto flex max-w-md gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (orderNumber.trim()) setSearched(true)
        }}
      >
        <Input
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
          placeholder="KPS-XXXXXX"
          className="h-12 rounded-full font-mono text-base"
          aria-label="Order number"
        />
        <Button type="submit" className="h-12 rounded-full px-6" disabled={isLoading}>
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <PackageSearch size={18} />}
          Track
        </Button>
      </form>

      {/* Result */}
      <div className="mt-8">
        {searched && error && (
          <EmptyState
            icon={<XCircle size={40} className="text-destructive" />}
            title="Order not found"
            description={error}
          />
        )}

        {order && (
          <div className="animate-fade-up space-y-6">
            {/* Header card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Order</p>
                    <p className="text-2xl font-black tracking-tight text-primary">{order.orderNumber}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Placed {new Date(order.createdAt).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={order.status} />
                    <span className="flex items-center gap-1.5 text-sm">
                      {order.paymentMethod === 'MPESA' ? <MpesaBadge /> : <span className="text-xs text-muted-foreground">Cash on Delivery</span>}
                      <StatusBadge status={order.paymentStatus} />
                    </span>
                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => refetch()}>
                      <RefreshCw size={12} className={isFetching ? 'animate-spin' : ''} /> Refresh
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment waiting notice */}
            {order.paymentStatus === 'PROCESSING' && (
              <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
                <Smartphone size={18} className="animate-bounce text-amber-600" />
                <span>
                  <strong>M-Pesa request active</strong> — enter your PIN on {order.mpesaPhone}. This page updates automatically.
                </span>
              </div>
            )}

            {/* Timeline */}
            {cancelled ? (
              <div className="flex items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-5 text-sm">
                <XCircle size={22} className="text-destructive" />
                <span><strong>This order was cancelled.</strong> If you paid via M-Pesa, refunds process within 24 hours. Contact us on +254 700 111 222.</span>
              </div>
            ) : (
              <Card>
                <CardHeader><CardTitle className="text-base">Delivery progress</CardTitle></CardHeader>
                <CardContent>
                  <ol className="relative space-y-6">
                    {TIMELINE.map((t, i) => {
                      const done = i <= statusIndex
                      const current = i === statusIndex
                      return (
                        <li key={t.key} className="relative flex gap-4">
                          {i < TIMELINE.length - 1 && (
                            <span
                              className={cn('absolute left-[15px] top-8 h-full w-0.5', i < statusIndex ? 'bg-primary' : 'bg-border')}
                              aria-hidden
                            />
                          )}
                          <span
                            className={cn(
                              'z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2',
                              done ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground',
                              current && 'animate-pulse-ring'
                            )}
                          >
                            {done ? <CheckCircle2 size={16} /> : <t.icon size={15} />}
                          </span>
                          <div className="pb-1">
                            <p className={cn('text-sm font-semibold', done ? 'text-foreground' : 'text-muted-foreground')}>{t.label}</p>
                            <p className="text-xs text-muted-foreground">{t.desc}</p>
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                </CardContent>
              </Card>
            )}

            {/* Items + summary */}
            <Card>
              <CardHeader><CardTitle className="text-base">Items in this order</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {order.items?.map((it: any) => (
                    <li key={it.id} className="flex items-center gap-3">
                      <div className="w-12 shrink-0">
                        <ProductImage name={it.name} image={it.image} className="shadow-sm" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium">{it.name}</p>
                        <p className="text-xs text-muted-foreground">{kes(it.price)} × {it.quantity}</p>
                      </div>
                      <span className="text-sm font-bold">{kes(it.price * it.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <Separator />
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{kes(order.subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{order.deliveryFee === 0 ? 'FREE' : kes(order.deliveryFee)}</span></div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-amber-600"><span>Points redeemed</span><span>−{kes(order.discount)}</span></div>
                  )}
                  <div className="flex justify-between text-base font-black"><span>Total</span><span className="text-primary">{kes(order.total)}</span></div>
                  {order.mpesaRef && (
                    <p className="pt-1 font-mono text-xs text-muted-foreground">M-Pesa receipt: {order.mpesaRef}</p>
                  )}
                  {order.pointsEarned > 0 && order.paymentStatus === 'PAID' && (
                    <p className="flex items-center gap-1 pt-1 text-xs font-semibold text-amber-600">
                      <Star size={12} className="fill-current" /> You earned {order.pointsEarned} loyalty points
                    </p>
                  )}
                </div>
                {order.deliveryMethod === 'DELIVERY' && order.address && (
                  <>
                    <Separator />
                    <p className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Truck size={15} className="mt-0.5 shrink-0 text-primary" />
                      <span>Deliver to: {order.address}{order.town ? `, ${order.town}` : ''} — {order.phone}</span>
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {!searched && (
          <div className="mx-auto max-w-md rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            <Package size={32} className="mx-auto mb-2 text-muted-foreground/50" />
            Your order number appears on your confirmation screen and receipt after checkout.
          </div>
        )}
      </div>
    </main>
  )
}
