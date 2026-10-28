'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * Task 8-c — admin print machinery (admin equivalent of the Task 8-b portal
 * hook). Mounts the printable node into a body-level React portal
 * (`.kip-print-portal`, a DIRECT child of <body>) and calls window.print().
 * The global @media print CSS in globals.css hides every other direct child
 * of <body>, so ONLY the portalled document prints — no admin sidebar,
 * header, footer or toasts. Documents carry the emerald + gold print identity
 * (deep emerald header bands, gold rules, serif institution name) with
 * `print-color-adjust: exact` keeping the brand colours on paper.
 *
 * Usage:
 *   const { print, printDoc } = useAdminPrintDoc(() => <MyDocument />)
 */
export function useAdminPrintDoc(render: () => ReactNode) {
  const [printing, setPrinting] = useState(false)

  useEffect(() => {
    if (!printing) return
    const finish = () => setPrinting(false)
    window.addEventListener('afterprint', finish)
    // give React a moment to commit + paint the portal before the (blocking)
    // print dialog opens; browsers re-render print output from the DOM.
    const timer = window.setTimeout(() => window.print(), 150)
    // safety net in case afterprint never fires (some embedded browsers)
    const safety = window.setTimeout(finish, 120_000)
    return () => {
      window.removeEventListener('afterprint', finish)
      window.clearTimeout(timer)
      window.clearTimeout(safety)
    }
  }, [printing])

  const printDoc = printing ? (
    createPortal(
      <div
        className="kip-print-portal fixed inset-0 z-[90] overflow-auto bg-white"
        aria-hidden="true"
      >
        {render()}
      </div>,
      document.body,
    )
  ) : null

  return { print: () => setPrinting(true), printDoc }
}
