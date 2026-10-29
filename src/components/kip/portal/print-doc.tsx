'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { KipCrest } from '@/components/kip/components/kip-logo'
import type { LecturerClassDetail } from '@/components/kip/portal/types'

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

// ---------------------------------------------------------------------------
// Lecturer printable — official class register (Sapphire & Gold identity)
// ---------------------------------------------------------------------------
// Print-safe hex palette (print-color-adjust: exact is set on .kip-print-portal
// in globals.css, so these brand colours survive on paper):
//   deep sapphire band #0a1a2a · sapphire text #123a5e · gold fill #f5b301
//   gold text on white #8a6508 · zebra wash #eef2f9 · cream #f2efe6

const REGISTER_BRAND = '#0a1a2a'
const REGISTER_GOLD_FILL = '#f5b301'
const REGISTER_GOLD_TEXT = '#8a6508'
const REGISTER_ZEBRA = '#eef2f9'

/**
 * Official class register for a taught unit — sapphire letterhead band with
 * crest, gold rules, enrolment/summary meta, zebra roster and signature
 * lines. Rendered ONLY inside the print portal via `usePrintDoc`.
 */
export function ClassRegisterDoc({
  data,
  lecturerName,
}: {
  data: LecturerClassDetail
  lecturerName: string
}) {
  const { unit, students, analytics } = data
  const printedAt = new Date()
  const withResults = students.filter((s) => s.result).length

  return (
    <article className="kip-sheet mx-auto w-full max-w-[820px] bg-white px-8 py-10 text-[#123a5e]">
      {/* Sapphire letterhead band */}
      <header
        className="flex flex-wrap items-start justify-between gap-4 rounded-lg px-6 py-5"
        style={{ backgroundColor: REGISTER_BRAND, color: '#f2efe6' }}
      >
        <div className="flex items-center gap-4">
          <KipCrest className="h-16 w-16 shrink-0 text-[#f2efe6]" />
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold uppercase leading-tight tracking-tight text-[#f2efe6]">
              Kitui Institute of Professionals
            </h1>
            <p
              className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: REGISTER_GOLD_FILL }}
            >
              Training for Excellence
            </p>
            <p className="mt-1.5 text-[10px] leading-relaxed text-[#f2efe6]/75">
              Main Campus: 100m from Wikililye, Mulango Road, Kitui · Town Campus: Muli Mall, Kitui
              CBD · Mwingi Campus: Sunrise Building, Mwingi
              <br />
              Tel: 0703 710 879 · info@kipskitui.com · www.kipskitui.com
            </p>
          </div>
        </div>
        <div className="text-right">
          <p
            className="inline-block rounded-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest"
            style={{ backgroundColor: REGISTER_GOLD_FILL, color: REGISTER_BRAND }}
          >
            Class Register
          </p>
          <p className="mt-1.5 font-mono text-[10px] font-semibold text-[#f2efe6]/85">
            {unit.code}
          </p>
        </div>
      </header>
      {/* gold rule under the band */}
      <div
        className="mt-1 h-[3px] w-full rounded-full"
        style={{
          background: `linear-gradient(90deg, ${REGISTER_GOLD_FILL}, #fde68a 55%, transparent)`,
        }}
        aria-hidden="true"
      />

      {/* Unit meta */}
      <section
        className="mt-5 rounded-lg border px-4 py-3"
        style={{ borderColor: 'rgba(18, 58, 94, 0.2)', backgroundColor: REGISTER_ZEBRA }}
      >
        <h2
          className="text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: REGISTER_GOLD_TEXT }}
        >
          Unit &amp; class details
        </h2>
        <dl className="mt-2 grid grid-cols-2 gap-x-8 gap-y-2 md:grid-cols-4">
          <div className="min-w-0">
            <dt className="text-[9px] font-semibold uppercase tracking-wide text-[#123a5e]/55">
              Unit name
            </dt>
            <dd className="mt-0.5 text-[11px] font-bold text-[#123a5e]">{unit.name}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[9px] font-semibold uppercase tracking-wide text-[#123a5e]/55">
              Unit code
            </dt>
            <dd className="mt-0.5 font-mono text-[11px] font-bold text-[#123a5e]">{unit.code}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[9px] font-semibold uppercase tracking-wide text-[#123a5e]/55">
              Course
            </dt>
            <dd className="mt-0.5 truncate text-[11px] font-bold text-[#123a5e]">
              {unit.course.title}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[9px] font-semibold uppercase tracking-wide text-[#123a5e]/55">
              Stage
            </dt>
            <dd className="mt-0.5 text-[11px] font-bold text-[#123a5e]">{unit.stageLabel}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[9px] font-semibold uppercase tracking-wide text-[#123a5e]/55">
              Enrolled
            </dt>
            <dd className="mt-0.5 text-[11px] font-bold text-[#123a5e]">
              {students.length} student{students.length === 1 ? '' : 's'}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[9px] font-semibold uppercase tracking-wide text-[#123a5e]/55">
              Results entered
            </dt>
            <dd className="mt-0.5 text-[11px] font-bold text-[#123a5e]">
              {withResults}/{students.length}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[9px] font-semibold uppercase tracking-wide text-[#123a5e]/55">
              Class average
            </dt>
            <dd className="mt-0.5 text-[11px] font-bold text-[#123a5e]">
              {analytics.average != null ? `${analytics.average.toFixed(1)}%` : '—'}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[9px] font-semibold uppercase tracking-wide text-[#123a5e]/55">
              Contact hours
            </dt>
            <dd className="mt-0.5 text-[11px] font-bold text-[#123a5e]">
              {unit.weekHours}h/week
            </dd>
          </div>
        </dl>
      </section>

      {/* Roster */}
      <section className="mt-6">
        <h2
          className="text-[11px] font-bold uppercase tracking-[0.18em]"
          style={{ color: REGISTER_GOLD_TEXT }}
        >
          Class register — attendance &amp; continuous assessment
        </h2>
        {students.length === 0 ? (
          <p className="mt-2 text-[11px] text-[#123a5e]/70">
            No students enrolled at this stage of the course.
          </p>
        ) : (
          <table className="mt-2 w-full border-collapse text-[10px]">
            <thead>
              <tr
                className="border-y text-left text-white"
                style={{
                  borderColor: 'rgba(18, 63, 46, 0.25)',
                  backgroundColor: REGISTER_BRAND,
                }}
              >
                <th className="px-2 py-1.5 font-semibold">#</th>
                <th className="px-2 py-1.5 font-semibold">Admission No</th>
                <th className="px-2 py-1.5 font-semibold">Student name</th>
                <th className="px-2 py-1.5 text-center font-semibold">Term</th>
                <th className="px-2 py-1.5 text-center font-semibold">Marks</th>
                <th className="px-2 py-1.5 text-center font-semibold">Grade</th>
                <th className="px-2 py-1.5 font-semibold">Signature</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr
                  key={s.id}
                  className="border-b align-middle"
                  style={{
                    borderColor: 'rgba(18, 63, 46, 0.1)',
                    backgroundColor: i % 2 === 1 ? REGISTER_ZEBRA : undefined,
                  }}
                >
                  <td className="px-2 py-2 text-center font-mono text-[9px] text-[#123a5e]/60">
                    {i + 1}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 font-mono text-[9px] font-semibold">
                    {s.admissionNo}
                  </td>
                  <td className="px-2 py-2 font-semibold">{s.name}</td>
                  <td className="px-2 py-2 text-center font-mono">T{s.currentTerm}</td>
                  <td className="px-2 py-2 text-center font-mono font-semibold">
                    {s.result ? `${s.result.marks.toFixed(0)}/100` : '—'}
                  </td>
                  <td className="px-2 py-2 text-center font-black">{s.result?.grade ?? '—'}</td>
                  <td className="px-2 py-2">
                    <span
                      className="block border-b border-dotted"
                      style={{ borderColor: 'rgba(18, 63, 46, 0.35)' }}
                      aria-hidden="true"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Signature block */}
      <section className="mt-10 grid grid-cols-2 gap-10 text-[10px]">
        <div>
          <span
            className="mb-6 block border-b border-dotted"
            style={{ borderColor: 'rgba(18, 63, 46, 0.5)' }}
            aria-hidden="true"
          />
          <p className="font-semibold text-[#123a5e]">Class lecturer</p>
          <p className="mt-0.5 text-[#123a5e]/70">{lecturerName}</p>
        </div>
        <div>
          <span
            className="mb-6 block border-b border-dotted"
            style={{ borderColor: 'rgba(18, 63, 46, 0.5)' }}
            aria-hidden="true"
          />
          <p className="font-semibold text-[#123a5e]">Academic registrar</p>
          <p className="mt-0.5 text-[#123a5e]/70">For: Kitui Institute of Professionals</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 border-t pt-3 text-[9px] leading-relaxed text-[#123a5e]/70" style={{ borderColor: 'rgba(18, 58, 94, 0.2)' }}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-semibold italic">
              System-generated class register from the KIP College lecturer portal — verify against
              the official register before examinations.
            </p>
            <p className="mt-1">
              Kitui Institute of Professionals · P.O. Box 310-90200, Kitui, Kenya · 0703 710 879 ·
              info@kipskitui.com
            </p>
          </div>
          <p className="shrink-0 text-right">
            Printed on{' '}
            <strong className="font-mono">
              {printedAt.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </strong>
            <br />
            <span className="text-[8px] uppercase tracking-widest" style={{ color: REGISTER_GOLD_TEXT }}>
              Training for Excellence
            </span>
          </p>
        </div>
      </footer>
    </article>
  )
}
