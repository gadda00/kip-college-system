'use client'

import { useEffect } from 'react'
import { Construction, LogIn } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { KipCrest } from '@/components/kip/components/kip-logo'
import { navigate } from '@/components/kip/lib/router'
import { useAuthStore } from '@/components/kip/stores/auth-store'

/**
 * ─── PORTAL STUB ────────────────────────────────────────────────────────────
 * Tasks 5-b (student + lecturer portals) and 5-c (admin dashboard) REPLACE this
 * file / component in src/components/kip/portal/portal-stub.tsx to take over
 * the 'portal', 'lecturer' and 'admin' hash routes (see app.tsx route table).
 * The replacement is surgical: keep the export name `PortalStub` or swap the
 * imports in app.tsx.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function PortalStub({ area }: { area: 'student' | 'lecturer' | 'admin' }) {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)

  const requiredRole = area === 'admin' ? 'ADMIN' : area === 'lecturer' ? 'LECTURER' : 'STUDENT'

  // Not logged in (or wrong role) → redirect to login after a beat.
  useEffect(() => {
    if (loading) return
    if (!user) {
      const t = setTimeout(() => navigate('/login'), 600)
      return () => clearTimeout(t)
    }
    if (user.role !== requiredRole) {
      const t = setTimeout(() => {
        navigate(
          user.role === 'ADMIN' ? '/admin' : user.role === 'LECTURER' ? '/lecturer' : '/portal',
        )
      }, 900)
      return () => clearTimeout(t)
    }
  }, [user, loading, requiredRole])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <KipCrest className="h-14 w-14 animate-pulse text-primary" />
          <p className="text-sm">Checking your session…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <LogIn className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="text-lg font-semibold">Sign in required</h2>
            <p className="text-sm text-muted-foreground">
              Redirecting you to the login page… You need an account to access this area.
            </p>
            <Button onClick={() => navigate('/login')} className="min-h-11 w-full">
              Go to login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (user.role !== requiredRole) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <Badge variant="destructive">Access denied</Badge>
            <h2 className="text-lg font-semibold">This area requires a {requiredRole.toLowerCase()} account</h2>
            <p className="text-sm text-muted-foreground">
              You are signed in as <strong>{user.name}</strong> ({user.role}). Redirecting you to
              your own portal…
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Card className="border-primary/15">
          <CardContent className="flex flex-col items-center gap-5 p-8 text-center sm:p-12">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-600 dark:text-amber-400">
              <Construction className="h-8 w-8" aria-hidden="true" />
            </span>
            <Badge variant="secondary">{area} module</Badge>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Module being prepared
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Welcome back, <strong>{user.name}</strong>. The {area} portal is being finalised and
              will be available shortly. Meanwhile you can browse the college website or contact the
              registrar&rsquo;s office.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={() => navigate('/')} variant="outline" className="min-h-11">
                Back to website
              </Button>
              <Button onClick={() => navigate('/contact')} className="min-h-11">
                Contact the college
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
