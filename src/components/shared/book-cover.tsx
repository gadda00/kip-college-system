'use client'

import { GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Beautiful generated book covers for products without photos —
 * deterministic gradient + typography, styled like real book covers.
 */
export function BookCover({
  name,
  level,
  subject,
  brand,
  className,
  variant = 0,
}: {
  name: string
  level?: string | null
  subject?: string | null
  brand?: string | null
  className?: string
  variant?: number
}) {
  const v = variant % 8
  const words = name.split(' ')
  const title = words.slice(0, 6).join(' ')
  const showSubject = subject && !name.toLowerCase().includes(subject.toLowerCase())

  return (
    <div
      className={cn(
        'relative flex aspect-[3/4] w-full select-none flex-col justify-between overflow-hidden rounded-lg p-4 text-white shadow-md transition-transform duration-300',
        `cover-${v}`,
        className
      )}
    >
      {/* spine */}
      <div className="absolute inset-y-0 left-0 w-2 bg-black/20" aria-hidden />
      {/* decorative circle */}
      <div
        className="absolute -right-10 -top-10 size-32 rounded-full bg-white/10"
        aria-hidden
      />
      <div
        className="absolute -right-4 top-16 size-16 rounded-full bg-white/10"
        aria-hidden
      />

      <div className="pl-2">
        <div className="text-[10px] font-bold uppercase tracking-widest opacity-90">
          {brand || 'KIPS'}
        </div>
        {level && (
          <div className="mt-1 inline-block rounded bg-white/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide backdrop-blur">
            {level}
          </div>
        )}
      </div>

      <div className="pl-2 pr-1">
        <div className="text-[13px] font-extrabold leading-tight drop-shadow-sm sm:text-sm">
          {title}
          {words.length > 6 && '…'}
        </div>
        {showSubject && (
          <div className="mt-1 text-[10px] font-medium uppercase tracking-wider opacity-85">{subject}</div>
        )}
      </div>

      <div className="flex items-center justify-between pl-2">
        <GraduationCap size={16} className="opacity-80" aria-hidden />
        <span className="text-[9px] font-bold uppercase tracking-widest opacity-75">KIPS KITUI</span>
      </div>
    </div>
  )
}

export function ProductImage({
  name,
  image,
  level,
  subject,
  brand,
  className,
}: {
  name: string
  image?: string | null
  level?: string | null
  subject?: string | null
  brand?: string | null
  className?: string
}) {
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        loading="lazy"
        className={cn('aspect-[3/4] w-full rounded-lg bg-muted object-cover shadow-md', className)}
      />
    )
  }
  // deterministic variant from name
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return (
    <BookCover name={name} level={level} subject={subject} brand={brand} variant={hash} className={className} />
  )
}
