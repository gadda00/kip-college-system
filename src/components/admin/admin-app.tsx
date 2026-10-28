'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, Boxes, Building2, DollarSign,
  Inbox, LayoutDashboard, Loader2, Mail, MessageSquare, Package, Printer, Receipt,
  ShoppingBag, Sparkles, TrendingUp, Users, Wallet, Bot, LineChart as LineIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { StatusBadge, kes } from '@/components/shared/ui-bits'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { AdminOrders } from '@/components/admin/admin-orders'
import { AdminInventory } from '@/components/admin/admin-inventory'
import { AdminBulk, AdminPrint, AdminMessages } from '@/components/admin/admin-services'
import { AdminCustomers, AdminStaff } from '@/components/admin/admin-people'
import { AdminReports, AdminAI } from '@/components/admin/admin-reports'
import { cn } from '@/lib/utils'

const PIE_COLORS = ['#10b981', '#f59e0b', '#e11d48', '#14b8a6', '#8b5cf6', '#f97316']

export type AdminSection = 'overview' | 'orders' | 'inventory' | 'bulk' | 'print' | 'customers' | 'staff' | 'messages' | 'reports' | 'ai'

const NAV: { id: AdminSection; label: string; icon: any }[] = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'bulk', label: 'School Bulk Orders', icon: Building2 },
  { id: 'print', label: 'Print Jobs', icon: Printer },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'staff', label: 'Staff', icon: Users },
  { id: 'messages', label: 'Messages', icon: Mail },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'ai', label: 'AI Tools', icon: Sparkles },
]

export function AdminApp() {
  const navigate = useUIStore((s) => s.navigate)
  const user = useAuthStore((s) => s.user)
  const [section, setSection] = useState<AdminSection>('overview')

  if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
    return (
      <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle size={30} />
        </div>
        <h1 className="text-xl font-black">Staff access only</h1>
        <p className="text-sm text-muted-foreground">
          Sign in with an admin or staff account to open the dashboard.
        </p>
        <div className="rounded-xl border border-dashed bg-muted/40 p-4 text-left text-xs">
          <p className="mb-1 font-bold">Demo accounts:</p>
          <p className="font-mono">admin@kipskitui.com / admin123</p>
          <p className="font-mono">staff@kipskitui.com / staff123</p>
        </div>
        <Button onClick={() => useUIStore.getState().setAuthOpen(true)}>Sign in</Button>
      </main>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-8.5rem)]">
      {/* Sidebar */}
      <aside className="sticky top-44 hidden h-fit w-60 shrink-0 border-r bg-muted/20 lg:block" aria-label="Admin navigation">
        <div className="space-y-1 p-3">
          <div className="mb-3 flex items-center gap-2.5 rounded-lg border bg-background p-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LayoutDashboard size={18} />
            </div>
            <div>
              <p className="text-sm font-black leading-none">KIPS Admin</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{user.role === 'ADMIN' ? 'Administrator' : 'Staff'}</p>
            </div>
          </div>
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setSection(n.id)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                section === n.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              aria-current={section === n.id ? 'page' : undefined}
            >
              <n.icon size={16} /> {n.label}
              {n.id === 'messages' && <MessagesBadge />}
              {n.id === 'bulk' && <BulkBadge />}
            </button>
          ))}
          <div className="mt-4 border-t pt-3">
            <button
              onClick={() => navigate('home')}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              ← Back to store
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile section tabs */}
      <div className="w-full min-w-0">
        <div className="sticky top-36 z-30 flex gap-1.5 overflow-x-auto border-b bg-background/95 p-2 backdrop-blur scrollbar-thin lg:hidden">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setSection(n.id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold',
                section === n.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              <n.icon size={13} /> {n.label}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">
          {section === 'overview' && <Overview onNavigate={setSection} />}
          {section === 'orders' && <AdminOrders />}
          {section === 'inventory' && <AdminInventory />}
          {section === 'bulk' && <AdminBulk />}
          {section === 'print' && <AdminPrint />}
          {section === 'customers' && <AdminCustomers />}
          {section === 'staff' && <AdminStaff />}
          {section === 'messages' && <AdminMessages />}
          {section === 'reports' && <AdminReports />}
          {section === 'ai' && <AdminAI />}
        </div>
      </div>
    </div>
  )
}

function MessagesBadge() {
  const { data } = useQuery<{ kpis?: { unreadMessages?: number } }>({
    queryKey: ['admin-stats'],
    queryFn: async () => (await fetch('/api/admin/stats')).json(),
    refetchInterval: 60_000,
  })
  const n = data?.kpis?.unreadMessages ?? 0
  if (!n) return null
  return <Badge className="ml-auto bg-destructive text-[10px]">{n}</Badge>
}

function BulkBadge() {
  const { data } = useQuery<{ kpis?: { pendingBulk?: number } }>({
    queryKey: ['admin-stats'],
    queryFn: async () => (await fetch('/api/admin/stats')).json(),
    refetchInterval: 60_000,
  })
  const n = data?.kpis?.pendingBulk ?? 0
  if (!n) return null
  return <Badge className="ml-auto bg-amber-500 text-[10px] text-white">{n}</Badge>
}

// ==================== OVERVIEW ====================
function Overview({ onNavigate }: { onNavigate: (s: AdminSection) => void }) {
  const { data, isLoading } = useQuery<any>({
    queryKey: ['admin-stats'],
    queryFn: async () => (await fetch('/api/admin/stats')).json(),
  })

  if (isLoading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    )
  }

  const k = data.kpis
  const up = k.revenueChange >= 0

  return (
    <div className="space-y-6 animate-fade-up">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          icon={DollarSign}
          label="Revenue (30 days)"
          value={kes(k.revenue30)}
          change={k.revenueChange}
          up={up}
        />
        <KPICard icon={ShoppingBag} label="Orders (30 days)" value={String(k.orders30)} sub={`${k.orders7} in last 7 days`} />
        <KPICard icon={Wallet} label="Avg. order value" value={kes(k.avgOrder)} sub={`${k.customers} customers`} />
        <KPICard
          icon={Boxes}
          label="Inventory value"
          value={kes(k.inventoryValue)}
          sub={`${k.productCount} active products`}
          alert={k.lowStockCount > 0 ? `${k.lowStockCount} low-stock items` : undefined}
          onClick={() => onNavigate('inventory')}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp size={16} className="text-primary" /> Revenue — last 14 days
            </CardTitle>
            <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
              {up ? <ArrowUpRight size={11} className="mr-0.5" /> : <ArrowDownRight size={11} className="mr-0.5" />}
              {Math.abs(k.revenueChange)}% vs prev 30d
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.days} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.12} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={56} tickFormatter={(v: number) => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                  <Tooltip
                    formatter={(v: any, n: string) => [n === 'revenue' ? kes(v) : v, n === 'revenue' ? 'Revenue' : 'Orders']}
                    contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt size={16} className="text-primary" /> Sales by category (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categorySales}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {data.categorySales.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: any) => kes(v)}
                    contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 space-y-1.5 text-xs">
              {data.categorySales.slice(0, 5).map((c: any, i: number) => (
                <li key={c.name} className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="flex-1 truncate text-muted-foreground">{c.name}</span>
                  <span className="font-semibold">{kes(c.value)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Ops alerts + top products */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Ops status */}
        <Card>
          <CardHeader><CardTitle className="text-base">Operations pulse</CardTitle></CardHeader>
          <CardContent className="space-y-3.5">
            <OpsRow icon={Building2} label="Pending bulk quotes" value={k.pendingBulk} onClick={() => onNavigate('bulk')} />
            <OpsRow icon={Printer} label="Active print jobs" value={k.activePrintJobs} onClick={() => onNavigate('print')} />
            <OpsRow icon={Mail} label="Unread messages" value={k.unreadMessages} onClick={() => onNavigate('messages')} />
            <OpsRow icon={AlertTriangle} label="Low stock items" value={k.lowStockCount} onClick={() => onNavigate('inventory')} danger={k.lowStockCount > 0} />
            <OpsRow icon={Users} label="New customers (30d)" value={k.newCustomers30} onClick={() => onNavigate('customers')} />
          </CardContent>
        </Card>

        {/* Top products */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package size={16} className="text-primary" /> Top products by revenue (30d)
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('reports')}>Full report</Button>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.topProducts.map((p: any, i: number) => {
                const max = data.topProducts[0]?.revenue || 1
                return (
                  <li key={p.name} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{i + 1}</span>
                        <span className="truncate font-medium">{p.name}</span>
                      </span>
                      <span className="shrink-0 font-bold text-primary">{kes(p.revenue)}</span>
                    </div>
                    <Progress value={(p.revenue / max) * 100} className="h-1.5" />
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Inbox size={16} className="text-primary" /> Latest orders
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('orders')}>Manage all</Button>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {data.recentOrders.map((o: any) => (
            <button
              key={o.id}
              onClick={() => onNavigate('orders')}
              className="flex w-full flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-left text-sm hover:border-primary/40"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-primary">{o.orderNumber}</span>
                <span className="hidden text-muted-foreground sm:inline">{o.customer}</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={o.status} />
                <StatusBadge status={o.paymentStatus} />
                <span className="font-bold">{kes(o.total)}</span>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function KPICard({
  icon: Icon, label, value, change, sub, up, alert, onClick,
}: {
  icon: any; label: string; value: string; change?: number; sub?: string; up?: boolean; alert?: string; onClick?: () => void
}) {
  return (
    <Card className={cn('transition-shadow', onClick && 'cursor-pointer hover:shadow-md')} onClick={onClick}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon size={17} />
          </div>
        </div>
        <p className="mt-2 text-2xl font-black tracking-tight">{value}</p>
        <div className="mt-1 flex items-center gap-1.5 text-xs">
          {change !== undefined && (
            <span className={cn('flex items-center gap-0.5 font-bold', up ? 'text-emerald-600' : 'text-destructive')}>
              {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(change)}%
            </span>
          )}
          {sub && <span className="text-muted-foreground">{sub}</span>}
          {alert && <span className="flex items-center gap-1 font-semibold text-amber-600"><AlertTriangle size={11} /> {alert}</span>}
        </div>
      </CardContent>
    </Card>
  )
}

function OpsRow({ icon: Icon, label, value, onClick, danger }: { icon: any; label: string; value: number; onClick?: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-muted">
      <span className="flex items-center gap-2.5 text-muted-foreground">
        <Icon size={15} className={danger ? 'text-amber-600' : 'text-primary'} /> {label}
      </span>
      <span className={cn('font-black', danger && value > 0 ? 'text-amber-600' : '')}>{value}</span>
    </button>
  )
}
