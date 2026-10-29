'use client'

import Image from 'next/image'
import { ChevronRight, Home } from 'lucide-react'
import { navigate } from '@/components/kip/lib/router'
import { cn } from '@/lib/utils'

/**
 * Subpage hero banner: breadcrumb, display-serif title, subtitle on the deep
 * emerald band with woven-reed texture and a gold baseline.
 */
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
        'bg-brand-band kip-grain relative overflow-hidden text-[#f2efe6]',
        className,
      )}
      aria-labelledby="page-hero-title"
    >
      {image ? (
        <>
          <Image
            src={image}
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            className="object-cover opacity-25"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-brand-950/95 via-brand-950/80 to-brand-900/55"
          />
          {/* bottom vignette for depth (matches homepage hero) */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-brand-950/70 to-transparent"
          />
        </>
      ) : (
        <>
          {/* woven reed texture */}
          <div aria-hidden="true" className="kip-pattern absolute inset-0" />
          {/* corner gold glow */}
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-400/10 blur-3xl"
          />
        </>
      )}

      <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-[#f2efe6]/75 sm:text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="inline-flex min-h-11 items-center gap-1 rounded px-1 transition-colors hover:text-gold-300 md:min-h-0"
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
                      className="rounded px-1 transition-colors hover:text-gold-300"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span aria-current="page" className="font-medium text-gold-300">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {eyebrow && (
          <div className="mb-3 flex items-center gap-3">
            <span className="gold-rule w-6" aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-300 sm:text-sm">
              {eyebrow}
            </p>
          </div>
        )}
        <h1
          id="page-hero-title"
          className="text-balance text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl"
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-[#f2efe6]/85 sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {/* gold baseline */}
      <div
        className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-gold-500 via-gold-400 to-transparent"
        aria-hidden="true"
      />
    </section>
  )
}
