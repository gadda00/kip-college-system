'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  Eye,
  EyeOff,
  GraduationCap,
  Info,
  LogIn,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KipLogo } from '@/components/kip/components/kip-logo'
import { useAuthStore, portalHomeFor } from '@/components/kip/stores/auth-store'
import { navigate } from '@/components/kip/lib/router'

/** Demo credentials are only shown when explicitly enabled via env. */
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === '1'

const DEMO_ACCOUNTS = [
  {
    role: 'Admin' as const,
    icon: ShieldCheck,
    email: 'admin@kipskitui.com',
    password: 'Admin@123',
    masked: 'Admin@•••',
  },
  {
    role: 'Lecturer' as const,
    icon: GraduationCap,
    email: 'lecturer@kipskitui.com',
    password: 'Lecturer@123',
    masked: 'Lecturer@•••',
  },
  {
    role: 'Student' as const,
    icon: UserRound,
    email: 'student@kipskitui.com',
    password: 'Student@123',
    masked: 'Student@•••',
  },
  {
    role: 'Student' as const,
    icon: UserRound,
    email: 'mutune@kipskitui.com',
    password: 'Student@123',
    masked: 'Student@•••',
  },
]

export function LoginView() {
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Enter your email address and password to continue.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const user = await login(email.trim(), password)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`, {
        description: `Signed in as ${user.role.toLowerCase()}.`,
      })
      navigate(portalHomeFor(user.role))
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not sign you in — please try again.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-br from-primary via-[#123a8a] to-[#0b1f3f] py-12 sm:py-16">
      {/* subtle dot pattern */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)',
          backgroundSize: '26px 26px',
        }}
      />
      <div className="relative mx-auto flex w-full max-w-md flex-col items-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <Card className="border-white/40 shadow-2xl">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col items-center text-center">
                <KipLogo className="text-foreground" />
                <h1 className="mt-5 text-xl font-bold tracking-tight">Welcome back</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Sign in to your student, lecturer or admin portal.
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="mt-6">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  <AlertTitle>Sign-in failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@kipskitui.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError(null)
                    }}
                    className="h-11"
                    aria-invalid={Boolean(error)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setError(null)
                      }}
                      className="h-11 pr-11"
                      aria-invalid={Boolean(error)}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="h-12 w-full bg-primary text-base font-semibold shadow-md hover:bg-primary/90"
                >
                  {submitting ? (
                    <>
                      <span
                        className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground"
                        aria-hidden="true"
                      />
                      Signing in…
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
                      Sign in
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                New student?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/apply')}
                  className="font-semibold text-primary underline-offset-2 hover:underline"
                >
                  Apply for admission first
                </button>
              </p>
            </CardContent>
          </Card>

          {/* demo accounts — only shown when NEXT_PUBLIC_DEMO_MODE=1 */}
          {DEMO_MODE && (
          <Card className="mt-5 border-white/20 bg-white/95 shadow-lg dark:bg-card/95">
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" aria-hidden="true" />
                <h2 className="text-sm font-semibold">Demo accounts</h2>
                <Badge variant="secondary" className="ml-auto text-[10px]">
                  For demonstration — one-click fill
                </Badge>
              </div>
              <ul className="mt-3 divide-y">
                {DEMO_ACCOUNTS.map((account) => (
                  <li key={account.email} className="flex items-center gap-3 py-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <account.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{account.email}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {account.role} &middot; {account.masked}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 shrink-0"
                      onClick={() => {
                        setEmail(account.email)
                        setPassword(account.password)
                        setError(null)
                        toast.info('Credentials filled', {
                          description: `Press "Sign in" to continue as the ${account.role.toLowerCase()} demo user.`,
                        })
                      }}
                    >
                      Use
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}
