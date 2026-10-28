'use client'

import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  BadgeCheck, Building2, CheckCircle2, FileText, GraduationCap, Loader2, Plus,
  ShoppingCart, Trash2, Truck, Percent, Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge, kes, EmptyState } from '@/components/shared/ui-bits'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { DELIVERY_ZONES } from '@/lib/pricing'

type BulkItem = { name: string; qty: string; note?: string }

export function BulkOrderView() {
  const navigate = useUIStore((s) => s.navigate)
  const user = useAuthStore((s) => s.user)
  const [form, setForm] = useState({
    schoolName: user?.schoolName ?? '',
    contactPerson: user?.name ?? '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
    level: '',
    deliveryTown: 'kitui-town',
    notes: '',
  })
  const [items, setItems] = useState<BulkItem[]>([{ name: '', qty: '' }])

  const { data: myBulk } = useQuery<{ bulkOrders: any[] }>({
    queryKey: ['my-bulk-orders'],
    queryFn: async () => (await fetch('/api/bulk-orders')).json(),
    enabled: !!user,
  })

  const submit = useMutation({
    mutationFn: async () => {
      const validItems = items.filter((i) => i.name.trim() && parseInt(i.qty) > 0)
      if (!form.schoolName.trim() || !form.contactPerson.trim() || !form.phone.trim()) {
        throw new Error('Please fill in school name, contact person and phone number')
      }
      if (validItems.length === 0) throw new Error('Add at least one item with a quantity')
      const res = await fetch('/api/bulk-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items: validItems }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json
    },
    onSuccess: (data) => {
      toast.success('Bulk order submitted! We will send your quote within 24 hours. 🎓')
      setItems([{ name: '', qty: '' }])
    },
    onError: (e: any) => toast.error(e.message),
  })

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <GraduationCap size={28} />
        </div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">School Bulk Orders</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Schools, colleges and book re-sellers — submit your book & stationery lists and receive an
          official quotation with a <strong className="text-primary">5% institutional discount</strong>.
        </p>
      </div>

      {/* Benefits strip */}
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {[
          { icon: Percent, title: '5% school discount', desc: 'On all quoted bulk orders' },
          { icon: BadgeCheck, title: 'Teacher references', desc: 'Free copies on 50+ book orders' },
          { icon: Truck, title: 'Free delivery', desc: 'To schools within Kitui Town' },
        ].map((b) => (
          <Card key={b.title}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <b.icon size={19} />
              </div>
              <div>
                <p className="text-sm font-bold">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Form */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><FileText size={18} /> Request a quotation</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="b-school">School / institution name *</Label>
                <Input id="b-school" value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} placeholder="e.g. Kitui School" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="b-contact">Contact person *</Label>
                <Input id="b-contact" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} placeholder="e.g. Bursar / Deputy Principal" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="b-phone">Phone *</Label>
                <Input id="b-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="07XX XXX XXX" inputMode="tel" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="b-email">Email (optional)</Label>
                <Input id="b-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="bursar@school.ac.ke" />
              </div>
              <div className="space-y-1.5">
                <Label>Class / level</Label>
                <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v === 'none' ? '' : v })}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not specified</SelectItem>
                    {['PP1-PP2', 'Grade 1-6', 'Grade 7-9', 'Form 1-4', 'Mixed levels', 'College/University'].map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Delivery town</Label>
                <Select value={form.deliveryTown} onValueChange={(v) => setForm({ ...form, deliveryTown: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DELIVERY_ZONES.map((z) => (
                      <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold">Order list *</Label>
                <span className="text-xs text-muted-foreground">Type item names — we match our catalogue for instant estimates</span>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={item.name}
                    onChange={(e) => setItems(items.map((it, i) => (i === idx ? { ...it, name: e.target.value } : it)))}
                    placeholder={`Item ${idx + 1} — e.g. KIPS KCSE Mathematics`}
                    aria-label={`Item ${idx + 1} name`}
                  />
                  <Input
                    value={item.qty}
                    onChange={(e) => setItems(items.map((it, i) => (i === idx ? { ...it, qty: e.target.value.replace(/\D/g, '') } : it)))}
                    placeholder="Qty"
                    className="w-24"
                    inputMode="numeric"
                    aria-label={`Item ${idx + 1} quantity`}
                  />
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => setItems(items.filter((_, i) => i !== idx))}
                      aria-label={`Remove item ${idx + 1}`}
                    >
                      <Trash2 size={15} />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full border-dashed"
                onClick={() => setItems([...items, { name: '', qty: '' }])}
              >
                <Plus size={15} /> Add another item
              </Button>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="b-notes">Notes (optional)</Label>
              <Textarea
                id="b-notes"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. Deliver before opening day; invoice to school account; LPO attached"
              />
            </div>

            <Button
              size="lg"
              className="w-full rounded-full"
              disabled={submit.isPending}
              onClick={() => submit.mutate()}
            >
              {submit.isPending ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : <><ShoppingCart size={16} /> Submit & get quotation</>}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Quotations are typically delivered within 24 hours via phone/WhatsApp or email.
            </p>
          </CardContent>
        </Card>

        {/* Right rail: my requests + how it works */}
        <aside className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">How it works</CardTitle></CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm">
                {[
                  'Submit your book/stationery list here',
                  'We send an official quotation (usually within 24h)',
                  'Approve by phone, WhatsApp or email',
                  'We pack & deliver; pay by cheque, M-Pesa or on invoice',
                ].map((s, i) => (
                  <li key={s} className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                    <span className="text-muted-foreground">{s}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {user && myBulk?.bulkOrders && myBulk.bulkOrders.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">My bulk requests</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="max-h-80 space-y-3 overflow-y-auto pr-1 scrollbar-thin">
                  {myBulk.bulkOrders.slice(0, 6).map((b: any) => {
                    const items: any[] = JSON.parse(b.itemsJson || '[]')
                    return (
                      <div key={b.id} className="rounded-lg border p-3 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-primary">{b.reference}</span>
                          <StatusBadge status={b.status} />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {b.schoolName} • {items.length} items
                        </p>
                        {b.quotedTotal != null && (
                          <p className="mt-1 text-xs font-semibold">Quote: {kes(b.quotedTotal)}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex items-start gap-3 p-4 text-sm">
              <Sparkles size={17} className="mt-0.5 shrink-0 text-primary" />
              <p className="text-muted-foreground">
                <strong className="text-foreground">Demo tip:</strong> sign in as <code className="rounded bg-muted px-1">school@demo.com</code> / <code className="rounded bg-muted px-1">demo123</code> to see the school portal experience with saved requests.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  )
}
