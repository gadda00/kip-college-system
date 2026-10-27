'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * Task 8-b print machinery.
 *
 * `usePrintDoc()` mounts the printable document into a body-level portal
 * (`.kip-print-portal`, a DIRECT child of <body>) and calls `window.print()`.
 * The global @media print CSS (globals.css) hides every other direct child of
 * `<body>`, so ONLY the portalled document prints — no header, footer,
 * sidebar or chat widget. `afterprint` unmounts the portal again.
 *
 * Usage:
 *   const { print, printDoc } = usePrintDoc(() => <MyOfficialDocument />)
 *   …
 *   <Button onClick={print}>Print</Button>
 *   {printDoc}
 */
export function usePrintDoc(render: () => ReactNode) {
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

  const printDoc =
    printing ? (
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
