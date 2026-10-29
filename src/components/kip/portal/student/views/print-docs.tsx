'use client'

/**
 * Task 8-b — printable official documents (fee statement + academic transcript).
 *
 * These render ONLY inside the body-level print portal (see portal/print-doc.tsx),
 * so they use fixed print-safe colours (deep emerald #0f2e22 ink, KIP gold
 * #f5b301 accents, light emerald tints) and never appear in normal screen flow.
 * `print-color-adjust: exact` (set on .kip-print-portal in globals.css) keeps
 * the brand colours on paper.
 */

import { KipCrest } from '@/components/kip/components/kip-logo'
import { fmtDate, fmtKES } from '@/components/kip/lib/format'
import type { FeeStatement, StudentProfileFull, StudentResults } from '@/components/kip/portal/types'

// print-safe brand palette (no CSS vars — these must survive paper exactly)
const INK = '#0f2e22' // deep emerald ink
const GOLD = '#f5b301' // KIP gold
const GOLD_DARK = '#92600a' // darker gold for small text on white
const TINT = '#e8f3ed' // light emerald tint

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

/** A4-style white sheet wrapper. */
export function PrintSheet({ children }: { children: React.ReactNode }) {
  return (
    <article className="kip-sheet mx-auto w-full max-w-[820px] bg-white px-8 py-10 text-[#0f2e22]">
      {children}
    </article>
  )
}

/** Official college letterhead: emerald band + gold rule + serif identity. */
export function DocLetterhead({ docTitle, subtitle }: { docTitle: string; subtitle?: string }) {
  return (
    <header className="rounded-lg">
      {/* emerald identity band */}
      <div className="bg-[#0f2e22] px-4 pb-3 pt-4 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <KipCrest className="h-14 w-14 shrink-0 text-white" />
            <div className="min-w-0">
              <h1 className="font-display text-lg font-bold uppercase leading-tight tracking-tight text-white">
                Kitui Institute of Professionals
              </h1>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f5b301]">
                Training for Excellence
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="inline-block rounded-md bg-[#f5b301] px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[#0f2e22]">
              {docTitle}
            </p>
            {subtitle && <p className="mt-1.5 text-[10px] font-medium text-white/75">{subtitle}</p>}
          </div>
        </div>
        <p className="mt-3 text-[9px] leading-relaxed text-white/70">
          Main Campus: 100m from Wikililye, Mulango Road, Kitui · Town Campus: Muli Mall, Kitui CBD ·
          Mwingi Campus: Sunrise Building, Mwingi
          <br />
          Tel: 0703 710 879 · info@kipskitui.com · www.kipskitui.com
        </p>
      </div>
      {/* gold rule */}
      <div
        aria-hidden="true"
        className="h-[3px] w-full"
        style={{ background: `linear-gradient(90deg, ${GOLD} 0%, ${GOLD_DARK} 70%, transparent 100%)` }}
      />
    </header>
  )
}

/** Student identity block shared by both documents. */
export function DocStudentBlock({
  profile,
  extra,
}: {
  profile: StudentProfileFull
  extra?: { label: string; value: string }[]
}) {
  const cells: { label: string; value: string }[] = [
    { label: 'Student name', value: profile.name },
    { label: 'Admission number', value: profile.admissionNo },
    { label: 'Course', value: profile.course.title },
    { label: 'Level / examiner', value: `${profile.course.level} · ${profile.course.examBody}` },
    { label: 'Campus', value: profile.campus.name },
    {
      label: 'Year / Term',
      value: `Year ${profile.yearOfStudy} · Term ${profile.currentTerm}`,
    },
    { label: 'Status', value: profile.status },
    { label: 'Admitted', value: fmtDate(profile.admittedAt) },
    ...(extra ?? []),
  ]
  return (
    <section className="mt-5 rounded-lg border border-[#0f2e22]/20 bg-[#e8f3ed] px-4 py-3">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#92600a]">
        Student details
      </h2>
      <dl className="mt-2 grid grid-cols-2 gap-x-8 gap-y-2 md:grid-cols-4">
        {cells.map((c) => (
          <div key={c.label} className="min-w-0">
            <dt className="text-[9px] font-semibold uppercase tracking-wide text-[#0f2e22]/55">
              {c.label}
            </dt>
            <dd className="mt-0.5 truncate text-[11px] font-bold text-[#0f2e22]">{c.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/** Official footer: system-generated note + payment channels + printed date. */
export function DocFooter({
  note,
  printedAt,
  showPaybill = false,
}: {
  note: string
  printedAt: Date
  showPaybill?: boolean
}) {
  return (
    <footer className="mt-8 text-[9px] leading-relaxed text-[#0f2e22]/70">
      <div
        aria-hidden="true"
        className="mb-3 h-[3px] w-24"
        style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_DARK})` }}
      />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-semibold italic">{note}</p>
          {showPaybill && (
            <p className="mt-1">
              Pay fees via M-Pesa Paybill <strong>522 890</strong> (Account: your admission number),
              Equity Bank Kitui Branch (A/C 1234567890) or cash at any campus finance office. Confirm
              the current paybill with the finance office — 0703 710 879.
            </p>
          )}
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
          <span className="text-[8px] uppercase tracking-widest">Training for Excellence</span>
        </p>
      </div>
    </footer>
  )
}

// ---------------------------------------------------------------------------
// Statement rows (shared by the on-screen table and the printable statement)
// ---------------------------------------------------------------------------

export type StatementRow = {
  key: string
  date: string
  description: string
  type: string
  due: string | null
  amount: number
  runningBalance: number
  reference: string | null
}

/**
 * Merge fee charges + payments into chronological statement rows with a
 * running balance (negative = credit paid ahead). Oldest first.
 *
 * Only CONFIRMED payments enter the statement — PENDING submissions await
 * finance confirmation and REJECTED payments never count, so the final
 * running balance always equals the API's `balance` (which sums CONFIRMED
 * payments only). PENDING/REJECTED payments are surfaced separately in the
 * portal payments table with their status badges.
 */
export function buildStatementRows(data: FeeStatement): StatementRow[] {
  const charges: StatementRow[] = data.feeItems.map((f) => ({
    key: `fee-${f.id}`,
    // prefer the due date — posting timestamps can be identical for a whole
    // seeded/backdated batch, which scrambles the running balance order
    date: f.dueDate ?? f.createdAt,
    description: `${f.description} · ${f.term}`,
    type: f.type,
    due: f.dueDate,
    amount: f.amount,
    runningBalance: 0,
    reference: null,
  }))
  const payments: StatementRow[] = data.payments
    .filter((p) => p.status === 'CONFIRMED')
    .map((p) => ({
      key: `pay-${p.id}`,
      date: p.paidAt,
      description:
        p.method === 'MPESA'
          ? `M-Pesa payment${p.note ? ` — ${p.note}` : ''}`
          : p.method === 'BANK'
            ? `Bank transfer${p.note ? ` — ${p.note}` : ''}`
            : `Cash payment${p.note ? ` — ${p.note}` : ''}`,
      type: 'PAYMENT',
      due: null,
      amount: -p.amount,
      runningBalance: 0,
      reference: p.reference,
    }))
  const merged = [...charges, ...payments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )
  let running = 0
  for (const row of merged) {
    running += row.amount
    row.runningBalance = running
  }
  return merged
}

// ---------------------------------------------------------------------------
// Official fee statement
// ---------------------------------------------------------------------------

/** Running balance display: negative = credit paid ahead. */
function fmtRunningBalance(value: number): string {
  return value < 0 ? `${fmtKES(Math.abs(value))} CR` : fmtKES(value)
}

/** Full official fee statement with letterhead, full ledger and totals. */
export function FeeStatementDoc({
  profile,
  statement,
}: {
  profile: StudentProfileFull
  statement: FeeStatement
}) {
  const rows = buildStatementRows(statement)
  const printedAt = new Date()
  const confirmedPayments = statement.payments.filter((p) => p.status === 'CONFIRMED')
  const pendingPayments = statement.payments.filter((p) => p.status === 'PENDING')

  return (
    <PrintSheet>
      <DocLetterhead
        docTitle="Official Fee Statement"
        subtitle={`Account ${profile.admissionNo} · ${profile.course.title}`}
      />
      <DocStudentBlock profile={profile} />

      <section className="mt-6">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#92600a]">
          Statement of account — all charges &amp; payments
        </h2>
        {rows.length === 0 ? (
          <p className="mt-3 text-[11px] text-[#0f2e22]/70">No transactions on this account.</p>
        ) : (
          <table className="mt-2 w-full border-collapse text-[10px]">
            <thead>
              <tr className="border-y border-[#0f2e22]/25 bg-[#0f2e22] text-left text-white">
                <th className="px-2 py-1.5 font-semibold">Date</th>
                <th className="px-2 py-1.5 font-semibold">Description</th>
                <th className="px-2 py-1.5 font-semibold">Reference</th>
                <th className="px-2 py-1.5 text-right font-semibold">Amount</th>
                <th className="px-2 py-1.5 text-right font-semibold">Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b border-[#0f2e22]/10 align-top odd:bg-[#e8f3ed]/50">
                  <td className="whitespace-nowrap px-2 py-1.5 font-mono text-[9px]">
                    {fmtDate(row.date)}
                  </td>
                  <td className="px-2 py-1.5">{row.description}</td>
                  <td className="whitespace-nowrap px-2 py-1.5 font-mono text-[9px] text-[#0f2e22]/70">
                    {row.reference ?? '—'}
                  </td>
                  <td
                    className={`whitespace-nowrap px-2 py-1.5 text-right font-mono font-semibold ${
                      row.type === 'PAYMENT' ? 'text-[#047857]' : ''
                    }`}
                  >
                    {row.type === 'PAYMENT'
                      ? `− ${fmtKES(Math.abs(row.amount))}`
                      : fmtKES(row.amount)}
                  </td>
                  <td className="whitespace-nowrap px-2 py-1.5 text-right font-mono">
                    {fmtRunningBalance(row.runningBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-y-2 border-double border-[#0f2e22]/40 bg-[#e8f3ed] font-bold">
                <td colSpan={3} className="px-2 py-2 text-[10px] uppercase tracking-wide">
                  Totals — {statement.feeItems.length} charges, {confirmedPayments.length} confirmed
                  payment{confirmedPayments.length === 1 ? '' : 's'}
                </td>
                <td className="whitespace-nowrap px-2 py-2 text-right font-mono">
                  <span className="block text-[9px] font-semibold text-[#0f2e22]/60">
                    Charged {fmtKES(statement.totalCharged)}
                  </span>
                  <span className="block text-[#047857]">Paid {fmtKES(statement.totalPaid)}</span>
                </td>
                <td className="whitespace-nowrap px-2 py-2 text-right font-mono">
                  <span className="block text-[9px] font-semibold uppercase text-[#0f2e22]/60">
                    Balance
                  </span>
                  <span className={statement.balance > 0 ? 'text-[#b91c1c]' : 'text-[#047857]'}>
                    {fmtKES(statement.balance)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </section>

      {pendingPayments.length > 0 && (
        <p className="mt-4 rounded-md border border-[#92600a]/30 bg-[#fdf6e3] px-3 py-2 text-[10px] font-medium text-[#92600a]">
          {pendingPayments.length} payment{pendingPayments.length === 1 ? '' : 's'} submitted from the
          portal await finance confirmation and are not yet included in this statement or the balance
          above.
        </p>
      )}

      {statement.balance > 0 && (
        <p className="mt-4 rounded-md border border-[#b91c1c]/30 bg-[#fef2f2] px-3 py-2 text-[10px] font-medium text-[#b91c1c]">
          Outstanding balance of {fmtKES(statement.balance)} is payable to avoid examination holds.
          Please quote your admission number {profile.admissionNo} on all payments.
        </p>
      )}

      <DocFooter
        note="This is a system-generated statement from the KIP College student portal and does not require a signature."
        printedAt={printedAt}
        showPaybill
      />
    </PrintSheet>
  )
}

// ---------------------------------------------------------------------------
// Official academic transcript
// ---------------------------------------------------------------------------

function overallGradeFor(average: number): string {
  if (average >= 80) return 'A — Excellent'
  if (average >= 65) return 'B — Good'
  if (average >= 50) return 'C — Credit'
  if (average >= 40) return 'D — Pass'
  return 'E — Fail'
}

/** Official academic transcript grouped by term/stage with a summary block. */
export function TranscriptDoc({
  profile,
  results,
}: {
  profile: StudentProfileFull
  results: StudentResults
}) {
  const printedAt = new Date()
  const { byStage, overall } = results
  const examBodies = [
    ...new Set(
      byStage
        .flatMap((s) => s.entries)
        .map((e) => e.examBody)
        .filter((b): b is string => Boolean(b)),
    ),
  ]

  return (
    <PrintSheet>
      <DocLetterhead
        docTitle="Academic Transcript"
        subtitle={`${profile.course.title} · ${profile.course.level}`}
      />
      <DocStudentBlock profile={profile} />

      {byStage.length === 0 ? (
        <p className="mt-6 text-[11px] text-[#0f2e22]/70">
          No published results on record for this student.
        </p>
      ) : (
        <section className="mt-6 space-y-5">
          {byStage.map((stage) => (
            <div key={stage.stageLabel}>
              <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#92600a]">
                {stage.stageLabel}{' '}
                <span className="font-medium normal-case tracking-normal text-[#0f2e22]/60">
                  ({stage.entries.length} unit{stage.entries.length === 1 ? '' : 's'})
                </span>
              </h2>
              <table className="mt-1.5 w-full border-collapse text-[10px]">
                <thead>
                  <tr className="border-y border-[#0f2e22]/25 bg-[#0f2e22] text-left text-white">
                    <th className="px-2 py-1.5 font-semibold">Unit code</th>
                    <th className="px-2 py-1.5 font-semibold">Unit name</th>
                    <th className="px-2 py-1.5 font-semibold">Term</th>
                    <th className="px-2 py-1.5 text-right font-semibold">Marks</th>
                    <th className="px-2 py-1.5 text-center font-semibold">Grade</th>
                    <th className="px-2 py-1.5 font-semibold">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {stage.entries.map((e) => (
                    <tr key={e.id} className="border-b border-[#0f2e22]/10 odd:bg-[#e8f3ed]/50">
                      <td className="whitespace-nowrap px-2 py-1.5 font-mono font-semibold">
                        {e.unitCode}
                      </td>
                      <td className="px-2 py-1.5">{e.unitName}</td>
                      <td className="whitespace-nowrap px-2 py-1.5 font-mono text-[9px]">
                        {e.term}
                      </td>
                      <td className="whitespace-nowrap px-2 py-1.5 text-right font-mono font-semibold">
                        {e.marks.toFixed(0)}/100
                      </td>
                      <td className="px-2 py-1.5 text-center font-black">{e.grade}</td>
                      <td className="px-2 py-1.5 font-display italic text-[#0f2e22]/70">
                        {e.remark ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {/* Summary */}
          <section className="rounded-lg border border-[#0f2e22]/20 bg-[#e8f3ed] px-4 py-3">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#92600a]">
              Transcript summary
            </h2>
            <dl className="mt-2 grid grid-cols-2 gap-x-8 gap-y-2 md:grid-cols-4">
              <div>
                <dt className="text-[9px] font-semibold uppercase tracking-wide text-[#0f2e22]/55">
                  Units completed
                </dt>
                <dd className="mt-0.5 text-[13px] font-black">{overall.unitsDone}</dd>
              </div>
              <div>
                <dt className="text-[9px] font-semibold uppercase tracking-wide text-[#0f2e22]/55">
                  Average mark
                </dt>
                <dd className="mt-0.5 text-[13px] font-black">{overall.average.toFixed(1)}%</dd>
              </div>
              <div>
                <dt className="text-[9px] font-semibold uppercase tracking-wide text-[#0f2e22]/55">
                  GPA (4.00 scale)
                </dt>
                <dd className="mt-0.5 text-[13px] font-black">{overall.gpa.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-[9px] font-semibold uppercase tracking-wide text-[#0f2e22]/55">
                  Overall grade
                </dt>
                <dd className="mt-0.5 text-[13px] font-black">{overallGradeFor(overall.average)}</dd>
              </div>
            </dl>
          </section>
        </section>
      )}

      <DocFooter
        note={
          examBodies.length > 0
            ? `Examiner: ${examBodies.join(' / ')}. This transcript shows continuously published internal results and is not a substitute for the official examiner certificate.`
            : 'This transcript shows continuously published internal results and is not a substitute for the official examiner certificate.'
        }
        printedAt={printedAt}
      />
    </PrintSheet>
  )
}
