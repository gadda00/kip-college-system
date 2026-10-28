'use client'

import { useEffect, useRef, useState } from 'react'
import { animate } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Stat card with an animated count-up value, gold rule + serif numerals. */
export function StatCard({
  icon: Icon,
  label,
  value,
  suffix = '',
  duration = 1.2,
  className,
}: {
  icon: LucideIcon
  label: string
  value: number
  suffix?: string
  duration?: number
  className?: string
}) {
  const [display, setDisplay] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [value, duration])

  return (
    <Card className={cn('card-lift relative overflow-hidden border-border/60 py-0', className)}>
      {/* gold top rule */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-gold-500 via-gold-300 to-transparent"
      />
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-primary dark:bg-brand-100">
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
        </div>
        <p className="font-display mt-3 text-3xl font-bold tabular-nums tracking-tight text-foreground sm:text-4xl">
          {display.toLocaleString('en-KE')}
          <span className="text-gold-500 dark:text-gold-400">{suffix}</span>
        </p>
      </CardContent>
    </Card>
  )
}

/** Small KPI card: icon chip + label + value + optional delta text. */
export function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
  className,
}: {
  icon: LucideIcon
  label: string
  value: string | number
  delta?: { text: string; positive?: boolean }
  className?: string
}) {
  return (
    <Card className={cn('card-lift relative overflow-hidden py-0', className)}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-primary dark:bg-brand-100">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <p className="font-display mt-2 truncate text-xl font-bold tracking-tight sm:text-2xl">
          {value}
        </p>
        {delta && (
          <p
            className={cn(
              'mt-1 text-xs font-medium',
              delta.positive === false
                ? 'text-destructive'
                : 'text-brand-600 dark:text-brand-500',
            )}
          >
            {delta.text}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
