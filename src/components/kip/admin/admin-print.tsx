'use client'

/**
 * Task 8-c — admin print machinery. This is now a thin re-export of the
 * Task 8-b portal hook (`usePrintDoc` in portal/print-doc.tsx) so admin and
 * portal share ONE implementation. It mounts the printable node into a
 * body-level React portal (`.kip-print-portal`, a DIRECT child of <body>)
 * and calls window.print(). The global @media print CSS in globals.css
 * hides every other direct child of <body>, so ONLY the portalled document
 * prints — no admin sidebar, header, footer or toasts. Documents carry the
 * sapphire + gold print identity (deep sapphire header bands, gold rules,
 * serif institution name) with `print-color-adjust: exact` keeping the brand
 * colours on paper.
 *
 * Usage:
 *   const { print, printDoc } = useAdminPrintDoc(() => <MyDocument />)
 */
export { usePrintDoc as useAdminPrintDoc } from '@/components/kip/portal/print-doc'
