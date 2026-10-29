'use client'

import { cn } from '@/lib/utils'

/**
 * KIP College crest — faithful recreation of the official Kitui Institute of
 * Professionals emblem: a deep sapphire shield with double border, "KIP"
 * monogram in gold at the top, a glowing lightbulb at the centre (ideas &
 * enlightenment) and a gold ribbon carrying "Excellence".
 * Motto: "Training for Excellence".
 */
export function KipLogo({
  className,
  variant = 'default',
}: {
  className?: string
  /** 'default' = crest + wordmark; 'mark' = crest only (mobile/avatars). */
  variant?: 'default' | 'mark'
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <KipCrest className="h-9 w-9 shrink-0" />
      {variant === 'default' && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-base font-bold tracking-tight sm:text-lg">
            KIP COLLEGE
          </span>
          <span className="mt-1 text-[9px] font-semibold tracking-[0.24em] text-gold-600 dark:text-gold-400">
            TRAINING FOR EXCELLENCE
          </span>
        </span>
      )}
    </span>
  )
}

/**
 * The crest alone — safe to reuse in dark headers, avatars and chat bubbles.
 * Shield strokes follow currentColor; lightbulb + ribbon are always gold.
 */
export function KipCrest({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="KIP College crest"
      className={className}
    >
      {/* shield body */}
      <path
        d="M24 1.6 44 7.6v15.2c0 11-7.6 19.1-20 23.6C11.6 41.9 4 33.8 4 22.8V7.6L24 1.6Z"
        fill="currentColor"
        opacity="0.14"
      />
      {/* outer border */}
      <path
        d="M24 1.6 44 7.6v15.2c0 11-7.6 19.1-20 23.6C11.6 41.9 4 33.8 4 22.8V7.6L24 1.6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      {/* inner double border */}
      <path
        d="M24 4.9 41 10.2v12.6c0 9.2-6.4 16-17 20-10.6-4-17-10.8-17-20V10.2L24 4.9Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinejoin="round"
        opacity="0.55"
      />
      {/* K.I.P monogram in gold */}
      <text
        x="24"
        y="13.4"
        textAnchor="middle"
        fontSize="6.4"
        fontWeight="800"
        letterSpacing="0.6"
        fill="#e3a51c"
        fontFamily="inherit"
      >
        KIP
      </text>
      {/* lightbulb — the college symbol of ideas & enlightenment */}
      <g>
        {/* rays */}
        <g stroke="#f5b301" strokeWidth="1.1" strokeLinecap="round" opacity="0.9">
          <line x1="24" y1="15.2" x2="24" y2="16.8" />
          <line x1="19.6" y1="16.6" x2="20.6" y2="17.9" />
          <line x1="28.4" y1="16.6" x2="27.4" y2="17.9" />
          <line x1="17.7" y1="20.6" x2="19.2" y2="20.9" />
          <line x1="30.3" y1="20.6" x2="28.8" y2="20.9" />
        </g>
        {/* bulb glass */}
        <path
          d="M24 17.4a3.6 3.6 0 0 1 3.6 3.6c0 1.4-.8 2.2-1.5 2.9-.4.4-.7.8-.7 1.3h-2.8c0-.5-.3-.9-.7-1.3-.7-.7-1.5-1.5-1.5-2.9A3.6 3.6 0 0 1 24 17.4Z"
          fill="#f5b301"
        />
        {/* filament */}
        <path
          d="M22.9 24.2c.3-.6.7-.6 1.1 0 .3.6.7.6 1.1 0"
          fill="none"
          stroke="#0e2233"
          strokeWidth="0.7"
          strokeLinecap="round"
        />
        {/* screw base */}
        <g stroke="currentColor" strokeWidth="0.9" strokeLinecap="round">
          <line x1="22.4" y1="26.2" x2="25.6" y2="26.2" />
          <line x1="22.7" y1="27.6" x2="25.3" y2="27.6" />
          <line x1="23.4" y1="29" x2="24.6" y2="29" />
        </g>
      </g>
      {/* gold ribbon with "Excellence" */}
      <g>
        <path
          d="M10.5 31.2h27l-2.6 4h-21.8l-2.6-4Z"
          fill="#e3a51c"
        />
        <path d="M10.5 31.2 7.9 33.2l2.6 2" fill="#c9880a" />
        <path d="M37.5 31.2l2.6 2-2.6 2" fill="#c9880a" />
        <text
          x="24"
          y="34.8"
          textAnchor="middle"
          fontSize="3.6"
          fontWeight="700"
          fontStyle="italic"
          fill="#0e2233"
          fontFamily="Georgia, 'Times New Roman', serif"
        >
          Excellence
        </text>
      </g>
      {/* graduation cap hint at base */}
      <path
        d="M16.5 38.4h15l-1.4 2.2h-12.2l-1.4-2.2Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path d="M24 38.4v2.2" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
    </svg>
  )
}

/** Cream-on-sapphire variant (footer, utility bars, dark surfaces). */
export function KipLogoLight({ className }: { className?: string }) {
  return <KipLogo className={cn('text-[#f2efe6]', className)} />
}
