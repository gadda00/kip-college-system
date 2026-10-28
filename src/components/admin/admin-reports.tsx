'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  AlertTriangle, Bot, CheckCircle2, Download, FileBarChart, Loader2, Package, Sparkles, TrendingUp, Wand2, Lightbulb,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { StatusBadge, kes } from '@/components/shared/ui-bits'
import { cn } from '@/lib/utils'

// ============ REPORTS ============
export function AdminReports() {
  const [range, setRange] = useState('90')
  const { data, isLoading } = useQuery<any>({
    queryKey: ['admin-reports', range],
    queryFn: async () => (await fetch(`/api/admin/reports?range=${range}`)).json(),
  })

  const exportCSV = () => {
    if (!data?.productSales) return
    const rows = [
      ['Product', 'Units sold', 'Revenue (KES)'],
      ...data.productSales.map((p: any) => [p.name, p.qty, p.revenue]),
    ]
    const csv = rows.map((r: any[]) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kips-sales-report-${data.range}d.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Report exported as CSV')
  }

  if (isLoading || !data) {
    return <div className="flex h-48 items-center justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div>
  }

  const s = data.summary

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-black"><FileBarChart size={20} className="text-primary" /> Sales Reports</h1>
        <div className="flex gap-2">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="h-9 w-36 rounded-full" aria-label="Report date range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="rounded-full" onClick={exportCSV}>
            <Download size={15} /> Export CSV
          </Button>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Revenue', value: kes(s.revenue), sub: `${s.orderCount} paid orders` },
          { label: 'Gross profit', value: kes(s.grossProfit), sub: `COGS ${kes(s.cogs)}` },
          { label: 'Avg. order value', value: kes(s.avgOrder), sub: `${s.cancelledCount} cancelled` },
          { label: 'Delivery revenue', value: kes(s.deliveryRevenue), sub: `${s.pointsIssued} points issued` },
        ].map((t) => (
          <Card key={t.label}>
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t.label}</p>
              <p className="mt-1.5 text-2xl font-black tracking-tight text-primary">{t.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Monthly revenue trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.12} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={56} tickFormatter={(v: number) => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                  <Tooltip formatter={(v: any) => kes(v)} contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Revenue by delivery town</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.byTown.slice(0, 6)} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.12} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={0} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={56} tickFormatter={(v: number) => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                  <Tooltip formatter={(v: any) => kes(v)} contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
                  <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment split + product table */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Payment methods</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(data.byMethod).map(([m, v]: any) => {
              const total = Object.values(data.byMethod).reduce((a: any, b: any) => a + b, 0) || 1
              return (
                <div key={m}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">{m === 'MPESA' ? '📱 M-Pesa' : '💵 Cash on Delivery'}</span>
                    <span className="font-bold">{kes(v)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(v / total) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base"><Package size={16} className="text-primary" /> Product performance</CardTitle>
            <Badge variant="outline" className="text-xs">{data.range}-day window</Badge>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              <table className="w-full text-sm" aria-label="Product sales table">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="pb-2 font-medium">Product</th>
                    <th className="pb-2 font-medium">Units</th>
                    <th className="pb-2 text-right font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.productSales.map((p: any) => (
                    <tr key={p.name} className="border-b last:border-0">
                      <td className="max-w-56 truncate py-2">{p.name}</td>
                      <td className="py-2 font-semibold">{p.qty}</td>
                      <td className="py-2 text-right font-bold text-primary">{kes(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============ AI TOOLS ============
export function AdminAI() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-black">
          <Sparkles size={20} className="text-primary" /> AI Business Tools
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Demand forecasting and marketing copy powered by live shop data.
        </p>
      </div>
      <DemandForecast />
      <DescriptionGenerator />
    </div>
  )
}

function DemandForecast() {
  const { data, isLoading } = useQuery<any>({
    queryKey: ['admin-forecast'],
    queryFn: async () => (await fetch('/api/admin/ai/forecast')).json(),
  })

  if (isLoading || !data) {
    return (
      <Card>
        <CardContent className="flex h-48 items-center justify-center">
          <Loader2 size={24} className="animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  const { summary, rows } = data

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp size={16} className="text-primary" /> Inventory Demand Forecast
          <Badge variant="outline" className="border-primary/30 bg-primary/5 text-[10px] text-primary">auto-computed</Badge>
        </CardTitle>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-destructive">{summary.criticalCount} critical</Badge>
          <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-600">{summary.highCount} high</Badge>
          <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">{kes(summary.restockRevenueOpportunity)} restock opportunity</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
          <Lightbulb size={14} className="mt-0.5 shrink-0 text-primary" />
          <span>
            Based on 30-day sales velocity: <strong>{summary.totalUnits30} units sold</strong>. Products below 14 days of cover are flagged for
            reorder — restocking all critical/high items represents <strong>{kes(summary.restockRevenueOpportunity)}</strong> in potential retail sales.
          </span>
        </p>
        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          <table className="w-full text-sm" aria-label="Demand forecast table">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 font-medium">Velocity</th>
                <th className="pb-2 font-medium">Days cover</th>
                <th className="pb-2 font-medium">Reorder qty</th>
                <th className="pb-2 font-medium">Priority</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="max-w-56 truncate py-2">
                    <span className="font-medium">{r.name}</span>
                    <span className="block text-[11px] text-muted-foreground">{r.category} • {r.stock} in stock</span>
                  </td>
                  <td className="py-2 text-xs">{r.velocity}/day</td>
                  <td className="py-2 text-xs font-semibold">
                    {r.daysCover == null ? '∞' : `${r.daysCover} days`}
                  </td>
                  <td className="py-2 font-semibold">{r.reorderQty}</td>
                  <td className="py-2"><StatusBadge status={r.urgency} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function DescriptionGenerator() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [level, setLevel] = useState('')
  const [result, setResult] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  const { data: catData } = useQuery<{ categories: any[] }>({
    queryKey: ['categories'],
    queryFn: async () => (await fetch('/api/categories')).json(),
  })

  const generate = async () => {
    if (!name.trim()) {
      toast.error('Enter a product name first')
      return
    }
    setBusy(true)
    setResult('')
    setCopied(false)
    try {
      const res = await fetch('/api/admin/ai/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category: catData?.categories.find((c) => c.id === category)?.name, level }),
      })
      const json = await res.json()
      if (json.description) setResult(json.description)
      else toast.error(json.error || 'AI unavailable, try again')
    } catch {
      toast.error('Network error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Wand2 size={16} className="text-primary" /> Product Description Generator
          <Badge variant="outline" className="border-primary/30 bg-primary/5 text-[10px] text-primary">GLM powered</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Product name</Label>
            <input
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. KIPS KCSE Revision Geography"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Level (optional)</Label>
            <input
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="e.g. Form 1-4"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-3">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-72"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {catData?.categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button className="rounded-full" onClick={generate} disabled={busy}>
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Bot size={15} />} Generate description
        </Button>
        {(result || busy) && (
          <div className="space-y-2 rounded-xl border bg-muted/30 p-4">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Generated copy</Label>
            {busy ? (
              <div className="space-y-2 py-2">
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-11/12 animate-pulse rounded bg-muted" />
                <div className="h-3 w-4/6 animate-pulse rounded bg-muted" />
              </div>
            ) : (
              <>
                <p className="text-sm leading-relaxed">{result}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full"
                  onClick={() => {
                    navigator.clipboard?.writeText(result)
                    setCopied(true)
                    toast.success('Copied to clipboard')
                  }}
                >
                  {copied ? <CheckCircle2 size={13} /> : <Download size={13} />} {copied ? 'Copied' : 'Copy text'}
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
