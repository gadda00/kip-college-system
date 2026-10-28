'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle, Boxes, Loader2, Package, PackagePlus, Pencil, Plus, Save, Search, Sparkles, Trash2, X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { StatusBadge, kes } from '@/components/shared/ui-bits'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

const emptyForm = {
  name: '', categoryId: '', price: '', costPrice: '', stock: '', lowStockAt: '15',
  brand: '', level: '', subject: '', description: '', image: '', isFeatured: false, isActive: true,
}

export function AdminInventory() {
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<any | null>(null) // product object or 'new'
  const [form, setForm] = useState({ ...emptyForm })
  const [aiBusy, setAiBusy] = useState(false)

  const { data, isLoading } = useQuery<{ products: any[]; categories: any[] }>({
    queryKey: ['admin-inventory', q],
    queryFn: async () => (await fetch(`/api/admin/products${q ? `?q=${encodeURIComponent(q)}` : ''}`)).json(),
  })

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
        costPrice: parseFloat(form.costPrice) || 0,
        stock: parseInt(form.stock) || 0,
        lowStockAt: parseInt(form.lowStockAt) || 15,
      }
      const res = await fetch(editing === 'new' ? '/api/admin/products' : `/api/admin/products/${editing.id}`, {
        method: editing === 'new' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json
    },
    onSuccess: () => {
      toast.success(editing === 'new' ? 'Product added to catalogue' : 'Product updated')
      setEditing(null)
      qc.invalidateQueries({ queryKey: ['admin-inventory'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (e: any) => toast.error(e.message),
  })

  const quickStock = useMutation({
    mutationFn: async ({ id, delta }: { id: string; delta: number }) => {
      const prod = data?.products.find((p) => p.id === id)
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: Math.max(0, (prod?.stock ?? 0) + delta) }),
      })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-inventory'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      return res.json()
    },
    onSuccess: (d) => {
      toast.success(d.deleted ? 'Product deleted' : d.softDeleted ? 'Product has order history — deactivated instead' : 'Product deactivated')
      qc.invalidateQueries({ queryKey: ['admin-inventory'] })
      qc.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const openEdit = (p: any) => {
    setEditing(p)
    setForm({
      name: p.name,
      categoryId: p.categoryId,
      price: String(p.price),
      costPrice: String(p.costPrice),
      stock: String(p.stock),
      lowStockAt: String(p.lowStockAt),
      brand: p.brand ?? '',
      level: p.level ?? '',
      subject: p.subject ?? '',
      description: p.description,
      image: p.image ?? '',
      isFeatured: p.isFeatured,
      isActive: p.isActive,
    })
  }

  const generateDescription = async () => {
    if (!form.name) {
      toast.error('Enter a product name first')
      return
    }
    setAiBusy(true)
    try {
      const cat = data?.categories.find((c) => c.id === form.categoryId)
      const res = await fetch('/api/admin/ai/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, category: cat?.name, level: form.level, subject: form.subject, brand: form.brand, price: form.price,
        }),
      })
      const json = await res.json()
      if (json.description) {
        setForm((f) => ({ ...f, description: json.description }))
        toast.success('AI description generated ✨')
      } else toast.error(json.error || 'AI unavailable')
    } finally {
      setAiBusy(false)
    }
  }

  const products = data?.products ?? []
  const lowCount = products.filter((p) => p.stock <= p.lowStockAt && p.isActive).length

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-black">
            <Boxes size={20} className="text-primary" /> Inventory
            {lowCount > 0 && (
              <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-600">
                <AlertTriangle size={11} className="mr-1" /> {lowCount} low stock
              </Badge>
            )}
          </h1>
          <p className="text-xs text-muted-foreground">{products.length} products • {kes(products.reduce((s, p) => s + p.price * p.stock, 0))} retail value</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search inventory…" className="h-9 w-52 rounded-full pl-9" aria-label="Search inventory" />
          </div>
          <Button className="rounded-full" onClick={() => { setEditing('new'); setForm({ ...emptyForm }) }}>
            <Plus size={15} /> Add product
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm" aria-label="Inventory table">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="p-3 font-medium">Product</th>
                    <th className="p-3 font-medium">Category</th>
                    <th className="p-3 font-medium">Price</th>
                    <th className="p-3 font-medium">Margin</th>
                    <th className="p-3 font-medium">Stock</th>
                    <th className="p-3 font-medium">Sold</th>
                    <th className="p-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const margin = p.price > 0 ? Math.round(((p.price - p.costPrice) / p.price) * 100) : 0
                    const low = p.stock <= p.lowStockAt
                    return (
                      <tr key={p.id} className={cn('border-b last:border-0 hover:bg-muted/20', !p.isActive && 'opacity-50')}>
                        <td className="max-w-64 p-3">
                          <p className="truncate font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.sku}{p.brand ? ` • ${p.brand}` : ''}{p.level ? ` • ${p.level}` : ''}</p>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">{p.category?.name}</td>
                        <td className="p-3 font-semibold text-primary">{kes(p.price)}</td>
                        <td className="p-3 text-xs">
                          <span className={cn('font-semibold', margin >= 25 ? 'text-emerald-600' : 'text-amber-600')}>{margin}%</span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              className="flex size-6 items-center justify-center rounded-full border text-xs hover:bg-muted"
                              onClick={() => quickStock.mutate({ id: p.id, delta: -1 })}
                              aria-label={`Decrease stock of ${p.name}`}
                            >−</button>
                            <span className={cn('w-10 text-center font-bold', low ? 'text-amber-600' : '')}>{p.stock}</span>
                            <button
                              className="flex size-6 items-center justify-center rounded-full border text-xs hover:bg-muted"
                              onClick={() => quickStock.mutate({ id: p.id, delta: 10 })}
                              aria-label={`Add 10 to stock of ${p.name}`}
                            >+</button>
                            {low && <AlertTriangle size={13} className="text-amber-600" aria-label="Low stock" />}
                          </div>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">{p.sold}</td>
                        <td className="p-3">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(p)} aria-label={`Edit ${p.name}`}>
                              <Pencil size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-destructive"
                              onClick={() => remove.mutate(p.id)}
                              aria-label={`Deactivate ${p.name}`}
                              disabled={user?.role !== 'ADMIN' && user?.role !== 'STAFF'}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product editor dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editing === 'new' ? <><PackagePlus size={18} className="text-primary" /> Add new product</> : <><Pencil size={16} /> Edit product</>}
            </DialogTitle>
            <DialogDescription>
              {editing === 'new' ? 'Add an item to the storefront catalogue.' : editing?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Product name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. KIPS KCSE Revision Geography" />
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {data?.categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Brand / publisher</Label>
              <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Moran Publishers" />
            </div>
            <div className="space-y-1.5">
              <Label>Retail price (KES) *</Label>
              <Input type="number" min={1} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="850" />
            </div>
            <div className="space-y-1.5">
              <Label>Cost price (KES)</Label>
              <Input type="number" min={0} value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} placeholder="600" />
            </div>
            <div className="space-y-1.5">
              <Label>Stock quantity</Label>
              <Input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="50" />
            </div>
            <div className="space-y-1.5">
              <Label>Low-stock alert level</Label>
              <Input type="number" min={0} value={form.lowStockAt} onChange={(e) => setForm({ ...form, lowStockAt: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Level / class</Label>
              <Input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} placeholder="e.g. Grade 4, Form 1-4" />
            </div>
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Mathematics" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Image URL (optional — blank generates a stylish cover)</Label>
              <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://…" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex items-center justify-between">
                <Label>Description</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 border-primary/40 text-primary"
                  onClick={generateDescription}
                  disabled={aiBusy}
                >
                  {aiBusy ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Generate with AI
                </Button>
              </div>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Marketing description for the storefront…" />
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <Checkbox checked={form.isFeatured} onCheckedChange={(v) => setForm({ ...form, isFeatured: !!v })} />
              Show as featured / bestseller on homepage
            </label>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <Checkbox checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: !!v })} />
              Visible in storefront (active)
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}><X size={15} /> Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name || !form.categoryId || !form.price}>
              {save.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {editing === 'new' ? 'Add product' : 'Save changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
