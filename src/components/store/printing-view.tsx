'use client'

import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Calculator, CheckCircle2, FileText, Layers, Loader2, Palette, Printer,
  FileStack, Upload, Percent, Clock, BadgeCheck, Info,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge, kes } from '@/components/shared/ui-bits'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { PRINT_RATES, BINDING_RATES, DELIVERY_ZONES } from '@/lib/pricing'
import { cn } from '@/lib/utils'

const SIZES = ['A4', 'A3', 'A5', 'LEGAL'] as const
const BINDINGS = [
  { id: 'NONE', label: 'No binding', price: 0 },
  { id: 'STAPLE', label: 'Stapled', price: 20 },
  { id: 'TAPE', label: 'Tape bound', price: 60 },
  { id: 'SPIRAL', label: 'Spiral bound', price: 150 },
  { id: 'HARD_COVER', label: 'Hard cover thesis', price: 800 },
]

export function PrintingView() {
  const navigate = useUIStore((s) => s.navigate)
  const user = useAuthStore((s) => s.user)

  const [spec, setSpec] = useState({
    customerName: user?.name ?? '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
    documentName: '',
    pages: '100',
    copies: '1',
    paperSize: 'A4' as 'A4' | 'A3' | 'A5' | 'LEGAL',
    colorMode: 'BW' as 'BW' | 'COLOR' | 'MIXED',
    doubleSided: true,
    binding: 'SPIRAL',
    notes: '',
  })
  const { data: rateCard } = useQuery<{ PRINT_RATES: typeof PRINT_RATES; BINDING_RATES: Record<string, number> }>({
    queryKey: ['print-rates'],
    queryFn: async () => (await fetch('/api/print/calc')).json(),
    staleTime: 3600_000,
  })

  // Live quote
  const { data: quote, isFetching } = useQuery<{ price: number }>({
    queryKey: ['print-quote', spec.pages, spec.copies, spec.paperSize, spec.colorMode, spec.doubleSided, spec.binding],
    queryFn: async () => {
      const res = await fetch('/api/print/calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pages: spec.pages, copies: spec.copies, paperSize: spec.paperSize,
          colorMode: spec.colorMode, doubleSided: spec.doubleSided, binding: spec.binding,
        }),
      })
      return res.json()
    },
    keepPreviousData: true,
  })

  const submit = useMutation({
    mutationFn: async () => {
      if (!spec.customerName.trim() || !spec.phone.trim()) throw new Error('Please fill in your name and phone number')
      if (!spec.documentName.trim()) throw new Error('Please describe your document (e.g. "KCSE Past Papers.pdf")')
      if (parseInt(spec.pages) < 1) throw new Error('Pages must be at least 1')
      const res = await fetch('/api/print-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...spec,
          pages: parseInt(spec.pages),
          copies: parseInt(spec.copies),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json
    },
    onSuccess: (data) => {
      toast.success(`Print job submitted! Reference: ${data.job.reference} 🖨️`, { duration: 6000 })
      setSpec((s) => ({ ...s, documentName: '', notes: '' }))
    },
    onError: (e: any) => toast.error(e.message),
  })

  const price = quote?.price ?? 0
  const rates = rateCard?.PRINT_RATES ?? PRINT_RATES

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
          <Printer size={28} />
        </div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Printing & Binding Services</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Photocopying, printing, scanning, laminating and binding — from a single page to
          thesis-hardcover. Upload specs online, collect in 2 hours.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Calculator form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Calculator size={18} /> Get an instant quote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Contact */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="p-name">Your name *</Label>
                <Input id="p-name" value={spec.customerName} onChange={(e) => setSpec({ ...spec, customerName: e.target.value })} placeholder="e.g. Mercy Nzei" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-phone">Phone *</Label>
                <Input id="p-phone" value={spec.phone} onChange={(e) => setSpec({ ...spec, phone: e.target.value })} placeholder="07XX XXX XXX" inputMode="tel" />
              </div>
            </div>

            {/* Document */}
            <div className="space-y-1.5">
              <Label htmlFor="p-doc">Document name *</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  id="p-doc"
                  className="pl-9"
                  value={spec.documentName}
                  onChange={(e) => setSpec({ ...spec, documentName: e.target.value })}
                  placeholder="e.g. KCSE Past Papers 2020-2024.pdf"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                In this demo, just type the file name. In production this uploads to our secure print server.
              </p>
            </div>

            {/* Pages & copies */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="p-pages">Number of pages *</Label>
                <Input id="p-pages" type="number" min={1} max={2000} value={spec.pages} onChange={(e) => setSpec({ ...spec, pages: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-copies">Copies</Label>
                <Input id="p-copies" type="number" min={1} max={1000} value={spec.copies} onChange={(e) => setSpec({ ...spec, copies: e.target.value })} />
              </div>
            </div>

            {/* Paper size */}
            <div className="space-y-1.5">
              <Label>Paper size</Label>
              <div className="grid grid-cols-4 gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpec({ ...spec, paperSize: s })}
                    className={cn(
                      'rounded-lg border py-2.5 text-sm font-semibold transition-colors',
                      spec.paperSize === s ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted'
                    )}
                    aria-pressed={spec.paperSize === s}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Colour mode */}
            <div className="space-y-1.5">
              <Label>Colour mode</Label>
              <RadioGroup
                value={spec.colorMode}
                onValueChange={(v) => setSpec({ ...spec, colorMode: v as any })}
                className="grid gap-2 sm:grid-cols-3"
              >
                {[
                  { id: 'BW', label: 'Black & White', hint: `${rates.BW[spec.paperSize]}/pg`, icon: Layers },
                  { id: 'COLOR', label: 'Full Colour', hint: `${rates.COLOR[spec.paperSize]}/pg`, icon: Palette },
                  { id: 'MIXED', label: 'Mixed', hint: `${rates.MIXED[spec.paperSize]}/pg avg`, icon: FileStack },
                ].map((m) => (
                  <label
                    key={m.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 transition-colors',
                      spec.colorMode === m.id && 'border-primary bg-primary/5'
                    )}
                  >
                    <RadioGroupItem value={m.id} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-none">{m.label}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">KES {m.hint}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Double-sided */}
            <label className="flex cursor-pointer items-center justify-between rounded-lg border p-3.5">
              <div className="flex items-center gap-3">
                <Layers size={16} className="text-primary" />
                <div>
                  <p className="text-sm font-semibold">Double-sided printing</p>
                  <p className="text-xs text-muted-foreground">Save 10% on printing + half the paper</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={spec.doubleSided}
                onChange={(e) => setSpec({ ...spec, doubleSided: e.target.checked })}
                className="size-5 accent-[oklch(0.627_0.1699_149.2)]"
                aria-label="Double-sided printing"
              />
            </label>

            {/* Binding */}
            <div className="space-y-1.5">
              <Label>Binding (per copy)</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {BINDINGS.map((b) => (
                  <label
                    key={b.id}
                    className={cn(
                      'flex cursor-pointer items-center justify-between gap-2 rounded-lg border p-3 text-sm transition-colors',
                      spec.binding === b.id && 'border-primary bg-primary/5'
                    )}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <input
                        type="radio"
                        name="binding"
                        checked={spec.binding === b.id}
                        onChange={() => setSpec({ ...spec, binding: b.id })}
                        className="accent-[oklch(0.627_0.1699_149.2)]"
                      />
                      {b.label}
                    </span>
                    <span className="text-xs font-bold text-primary">{b.price ? `+KES ${b.price}` : 'Free'}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="p-notes">Special instructions (optional)</Label>
              <Textarea
                id="p-notes"
                rows={2}
                value={spec.notes}
                onChange={(e) => setSpec({ ...spec, notes: e.target.value })}
                placeholder="e.g. Pages 1–3 in colour; navy blue hard cover; print page ranges 10-40 only"
              />
            </div>

            <Button size="lg" className="w-full rounded-full" disabled={submit.isPending} onClick={() => submit.mutate()}>
              {submit.isPending ? <><Loader2 size={16} className="animate-spin" /> Submitting job…</> : <><Upload size={16} /> Submit print job — {kes(price)}</>}
            </Button>
          </CardContent>
        </Card>

        {/* Right rail */}
        <aside className="space-y-4">
          {/* Live quote */}
          <Card className="sticky top-44 border-primary/40">
            <CardContent className="p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live estimate</p>
              <p className={cn('mt-1 text-4xl font-black tracking-tight text-primary transition-all', isFetching && 'opacity-60')}>
                {kes(price)}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {spec.pages || 0} pages × {spec.copies || 1} cop{parseInt(spec.copies) === 1 ? 'y' : 'ies'} • {spec.paperSize} • {spec.colorMode === 'BW' ? 'B&W' : spec.colorMode === 'COLOR' ? 'Colour' : 'Mixed'}{spec.doubleSided ? ' • double-sided' : ''}
              </p>
              {parseInt(spec.copies) >= 5 && (
                <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                  <Percent size={11} /> Volume discount applied ({parseInt(spec.copies) >= 20 ? '12%' : '5%'})
                </p>
              )}
            </CardContent>
          </Card>

          {/* Rate card */}
          <Card>
            <CardHeader><CardTitle className="text-base">Rate card</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm" aria-label="Printing rate card">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="pb-2 font-medium">Size</th>
                    <th className="pb-2 font-medium">B&W</th>
                    <th className="pb-2 font-medium">Colour</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZES.map((s) => (
                    <tr key={s} className="border-b last:border-0">
                      <td className="py-2 font-semibold">{s}</td>
                      <td className="py-2 text-muted-foreground">KES {PRINT_RATES.BW[s]}</td>
                      <td className="py-2 text-muted-foreground">KES {PRINT_RATES.COLOR[s]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
                <Info size={13} className="mt-0.5 shrink-0" /> Double-sided gets 10% off; 5+ copies 5% off; 20+ copies 12% off.
              </p>
            </CardContent>
          </Card>

          {/* Service promises */}
          <Card>
            <CardContent className="space-y-3 p-5 text-sm">
              {[
                { icon: Clock, text: 'Most jobs ready within 2 hours' },
                { icon: BadgeCheck, text: 'Premium 80gsm paper as standard' },
                { icon: Printer, text: 'High-volume industrial printers' },
              ].map((f) => (
                <p key={f.text} className="flex items-center gap-2.5 text-muted-foreground">
                  <f.icon size={16} className="shrink-0 text-primary" /> {f.text}
                </p>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  )
}
