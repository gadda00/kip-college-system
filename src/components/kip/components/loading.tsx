'use client'

import { AlertTriangle, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/kip/components/empty-state'

/** Skeleton grid for course cards. */
export function CourseCardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-[16/9] rounded-none" />
          <CardContent className="space-y-3 p-5">
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/** Skeleton rows for lists (news, events, tables). */
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 shrink-0 rounded-lg sm:h-20 sm:w-28" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Skeleton for a 2-column detail page. */
export function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Skeleton className="aspect-[16/9] w-full rounded-xl" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-3/4" />
        <div className="space-y-3 pt-4">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    </div>
  )
}

/** Inline error panel with retry button — used by every data view. */
export function ErrorPanel({
  error,
  onRetry,
}: {
  error: unknown
  onRetry?: () => void
}) {
  const message =
    error instanceof Error ? error.message : 'Something went wrong while loading this section.'
  return (
    <EmptyState
      icon={AlertTriangle}
      title="We hit a snag"
      hint={message}
      action={
        onRetry && (
          <Button onClick={onRetry} variant="outline" className="min-h-11">
            <RotateCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Try again
          </Button>
        )
      }
    />
  )
}

/** Generic loading/error/data triage so views stay tidy. */
export function QueryBoundary({
  status,
  error,
  onRetry,
  skeleton,
  children,
}: {
  status: 'pending' | 'error' | 'success'
  error?: unknown
  onRetry?: () => void
  skeleton: React.ReactNode
  children: React.ReactNode
}) {
  if (status === 'pending') return <>{skeleton}</>
  if (status === 'error') return <ErrorPanel error={error} onRetry={onRetry} />
  return <>{children}</>
}
