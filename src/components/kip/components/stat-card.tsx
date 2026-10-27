'use client'

import { useEffect, useRef, useState } from 'react'
import { animate } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Stat card with an animated count-up value. */
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
    <Card className={cn('relative overflow-hidden border-border/60 py-0', className)}>
      {/* 3px left accent bar */}
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] bg-primary" />
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </p>
        </div>
        <p className="mt-3 text-3xl font-black tabular-nums tracking-tight text-foreground sm:text-4xl">
          {display.toLocaleString('en-KE')}
          {suffix}
        </p>
      </CardContent>
    </Card>
  )
}

/** Small KPI card: icon + label + value + optional delta text. */
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
    <Card className={className}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-2 truncate text-xl font-bold tracking-tight sm:text-2xl">{value}</p>
        {delta && (
          <p
            className={cn(
              'mt-1 text-xs font-medium',
              delta.positive === false ? 'text-destructive' : 'text-green-600 dark:text-green-400',
            )}
          >
            {delta.text}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
