'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Award,
  CalendarRange,
  Download,
  FileSpreadsheet,
  Inbox,
  Info,
  Landmark,
  Loader2,
  Receipt,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QueryBoundary } from '@/components/kip/components/loading'
import { api } from '@/components/kip/lib/api'
import { KpiGridSkeleton, ViewHeading } from '@/components/kip/portal/shared'
import type { ExportStats } from '@/components/kip/admin/types'

/**
 * #/admin/reports — CSV data exports for the registrar.
 * Downloads stream through fetch() (same-origin session cookie), then a blob
 * URL + synthetic anchor triggers the browser download.
 */

type ExportKind = {
  key: 'students' | 'payments' | 'applications' | 'results' | 'fees-outstanding'
  title: string
  description: string
  icon: LucideIcon
  /** extra URL params appended to the export request */
  extraParams?: () => string
}

/** Preferred filename from the Content-Disposition header (falls back safely). */
function filenameFrom(res: Response, fallback: string): string {
  const disposition = res.headers.get('Content-Disposition') ?? ''
  const match = /filename="([^"]+)"/.exec(disposition)
  return match?.[1] ?? fallback
}

function dateStamp(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`
}

export function ReportsView() {
  // payments date-range filter (empty = all time)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [downloading, setDownloading] = useState<string | null>(null)

  const rangeParams = new URLSearchParams()
  if (from) rangeParams.set('from', from)
  if (to) rangeParams.set('to', to)
  const hasRange = from !== '' || to !== ''

  const statsParams = new URLSearchParams()
  if (from) statsParams.set('paymentsFrom', from)
  if (to) statsParams.set('paymentsTo', to)

  const { data: stats, status, error, refetch } = useQuery<ExportStats>({
    queryKey: ['admin-export-stats', from, to],
    queryFn: () =>
      api<ExportStats>(
        `/api/admin/export/stats${statsParams.toString() ? `?${statsParams.toString()}` : ''}`,
      ),
  })

  async function downloadCsv(kind: ExportKind) {
    if (downloading) return
    if (kind.key === 'payments' && from && to && from > to) {
      toast.error('Invalid date range', { description: '"From" date must be before the "To" date.' })
      return
    }
    setDownloading(kind.key)
    try {
      const extra = kind.extraParams ? kind.extraParams() : ''
      const res = await fetch(
        `/api/admin/export?type=${kind.key}${extra ? `&${extra}` : ''}`,
        { credentials: 'same-origin' },
      )
      if (!res.ok) {
        // error envelope from the API (auth/validation) → toast it
        let message = `Export failed (${res.status})`
        try {
          const body = (await res.json()) as { ok?: boolean; error?: string }
          if (body && body.ok === false && body.error) message = body.error
        } catch {
          // non-JSON body
        }
        toast.error('Export failed', { description: message })
        return
      }
      const blob = await res.blob()
      const filename = filenameFrom(res, `kip-${kind.key}-${dateStamp()}.csv`)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
      toast.success('Export ready', {
        description: `${filename} downloaded${kind.key === 'payments' && hasRange ? ' for the selected date range' : ''}.`,
      })
    } catch {
      toast.error('Export failed', {
        description: 'Network error — please check your connection and try again.',
      })
    } finally {
      setDownloading(null)
    }
  }

  const kinds: ExportKind[] = [
    {
      key: 'students',
      title: 'Students register',
      description: 'Full student register with course, campus, guardian and fee ledger per student.',
      icon: Users,
    },
    {
      key: 'payments',
      title: 'Payments ledger',
      description: 'All recorded payments with references, methods and recording officer.',
      icon: Receipt,
      extraParams: () => rangeParams.toString(),
    },
    {
      key: 'applications',
      title: 'Applications log',
      description: 'Admission applications with KCSE details, review status and admin notes.',
      icon: Inbox,
    },
    {
      key: 'results',
      title: 'Results sheet',
      description: 'Every published result per student and unit, with marks, grades and exam body.',
      icon: Award,
    },
    {
      key: 'fees-outstanding',
      title: 'Outstanding fees',
      description: 'Students carrying a balance, sorted from the highest — ideal for follow-up calls.',
      icon: Landmark,
    },
  ]

  const rowCount = (kind: ExportKind['key']): number | null => {
    if (!stats) return null
    switch (kind) {
      case 'students':
        return stats.students
      case 'payments':
        return stats.payments
      case 'applications':
        return stats.applications
      case 'results':
        return stats.results
      default:
        return stats.feesOutstanding
    }
  }

  return (
    <div className="space-y-6">
      <ViewHeading
        title="Reports & Exports"
        description="Download registrar-ready CSV files — they open directly in Excel or Google Sheets."
      />

      <QueryBoundary
        status={status}
        error={error}
        onRetry={() => void refetch()}
        skeleton={<KpiGridSkeleton count={3} />}
      >
        {stats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {kinds.map((kind, i) => {
              const Icon = kind.icon
              const count = rowCount(kind.key)
              const isDownloading = downloading === kind.key
              const isPayments = kind.key === 'payments'
              return (
                <motion.div
                  key={kind.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  className={isPayments ? 'sm:col-span-2 xl:col-span-1' : undefined}
                >
                  <Card className="flex h-full flex-col">
                    <CardContent className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-primary dark:bg-brand-100">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-display text-sm font-semibold">{kind.title}</p>
                            <Badge variant="secondary" className="text-[10px]">
                              {count === null ? '…' : `${count} row${count === 1 ? '' : 's'}`}
                            </Badge>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            {kind.description}
                          </p>
                        </div>
                      </div>

                      {isPayments && (
                        <div
                          className="grid grid-cols-1 gap-3 rounded-xl border bg-muted/40 p-3 sm:grid-cols-2"
                          aria-label="Payments export date range"
                        >
                          <div className="space-y-1.5">
                            <Label htmlFor="pay-from" className="text-xs font-medium">
                              From date
                            </Label>
                            <Input
                              id="pay-from"
                              type="date"
                              className="h-11 bg-background"
                              value={from}
                              max={to || undefined}
                              onChange={(e) => setFrom(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="pay-to" className="text-xs font-medium">
                              To date
                            </Label>
                            <Input
                              id="pay-to"
                              type="date"
                              className="h-11 bg-background"
                              value={to}
                              min={from || undefined}
                              onChange={(e) => setTo(e.target.value)}
                            />
                          </div>
                          <div className="flex items-center gap-2 sm:col-span-2">
                            <CalendarRange
                              className="h-4 w-4 shrink-0 text-muted-foreground"
                              aria-hidden="true"
                            />
                            <p className="text-xs text-muted-foreground">
                              {hasRange ? 'Range applied — row count above reflects the filter.' : 'Leave blank for all-time payments.'}
                            </p>
                            {hasRange && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="ml-auto min-h-11 px-2"
                                aria-label="Clear payments date range"
                                onClick={() => {
                                  setFrom('')
                                  setTo('')
                                }}
                              >
                                <X className="h-4 w-4" aria-hidden="true" />
                                Clear
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-auto flex items-center gap-2">
                        <Button
                          variant="outline"
                          className="min-h-11 flex-1 hover:border-gold-400/60 hover:bg-gold-400/10 hover:text-gold-700 dark:hover:text-gold-300"
                          disabled={downloading !== null}
                          onClick={() => void downloadCsv(kind)}
                        >
                          {isDownloading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                              Preparing…
                            </>
                          ) : (
                            <>
                              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                              Download CSV
                            </>
                          )}
                        </Button>
                      </div>
                      {isPayments && count === 0 && (
                        <p role="note" className="text-xs font-medium text-gold-700 dark:text-gold-400">
                          No payments in the selected range — widen the dates or clear the filter.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}

            {/* How-to card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.2 }}
            >
              <Card className="rule-top-gold h-full border-primary/20 bg-primary/5">
                <CardContent className="flex h-full flex-col gap-3 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-primary dark:bg-brand-100">
                      <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-sm font-semibold">Working with exports</p>
                      <ul className="mt-2 space-y-2 text-xs leading-relaxed text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                          <span>
                            Files are UTF-8 with a BOM, so accents and symbols open correctly in
                            Excel and Google Sheets.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                          <span>
                            Fee amounts are plain numbers — totals and balances can be computed
                            with spreadsheet formulas.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                          <span>
                            Exports respect your access — sign in as the registrar to download
                            student records.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </QueryBoundary>
    </div>
  )
}
