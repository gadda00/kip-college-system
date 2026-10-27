'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Award, Building2, Loader2, Phone, Search, Star, UserPlus, Users, MapPin, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { StatusBadge, kes } from '@/components/shared/ui-bits'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

// ============ CUSTOMERS ============
export function AdminCustomers() {
  const [q, setQ] = useState('')
  const { data, isLoading } = useQuery<{ customers: any[] }>({
    queryKey: ['admin-customers', q],
    queryFn: async () => (await fetch(`/api/admin/customers${q ? `?q=${encodeURIComponent(q)}` : ''}`)).json(),
  })

  const customers = (data?.customers ?? []).filter(
    (c) => !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.email.toLowerCase().includes(q.toLowerCase()) || (c.phone ?? '').includes(q)
  )
  const totalLoyalty = customers.reduce((s, c) => s + c.loyaltyPoints, 0)
  const totalSpent = customers.reduce((s, c) => s + c.totalSpent, 0)

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-black"><Users size={20} className="text-primary" /> Customers</h1>
          <p className="text-xs text-muted-foreground">
            {customers.length} accounts • {kes(totalSpent)} lifetime spend • {totalLoyalty} loyalty points outstanding
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers…" className="h-9 w-56 rounded-full pl-9" aria-label="Search customers" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm" aria-label="Customers table">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="p-3 font-medium">Customer</th>
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Orders</th>
                    <th className="p-3 font-medium">Total spent</th>
                    <th className="p-3 font-medium">Loyalty</th>
                    <th className="p-3 font-medium">Last order</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="p-3">
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                        {c.phone && <p className="flex items-center gap-1 text-xs text-muted-foreground"><Phone size={10} /> {c.phone}</p>}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className={c.role === 'SCHOOL' ? 'border-primary/40 bg-primary/10 text-primary' : ''}>
                          {c.role === 'SCHOOL' ? '🏫 School' : '👤 Personal'}
                        </Badge>
                      </td>
                      <td className="p-3 font-semibold">{c.orderCount}</td>
                      <td className="p-3 font-bold text-primary">{kes(c.totalSpent)}</td>
                      <td className="p-3">
                        <span className="flex items-center gap-1 font-semibold text-amber-600">
                          <Star size={12} className="fill-current" /> {c.loyaltyPoints}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============ STAFF ============
export function AdminStaff() {
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', position: '', department: 'Sales', shift: 'MORNING', salary: '', password: '' })

  const { data, isLoading } = useQuery<{ staff: any[] }>({
    queryKey: ['admin-staff'],
    queryFn: async () => (await fetch('/api/admin/staff')).json(),
  })

  const add = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json
    },
    onSuccess: () => {
      toast.success('Staff member added — they can now sign in with their credentials')
      setAddOpen(false)
      setForm({ name: '', email: '', phone: '', position: '', department: 'Sales', shift: 'MORNING', salary: '', password: '' })
      qc.invalidateQueries({ queryKey: ['admin-staff'] })
    },
    onError: (e: any) => toast.error(e.message),
  })

  const update = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/admin/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json
    },
    onSuccess: () => {
      toast.success('Staff profile updated')
      qc.invalidateQueries({ queryKey: ['admin-staff'] })
    },
    onError: (e: any) => toast.error(e.message),
  })

  const staff = data?.staff ?? []

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-black"><Users size={20} className="text-primary" /> Staff Directory</h1>
          <p className="text-xs text-muted-foreground">{staff.length} team members at KIPS Kitui</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button className="rounded-full" onClick={() => setAddOpen(true)}>
            <UserPlus size={15} /> Add staff
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {staff.map((s) => (
            <Card key={s.id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center gap-3">
                  <div className={cn('flex size-12 items-center justify-center rounded-full text-lg font-black', s.role === 'ADMIN' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary')}>
                    {s.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.profile?.position ?? (s.role === 'ADMIN' ? 'Administrator' : 'Staff')}</p>
                    {s.role === 'ADMIN' && <Badge variant="outline" className="mt-1 border-primary/40 bg-primary/10 text-[10px] text-primary">Admin</Badge>}
                  </div>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5"><Mail size={12} /> {s.email}</p>
                  {s.phone && <p className="flex items-center gap-1.5"><Phone size={12} /> {s.phone}</p>}
                  {s.profile && (
                    <>
                      <p className="flex items-center gap-1.5"><Building2 size={12} /> {s.profile.department}</p>
                      {s.profile.salary != null && <p className="flex items-center gap-1.5"><Award size={12} /> {kes(s.profile.salary)}/month</p>}
                    </>
                  )}
                </div>
                {s.profile && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {['MORNING', 'AFTERNOON', 'EVENING'].map((shift) => (
                      <button
                        key={shift}
                        onClick={() => update.mutate({ id: s.id, shift })}
                        disabled={update.isPending}
                        className={cn(
                          'rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors',
                          s.profile?.shift === shift ? 'border-primary bg-primary text-primary-foreground' : 'hover:border-primary hover:text-primary'
                        )}
                      >
                        {shift}
                      </button>
                    ))}
                    <button
                      onClick={() => update.mutate({ id: s.id, status: s.profile?.status === 'ACTIVE' ? 'ON_LEAVE' : 'ACTIVE' })}
                      className="ml-auto"
                    >
                      <StatusBadge status={s.profile?.status ?? 'ACTIVE'} />
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add staff dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserPlus size={17} className="text-primary" /> Add staff member</DialogTitle>
            <DialogDescription>They will be able to sign in and manage orders, printing and inventory.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Full name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. James Kavoi" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="07XX XXX XXX" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Email (login) *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="james@kipskitui.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Password *</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Temporary password" />
            </div>
            <div className="space-y-1.5">
              <Label>Position *</Label>
              <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="e.g. Sales Attendant" />
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Sales', 'Printing', 'Inventory', 'Accounts', 'Delivery'].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Shift</Label>
              <Select value={form.shift} onValueChange={(v) => setForm({ ...form, shift: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['MORNING', 'AFTERNOON', 'EVENING'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Monthly salary (KES, optional)</Label>
              <Input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="25000" />
            </div>
          </div>
          <Button className="w-full" disabled={add.isPending || !form.name || !form.email || !form.position || !form.password} onClick={() => add.mutate()}>
            {add.isPending ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />} Create staff account
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
