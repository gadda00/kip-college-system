'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, CheckCircle2, ChevronDown, Loader2, Mail, MailOpen, MessageSquare, Printer, Reply, Trash2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge, kes } from '@/components/shared/ui-bits'
import { cn } from '@/lib/utils'

const BULK_FLOW = ['SUBMITTED', 'QUOTED', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED']
const PRINT_FLOW = ['SUBMITTED', 'REVIEWING', 'PRINTING', 'READY', 'COLLECTED', 'CANCELLED']

// ============ BULK ORDERS ============
export function AdminBulk() {
  const qc = useQueryClient()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [quoteEdit, setQuoteEdit] = useState<{ id: string; value: string } | null>(null)

  const { data, isLoading } = useQuery<{ bulkOrders: any[] }>({
    queryKey: ['admin-bulk'],
    queryFn: async () => (await fetch('/api/admin/bulk-orders')).json(),
  })

  const update = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/admin/bulk-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json
    },
    onSuccess: () => {
      toast.success('Bulk order updated')
      qc.invalidateQueries({ queryKey: ['admin-bulk'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
      setQuoteEdit(null)
    },
    onError: (e: any) => toast.error(e.message),
  })

  const orders = data?.bulkOrders ?? []

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="flex items-center gap-2 text-xl font-black">
        <Building2 size={20} className="text-primary" /> School Bulk Orders
        <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">{orders.filter((o) => !['COMPLETED', 'REJECTED'].includes(o.status)).length} active</Badge>
      </h1>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-2.5">
          {orders.map((b) => {
            const items: any[] = JSON.parse(b.itemsJson || '[]')
            return (
              <Card key={b.id} className="overflow-hidden">
                <button
                  className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left hover:bg-muted/30"
                  onClick={() => setExpanded(expanded === b.id ? null : b.id)}
                  aria-expanded={expanded === b.id}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-sm font-bold text-primary">{b.reference}</span>
                    <span className="font-medium">{b.schoolName}</span>
                    <span className="hidden text-xs text-muted-foreground md:inline">{items.length} items • {b.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={b.status} />
                    {b.quotedTotal != null && <span className="text-sm font-black text-primary">{kes(b.quotedTotal)}</span>}
                    <ChevronDown size={15} className={cn('text-muted-foreground transition-transform', expanded === b.id && 'rotate-180')} />
                  </div>
                </button>

                {expanded === b.id && (
                  <div className="animate-fade-up space-y-4 border-t bg-muted/20 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1.5 text-sm">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact</p>
                        <p>👤 {b.contactPerson}</p>
                        <p>📞 {b.phone}{b.email ? ` • ✉️ ${b.email}` : ''}</p>
                        {b.level && <p>🎓 Level: {b.level}</p>}
                        {b.deliveryTown && <p>🚚 Deliver to: {b.deliveryTown}</p>}
                        {b.notes && <p className="mt-1 italic text-muted-foreground">“{b.notes}”</p>}
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Items requested</p>
                        <ul className="space-y-1">
                          {items.map((it: any, i: number) => (
                            <li key={i} className="flex justify-between">
                              <span className="truncate">{it.name} × {it.qty}</span>
                              {it.unitPrice ? <span className="text-muted-foreground">{kes(it.unitPrice * it.qty)}</span> : <Badge variant="secondary" className="text-[10px]">not stocked</Badge>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background p-3">
                      <div className="flex flex-wrap gap-1.5">
                        {BULK_FLOW.map((s) => (
                          <button
                            key={s}
                            disabled={b.status === s}
                            onClick={() => update.mutate({ id: b.id, status: s })}
                            className={cn(
                              'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40',
                              b.status === s ? 'border-primary bg-primary text-primary-foreground' : s === 'REJECTED' ? 'hover:border-destructive hover:text-destructive' : 'hover:border-primary hover:text-primary'
                            )}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      {quoteEdit?.id === b.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            className="h-8 w-36"
                            type="number"
                            value={quoteEdit.value}
                            onChange={(e) => setQuoteEdit({ id: b.id, value: e.target.value })}
                            aria-label="Quoted total"
                          />
                          <Button size="sm" className="h-8" onClick={() => update.mutate({ id: b.id, quotedTotal: quoteEdit.value, status: 'QUOTED' })}>
                            <Send size={13} /> Send quote
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" className="h-8" onClick={() => setQuoteEdit({ id: b.id, value: String(b.quotedTotal ?? '') })}>
                          {b.quotedTotal != null ? `Edit quote (${kes(b.quotedTotal)})` : 'Set quotation'}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============ PRINT JOBS ============
export function AdminPrint() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery<{ jobs: any[] }>({
    queryKey: ['admin-print'],
    queryFn: async () => (await fetch('/api/admin/print-jobs')).json(),
  })

  const update = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/admin/print-jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json
    },
    onSuccess: () => {
      toast.success('Print job updated')
      qc.invalidateQueries({ queryKey: ['admin-print'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (e: any) => toast.error(e.message),
  })

  const jobs = data?.jobs ?? []
  const queueRevenue = jobs.filter((j) => !['COLLECTED', 'CANCELLED'].includes(j.status)).reduce((s, j) => s + j.price, 0)

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="flex items-center gap-2 text-xl font-black">
        <Printer size={20} className="text-primary" /> Print Jobs
        <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
          {kes(queueRevenue)} in queue
        </Badge>
      </h1>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {jobs.map((j) => (
            <Card key={j.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-bold text-primary">{j.reference}</span>
                  <StatusBadge status={j.status} />
                </div>
                <div>
                  <p className="truncate text-sm font-semibold">{j.documentName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {j.pages} pages × {j.copies} • {j.paperSize} • {j.colorMode === 'BW' ? 'B&W' : j.colorMode} • {j.doubleSided ? 'double-sided' : 'single-sided'} • {j.binding.replace('_', ' ').toLowerCase()}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">👤 {j.customerName} • 📞 {j.phone}</p>
                  {j.notes && <p className="mt-1 text-xs italic text-muted-foreground">“{j.notes}”</p>}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-lg font-black text-primary">{kes(j.price)}</span>
                  <div className="flex flex-wrap gap-1">
                    {PRINT_FLOW.map((s) => (
                      <button
                        key={s}
                        disabled={j.status === s}
                        onClick={() => update.mutate({ id: j.id, status: s })}
                        className={cn(
                          'rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:opacity-40',
                          j.status === s ? 'border-primary bg-primary text-primary-foreground' : s === 'CANCELLED' ? 'hover:border-destructive hover:text-destructive' : 'hover:border-primary hover:text-primary'
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ============ MESSAGES ============
export function AdminMessages() {
  const qc = useQueryClient()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const { data, isLoading } = useQuery<{ messages: any[] }>({
    queryKey: ['admin-messages'],
    queryFn: async () => (await fetch('/api/admin/messages')).json(),
  })

  const mark = useMutation({
    mutationFn: async ({ id, status }: any) => {
      const res = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-messages'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const messages = data?.messages ?? []

  return (
    <div className="space-y-4 animate-fade-up">
      <h1 className="flex items-center gap-2 text-xl font-black">
        <Mail size={20} className="text-primary" /> Contact Messages
        <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-600">
          {messages.filter((m) => m.status === 'NEW').length} new
        </Badge>
      </h1>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div>
      ) : messages.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-2 p-10 text-center text-muted-foreground">
          <MessageSquare size={32} /> No messages yet.
        </CardContent></Card>
      ) : (
        <div className="space-y-2.5">
          {messages.map((m) => (
            <Card key={m.id} className={cn(m.status === 'NEW' && 'border-primary/40')}>
              <button
                className="flex w-full items-start justify-between gap-3 p-4 text-left hover:bg-muted/30"
                onClick={() => {
                  setExpanded(expanded === m.id ? null : m.id)
                  if (m.status === 'NEW') mark.mutate({ id: m.id, status: 'READ' })
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={cn('mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full', m.status === 'NEW' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                    {m.status === 'NEW' ? <Mail size={16} /> : <MailOpen size={16} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{m.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.name}{m.phone ? ` • ${m.phone}` : ''}{m.email ? ` • ${m.email}` : ''}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{m.message}</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <StatusBadge status={m.status} />
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(m.createdAt).toLocaleDateString('en-KE', { dateStyle: 'medium' })}
                  </span>
                </div>
              </button>

              {expanded === m.id && (
                <div className="animate-fade-up space-y-3 border-t bg-muted/20 p-4">
                  <p className="text-sm leading-relaxed">{m.message}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => mark.mutate({ id: m.id, status: 'REPLIED' })}
                    >
                      <CheckCircle2 size={13} /> Mark as replied
                    </Button>
                    {m.phone && (
                      <a
                        href={`https://wa.me/${m.phone.replace(/\D/g, '').replace(/^0/, '254')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-emerald-500/40 px-3 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/10"
                      >
                        💬 Reply on WhatsApp
                      </a>
                    )}
                    {m.email && (
                      <a
                        href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold hover:bg-muted"
                      >
                        ✉️ Reply by email
                      </a>
                    )}
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
