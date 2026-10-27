'use client'

import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function kes(amount: number): string {
  return `KES ${Math.round(amount).toLocaleString('en-KE')}`
}

export function Stars({ rating, size = 14, className }: { rating: number; size?: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-0.5', className)} aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  )
}

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }> = {
  PENDING: { label: 'Pending', variant: 'secondary' },
  CONFIRMED: { label: 'Confirmed', variant: 'default' },
  PROCESSING: { label: 'Processing', variant: 'warning' },
  PACKED: { label: 'Packed', variant: 'warning' },
  OUT_FOR_DELIVERY: { label: 'Out for delivery', variant: 'warning' },
  DELIVERED: { label: 'Delivered', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
  FAILED: { label: 'Failed', variant: 'destructive' },
  PAID: { label: 'Paid', variant: 'success' },
  SUBMITTED: { label: 'Submitted', variant: 'secondary' },
  QUOTED: { label: 'Quoted', variant: 'warning' },
  APPROVED: { label: 'Approved', variant: 'default' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  REVIEWING: { label: 'Reviewing', variant: 'secondary' },
  PRINTING: { label: 'Printing', variant: 'warning' },
  READY: { label: 'Ready', variant: 'success' },
  COLLECTED: { label: 'Collected', variant: 'success' },
  NEW: { label: 'New', variant: 'warning' },
  READ: { label: 'Read', variant: 'secondary' },
  REPLIED: { label: 'Replied', variant: 'success' },
  CRITICAL: { label: 'Critical', variant: 'destructive' },
  HIGH: { label: 'High', variant: 'warning' },
  MEDIUM: { label: 'Medium', variant: 'secondary' },
  LOW: { label: 'Low', variant: 'outline' },
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const cfg = statusMap[status] ?? { label: status, variant: 'secondary' as const }
  const colorCls: Record<string, string> = {
    default: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-muted text-muted-foreground border-border',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20',
    outline: 'bg-transparent text-muted-foreground border-border',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  }
  return (
    <Badge variant="outline" className={cn('font-medium capitalize', colorCls[cfg.variant], className)}>
      {cfg.label}
    </Badge>
  )
}

export function MpesaBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400',
        className
      )}
    >
      <span className="inline-block size-2 rounded-full bg-emerald-500" aria-hidden />
      M-Pesa
    </span>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center">
      {icon && <div className="text-muted-foreground/60">{icon}</div>}
      <h3 className="font-semibold">{title}</h3>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  )
}

export function LoadingGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-[3/4] animate-pulse rounded-lg bg-muted" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
          <div className="h-3 w-2/5 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}
