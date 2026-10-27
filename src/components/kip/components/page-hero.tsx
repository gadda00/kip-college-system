'use client'

import { ChevronRight, Home } from 'lucide-react'
import { navigate } from '@/components/kip/lib/router'
import { cn } from '@/lib/utils'

/** Subpage hero banner: breadcrumb, title, subtitle, royal blue gradient + pattern. */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  breadcrumb,
  image,
  className,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  breadcrumb?: { label: string; to?: string }[]
  image?: string
  className?: string
}) {
  return (
    <section
      className={cn(
        'relative overflow-hidden bg-primary text-primary-foreground',
        className,
      )}
      aria-labelledby="page-hero-title"
    >
      {image ? (
        <>
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1f3f]/95 via-primary/85 to-sky-700/70" />
        </>
      ) : (
        <>
          {/* subtle radial pattern */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)',
              backgroundSize: '26px 26px',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0b1f3f]/60 via-transparent to-sky-500/15" />
        </>
      )}

      <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-primary-foreground/80 sm:text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="inline-flex min-h-11 items-center gap-1 rounded px-1 transition-colors hover:text-sky-300 md:min-h-0"
                >
                  <Home className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="sr-only sm:not-sr-only">Home</span>
                </button>
              </li>
              {breadcrumb.map((crumb, i) => (
                <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                  {crumb.to && i < breadcrumb.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => navigate(crumb.to as string)}
                      className="rounded px-1 transition-colors hover:text-sky-300"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span aria-current="page" className="font-medium text-sky-300">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-300 sm:text-sm">
            {eyebrow}
          </p>
        )}
        <h1
          id="page-hero-title"
          className="text-balance text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl"
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {/* sky baseline */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-sky-400 via-sky-300 to-transparent" aria-hidden="true" />
    </section>
  )
}
