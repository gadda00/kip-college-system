'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  BadgeCheck,
  Banknote,
  Eye,
  EyeOff,
  Info,
  LogIn,
  MapPin,
  Quote,
  ShieldCheck,
  GraduationCap,
  UserRound,
} from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KipLogo } from '@/components/kip/components/kip-logo'
import { useAuthStore, portalHomeFor } from '@/components/kip/stores/auth-store'
import { navigate } from '@/components/kip/lib/router'
import { cn } from '@/lib/utils'

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

const DEMO_ROLES = ['Student', 'Lecturer', 'Admin'] as const

/** Gold-bullet trust points on the emerald brand panel. */
const TRUST_POINTS = [
  {
    icon: BadgeCheck,
    title: 'KASNEB-examined programmes',
    text: 'Professional and technical courses examined by KASNEB, KNEC, CDACC and NITA.',
  },
  {
    icon: MapPin,
    title: 'Three campuses',
    text: 'Kitui Main, Kitui Town and Mwingi — study close to home.',
  },
  {
    icon: Banknote,
    title: 'Flexible fees',
    text: 'Pay by instalment via M-Pesa, bank or cash — intakes every January, May and September.',
  },
]

export function LoginView() {
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [demoRole, setDemoRole] = useState<(typeof DEMO_ROLES)[number]>('Student')

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

  const fillDemoAccount = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setEmail(account.email)
    setPassword(account.password)
    setError(null)
    toast.info('Credentials filled', {
      description: `Press "Sign in" to continue as the ${account.role.toLowerCase()} demo user.`,
    })
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-background lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* ── mobile brand band ── */}
      <div className="relative overflow-hidden bg-brand-band lg:hidden">
        <div aria-hidden="true" className="kip-pattern absolute inset-0" />
        <div className="relative flex items-center justify-between px-4 py-4 sm:px-6">
          <KipLogo className="text-[#f2efe6]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold-300">
            Portal sign-in
          </span>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-gold-500 via-gold-400 to-transparent"
        />
      </div>

      {/* ── left: emerald brand panel (lg+) ── */}
      <aside className="bg-brand-band kip-pattern kip-grain relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-12 xl:px-16">
        {/* corner gold glows */}
        <div
          aria-hidden="true"
          className="absolute -right-28 -top-28 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-brand-600/25 blur-3xl"
        />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative"
        >
          <KipLogo className="text-[#f2efe6]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          className="relative max-w-md"
        >
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold-300">
            Student · Lecturer · Admin
          </p>
          <p className="font-display mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight text-[#f2efe6] xl:text-4xl">
            Welcome back to <em className="text-gold-gradient italic">excellence</em>.
          </p>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-[#f2efe6]/70 sm:text-base">
            Karibu tena — one sign-in for the student, lecturer and admin portals. Your classes,
            results and fees are waiting.
          </p>

          <ul className="mt-10 space-y-4">
            {TRUST_POINTS.map((point) => (
              <li key={point.title} className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-400/15 text-gold-300 ring-1 ring-gold-400/30">
                  <point.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#f2efe6]">{point.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#f2efe6]/60">{point.text}</p>
                </div>
              </li>
            ))}
          </ul>

          <figure className="relative mt-10 rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
            <Quote className="h-5 w-5 text-gold-400" aria-hidden="true" />
            <blockquote className="mt-3 text-sm italic leading-relaxed text-[#f2efe6]/85">
              “Flexible instalments and understanding lecturers carried me through CPA while I
              worked — they walk with you until you pass.”
            </blockquote>
            <figcaption className="mt-3 text-xs font-medium text-[#f2efe6]/60">
              CPA Student · Kitui Town Campus
            </figcaption>
          </figure>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="relative flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#f2efe6]/60"
        >
          <a href="tel:+254703710879" className="transition-colors hover:text-gold-300">
            0703 710 879
          </a>
          <span aria-hidden="true" className="text-gold-400/60">
            ·
          </span>
          <a href="mailto:info@kipskitui.com" className="transition-colors hover:text-gold-300">
            info@kipskitui.com
          </a>
        </motion.div>
      </aside>

      {/* ── right: sign-in form on warm paper ── */}
      <div className="relative flex flex-col justify-center bg-background px-4 py-12 sm:px-8 lg:px-10 lg:py-14 xl:px-16">
        {/* faint dot texture on the paper side */}
        <div
          aria-hidden="true"
          className="kip-dots absolute inset-x-0 top-0 h-40 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative mx-auto w-full max-w-md"
        >
          <div>
            <p className="eyebrow">Portal sign-in</p>
            <h1 className="mt-2 text-balance text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
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
                  className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
              className="btn-gold h-12 w-full min-h-11 text-base font-semibold"
            >
              {submitting ? (
                <>
                  <span
                    className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-brand-950/30 border-t-brand-950"
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

          {/* demo accounts — only shown when NEXT_PUBLIC_DEMO_MODE=1 */}
          {DEMO_MODE && (
            <div className="mt-8 rounded-xl border border-gold-500/30 bg-gold-400/10 p-4 dark:border-gold-500/25 dark:bg-gold-400/5">
              <div className="flex items-center gap-2">
                <Info
                  className="h-4 w-4 shrink-0 text-gold-700 dark:text-gold-400"
                  aria-hidden="true"
                />
                <h2 className="text-sm font-semibold">Demo accounts</h2>
                <Badge variant="secondary" className="ml-auto text-[10px]">
                  One-click fill
                </Badge>
              </div>

              {/* role selector — segmented pills */}
              <div
                role="group"
                aria-label="Choose a demo role"
                className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-muted p-1"
              >
                {DEMO_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    aria-pressed={demoRole === role}
                    onClick={() => setDemoRole(role)}
                    className={cn(
                      'inline-flex min-h-9 items-center justify-center rounded-md px-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                      demoRole === role
                        ? 'bg-brand-700 text-[#f2efe6] shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {role}
                  </button>
                ))}
              </div>

              {/* credential quick-fill chips for the selected role */}
              <ul className="mt-3 space-y-2">
                {DEMO_ACCOUNTS.filter((account) => account.role === demoRole).map((account) => (
                  <li key={account.email}>
                    <button
                      type="button"
                      onClick={() => fillDemoAccount(account)}
                      className="inline-flex min-h-9 w-full items-center gap-2 rounded-full border border-gold-500/30 bg-gold-400/15 px-3.5 text-left text-xs font-semibold text-gold-700 transition-colors hover:bg-gold-400/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:text-gold-300"
                    >
                      <account.icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{account.email}</span>
                      <span className="ml-auto shrink-0 font-normal opacity-70">
                        {account.masked}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
