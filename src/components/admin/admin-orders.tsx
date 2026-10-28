'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, ChevronDown, Loader2, Package, Search, Truck, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge, kes } from '@/components/shared/ui-bits'
import { cn } from '@/lib/utils'

const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']

export function AdminOrders() {
  const qc = useQueryClient()
  const [status, setStatus] = useState('all')
  const [q, setQ] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const { data, isLoading } = useQuery<{ orders: any[] }>({
    queryKey: ['admin-orders', status, q],
    queryFn: async () => {
      const sp = new URLSearchParams()
      if (status !== 'all') sp.set('status', status)
      if (q) sp.set('q', q)
      return (await fetch(`/api/admin/orders?${sp}`)).json()
    },
  })

  const updateStatus = useMutation({
    mutationFn: async ({ orderId, status, paymentStatus }: any) => {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status, paymentStatus }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json
    },
    onSuccess: () => {
      toast.success('Order updated')
      qc.invalidateQueries({ queryKey: ['admin-orders'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (e: any) => toast.error(e.message),
  })

  const orders = data?.orders ?? []

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-black">Order Management</h1>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order #, phone, ref…" className="h-9 w-56 rounded-full pl-9" aria-label="Search orders" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-44 rounded-full" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_FLOW.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div>
      ) : orders.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-2 p-10 text-center text-muted-foreground">
          <Package size={32} /> No orders match this filter.
        </CardContent></Card>
      ) : (
        <div className="space-y-2.5">
          {orders.map((o) => (
            <Card key={o.id} className="overflow-hidden">
              <button
                className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left hover:bg-muted/30"
                onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                aria-expanded={expanded === o.id}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-bold text-primary">{o.orderNumber}</span>
                  <span className="text-sm">{o.user?.name ?? 'Guest'}</span>
                  <span className="hidden text-xs text-muted-foreground md:inline">
                    {new Date(o.createdAt).toLocaleDateString('en-KE', { dateStyle: 'medium' })}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={o.status} />
                  <StatusBadge status={o.paymentStatus} />
                  <span className="text-sm font-black text-primary">{kes(o.total)}</span>
                  <ChevronDown size={15} className={cn('text-muted-foreground transition-transform', expanded === o.id && 'rotate-180')} />
                </div>
              </button>

              {expanded === o.id && (
                <div className="animate-fade-up border-t bg-muted/20 p-4">
                  <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                    {/* Items + customer */}
                    <div className="space-y-4">
                      <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Items</p>
                        <ul className="space-y-1.5">
                          {o.items.map((it: any) => (
                            <li key={it.id} className="flex items-center justify-between text-sm">
                              <span className="truncate">{it.name} × {it.quantity}</span>
                              <span className="font-medium">{kes(it.price * it.quantity)}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-2 flex justify-between border-t pt-2 text-sm font-bold">
                          <span>Total (delivery {o.deliveryFee ? kes(o.deliveryFee) : 'FREE'})</span>
                          <span className="text-primary">{kes(o.total)}</span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider">Customer & delivery</p>
                        <p>👤 {o.user?.name ?? 'Guest'} {o.user?.email && <span className="text-xs">({o.user.email})</span>}</p>
                        <p>📞 {o.phone ?? '—'}</p>
                        {o.deliveryMethod === 'PICKUP' ? (
                          <p className="flex items-center gap-1"><Truck size={13} /> Store pickup</p>
                        ) : (
                          <p>📍 {o.address ?? '—'}{o.town ? `, ${o.town}` : ''}</p>
                        )}
                        {o.mpesaRef && <p className="font-mono text-xs">M-Pesa: {o.mpesaRef}</p>}
                        {o.notes && <p className="mt-1 italic">“{o.notes}”</p>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 rounded-xl border bg-background p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Update status</p>
                      <div className="flex flex-wrap gap-1.5">
                        {STATUS_FLOW.map((s) => (
                          <button
                            key={s}
                            disabled={o.status === s || updateStatus.isPending}
                            onClick={() => updateStatus.mutate({ orderId: o.id, status: s })}
                            className={cn(
                              'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40',
                              o.status === s
                                ? 'border-primary bg-primary text-primary-foreground'
                                : s === 'CANCELLED'
                                  ? 'hover:border-destructive hover:text-destructive'
                                  : 'hover:border-primary hover:text-primary'
                            )}
                          >
                            {s.replace(/_/g, ' ')}
                          </button>
                        ))}
                      </div>
                      {o.paymentStatus !== 'PAID' && o.paymentMethod === 'COD' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
                          disabled={updateStatus.isPending}
                          onClick={() => updateStatus.mutate({ orderId: o.id, paymentStatus: 'PAID' })}
                        >
                          <CheckCircle2 size={14} /> Mark payment received
                        </Button>
                      )}
                      {o.paymentStatus === 'PROCESSING' && (
                        <Badge variant="outline" className="w-full justify-center border-amber-500/40 bg-amber-500/10 py-1.5 text-amber-600">
                          M-Pesa STK in progress — auto-confirms
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
