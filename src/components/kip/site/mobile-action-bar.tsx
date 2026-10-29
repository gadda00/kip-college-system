'use client'

import { MessageCircle, Phone } from 'lucide-react'
import { KipLink } from '@/components/kip/components/link'
import { useHashRoute } from '@/components/kip/lib/router'
import { PHONE_TEL, WHATSAPP_URL } from '@/components/kip/site/contact-info'

/** Route segments that own their own full-screen chrome — no public bar there. */
const PRIVATE_ROUTE_PATHS = new Set(['portal', 'lecturer', 'admin'])

/**
 * Sticky bottom quick-action bar for phones (<lg) on public pages.
 *
 * Three equal-height (h-14) real links: Apply — the single gold CTA — plus
 * WhatsApp and Call, so the two highest-intent mobile actions are always one
 * thumb-tap away. Hidden on portal/lecturer/admin routes (their shells own the
 * viewport; the route check runs both here and in app.tsx) and never printed
 * (`print:hidden`, on top of the global .kip-print-portal isolation that hides
 * the whole app shell while printing).
 */
export function MobileActionBar() {
  const route = useHashRoute()

  if (PRIVATE_ROUTE_PATHS.has(route.path)) return null

  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden print:hidden"
    >
      <div className="mx-auto grid w-full max-w-lg grid-cols-3 gap-2 px-2 pt-1.5">
        <KipLink
          to="/apply"
          className="btn-gold flex h-14 items-center justify-center gap-2 rounded-xl text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Apply
        </KipLink>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 items-center justify-center gap-2 rounded-xl bg-brand-700 text-sm font-bold text-primary-foreground transition-colors hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          WhatsApp
        </a>
        <a
          href={PHONE_TEL}
          className="flex h-14 items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-bold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Phone className="h-5 w-5" aria-hidden="true" />
          Call
        </a>
      </div>
    </nav>
  )
}
