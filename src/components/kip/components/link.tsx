'use client'

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { navigate } from '@/components/kip/lib/router'

type KipLinkProps = {
  /** SPA route, e.g. '/course/abc123' or '/academics?category=KASNEB' */
  to: string
  children: ReactNode
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
  }

/**
 * A REAL <a> anchor for SPA hash routes.
 *
 * The site uses hash routing ('#/course/abc'), which resolves correctly on a
 * hard load — so every navigational element should be a genuine link:
 * middle-click / ⌘-click open in a new tab, long-press share, copy-link and
 * screen-reader link lists all work. Plain left clicks fall back to smooth
 * client-side navigation without a page reload.
 */
export function KipLink({ to, children, onClick, ...rest }: KipLinkProps) {
  const href = to.startsWith('#') ? to : `#${to.startsWith('/') ? to : `/${to}`}`
  return (
    <a
      href={href}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented) return
        // let the browser handle modified clicks (new tab / window)
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
        e.preventDefault()
        navigate(to)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
