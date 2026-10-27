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
    <Card className={cn('border-primary/10 bg-card', className)}>
      <CardContent className="flex items-center gap-4 p-5 sm:p-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            {display.toLocaleString('en-KE')}
            {suffix}
          </p>
          <p className="truncate text-xs font-medium text-muted-foreground sm:text-sm">{label}</p>
        </div>
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
