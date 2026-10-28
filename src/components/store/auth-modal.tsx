'use client'

import { useState } from 'react'
import { GraduationCap, Loader2, LogIn, Sparkles, User, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { KipsLogo } from '@/components/store/header'
import { cn } from '@/lib/utils'

const DEMO_ACCOUNTS = [
  { icon: User, label: 'Customer', email: 'customer@demo.com', password: 'demo123', hint: 'Shop, order & track' },
  { icon: GraduationCap, label: 'School', email: 'school@demo.com', password: 'demo123', hint: 'Bulk order portal' },
  { icon: Sparkles, label: 'Staff', email: 'staff@kipskitui.com', password: 'staff123', hint: 'Orders & printing ops' },
  { icon: Sparkles, label: 'Admin', email: 'admin@kipskitui.com', password: 'admin123', hint: 'Full dashboard' },
]

export function AuthModal() {
  const { authOpen, setAuthOpen } = useUIStore()
  const navigate = useUIStore((s) => s.navigate)
  const { login, register, loading } = useAuthStore()

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [regForm, setRegForm] = useState({
    name: '', email: '', password: '', phone: '', town: '',
    role: 'CUSTOMER' as 'CUSTOMER' | 'SCHOOL', schoolName: '',
  })

  const doLogin = async (email?: string, password?: string) => {
    const creds = email && password ? { email, password } : loginForm
    const res = await login(creds.email, creds.password)
    if (res.ok) {
      toast.success('Karibu! You are signed in. 👋')
      setAuthOpen(false)
      setLoginForm({ email: '', password: '' })
    } else {
      toast.error(res.error)
    }
  }

  const doRegister = async () => {
    if (!regForm.name || !regForm.email || !regForm.password) {
      toast.error('Please fill in all required fields')
      return
    }
    const res = await register(regForm)
    if (res.ok) {
      toast.success('Account created — karibu KIPS Kitui! 🎉')
      setAuthOpen(false)
    } else {
      toast.error(res.error)
    }
  }

  return (
    <Dialog open={authOpen} onOpenChange={setAuthOpen}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex justify-center"><KipsLogo /></div>
          <DialogTitle className="text-center text-xl">
            Welcome to KIPS Kitui
          </DialogTitle>
          <DialogDescription className="text-center">
            Sign in to track orders, save wishlists and earn loyalty points.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="gap-1.5"><LogIn size={14} /> Sign In</TabsTrigger>
            <TabsTrigger value="register" className="gap-1.5"><UserPlus size={14} /> Create Account</TabsTrigger>
          </TabsList>

          {/* LOGIN */}
          <TabsContent value="login" className="space-y-4 pt-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="li-email">Email</Label>
                <Input
                  id="li-email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="you@example.com"
                  onKeyDown={(e) => e.key === 'Enter' && doLogin()}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="li-pass">Password</Label>
                <Input
                  id="li-pass"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                  onKeyDown={(e) => e.key === 'Enter' && doLogin()}
                />
              </div>
            </div>
            <Button className="w-full" size="lg" disabled={loading} onClick={() => doLogin()}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />} Sign in
            </Button>

            {/* Demo accounts */}
            <div className="rounded-xl border border-dashed bg-muted/40 p-3">
              <p className="mb-2 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                ⚡ Demo accounts — one-click sign in
              </p>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((d) => (
                  <button
                    key={d.label}
                    onClick={() => doLogin(d.email, d.password)}
                    disabled={loading}
                    className="group flex flex-col items-start gap-0.5 rounded-lg border bg-background p-2.5 text-left transition-all hover:border-primary hover:shadow-sm"
                  >
                    <span className="flex items-center gap-1.5 text-xs font-bold">
                      <d.icon size={13} className="text-primary" /> {d.label}
                    </span>
                    <span className="text-[10px] leading-tight text-muted-foreground">{d.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* REGISTER */}
          <TabsContent value="register" className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label>Account type</Label>
              <RadioGroup
                value={regForm.role}
                onValueChange={(v) => setRegForm({ ...regForm, role: v as any })}
                className="grid grid-cols-2 gap-2"
              >
                <label className={cn('flex cursor-pointer items-center gap-2.5 rounded-lg border p-3', regForm.role === 'CUSTOMER' && 'border-primary bg-primary/5')}>
                  <RadioGroupItem value="CUSTOMER" />
                  <span className="text-sm font-medium">👤 Personal</span>
                </label>
                <label className={cn('flex cursor-pointer items-center gap-2.5 rounded-lg border p-3', regForm.role === 'SCHOOL' && 'border-primary bg-primary/5')}>
                  <RadioGroupItem value="SCHOOL" />
                  <span className="text-sm font-medium">🏫 School</span>
                </label>
              </RadioGroup>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="rg-name">Full name *</Label>
                <Input id="rg-name" value={regForm.name} onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} placeholder="Jane Mwangi" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rg-phone">Phone</Label>
                <Input id="rg-phone" value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} placeholder="07XX XXX XXX" inputMode="tel" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="rg-email">Email *</Label>
                <Input id="rg-email" type="email" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} placeholder="you@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rg-pass">Password *</Label>
                <Input id="rg-pass" type="password" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} placeholder="At least 6 characters" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rg-town">Town</Label>
                <Input id="rg-town" value={regForm.town} onChange={(e) => setRegForm({ ...regForm, town: e.target.value })} placeholder="e.g. Kitui" />
              </div>
              {regForm.role === 'SCHOOL' && (
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="rg-school">School name</Label>
                  <Input id="rg-school" value={regForm.schoolName} onChange={(e) => setRegForm({ ...regForm, schoolName: e.target.value })} placeholder="e.g. St. Angela Girls Secondary" />
                </div>
              )}
            </div>

            <Button className="w-full" size="lg" disabled={loading} onClick={doRegister}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} Create my account
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              By creating an account you agree to our fair-use terms. Loyalty points earned on every order!
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
