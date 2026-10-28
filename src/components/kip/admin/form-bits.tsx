'use client'

import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/** Form row: label + control + optional hint, with 44px-friendly controls. */
export function Field({
  id,
  label,
  hint,
  required,
  children,
  className,
}: {
  id: string
  label: string
  hint?: string
  required?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
      >
        {label}
        {required && (
          <span className="ml-1 text-gold-600 dark:text-gold-400" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

/** Two-column grid for compact dialog forms (stacks on small screens). */
export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
}

/** Submit button with built-in pending spinner (onClick optional for non-form use). */
export function SubmitButton({
  pending,
  pendingLabel = 'Saving…',
  children,
  className,
  onClick,
}: {
  pending: boolean
  pendingLabel?: string
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <Button type="submit" disabled={pending} className={cn('min-h-11', className)} onClick={onClick}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  )
}

/** Scrollable dialog body wrapper (max 80vh, custom scrollbar). */
export function DialogBody({ children }: { children: ReactNode }) {
  return (
    <div className="max-h-[80vh] overflow-y-auto custom-scrollbar pr-1">{children}</div>
  )
}
