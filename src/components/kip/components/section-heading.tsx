'use client'

import { cn } from '@/lib/utils'

/** Section heading: gold eyebrow with rules + display-serif title. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  align?: 'center' | 'left'
  className?: string
}) {
  return (
    <div
      className={cn(
        'mb-10 max-w-2xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className,
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            'mb-3 flex items-center gap-3',
            align === 'center' && 'justify-center',
          )}
        >
          <span className="h-px w-8 bg-gold-500/70" aria-hidden="true" />
          <span className="eyebrow">{eyebrow}</span>
          <span className="h-px w-8 bg-gold-500/70" aria-hidden="true" />
        </div>
      )}
      <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      {description && (
        <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      )}
    </div>
  )
}
