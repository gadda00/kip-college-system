'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  BadgeCheck,
  Banknote,
  Clock,
  Landmark,
  Printer,
  Receipt,
  Smartphone,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/kip/components/empty-state'
import { QueryBoundary } from '@/components/kip/components/loading'
import { api, post } from '@/components/kip/lib/api'
import { fmtDate, fmtDateTime, fmtKES } from '@/components/kip/lib/format'
import { usePrintDoc } from '@/components/kip/portal/print-doc'
import {
  FeeStatementDoc,
  buildStatementRows,
  type StatementRow,
} from '@/components/kip/portal/student/views/print-docs'
import {
  KpiGridSkeleton,
  LoadErrorCard,
  PaymentStatusBadge,
  TableSkeleton,
  ViewHeading,
} from '@/components/kip/portal/shared'
import type {
  FeeStatement,
  PayFeeResponse,
  StudentProfileFull,
} from '@/components/kip/portal/types'
import { cn } from '@/lib/utils'

const KE_PHONE = /^(?:\+?254|0)7\d{8}$/

export function FeesView() {
  const { data, status, error, refetch } = useQuery<FeeStatement>({
    queryKey: ['student-fees'],
    queryFn: () => api<FeeStatement>('/api/student/fees'),
  })

  // student identity for the official printable statement (letterhead block)
  const profile = useQuery<StudentProfileFull>({
    queryKey: ['student-profile'],
    queryFn: () => api<StudentProfileFull>('/api/student/profile'),
    enabled: status === 'success',
  })

  const { print, printDoc } = usePrintDoc(() =>
    data && profile.data ? <FeeStatementDoc profile={profile.data} statement={data} /> : null,
  )

  return (
    <QueryBoundary
      status={status}
      error={error}
      onRetry={() => void refetch()}
      skeleton={
        <div className="space-y-6">
          <TableSkeleton rows={1} />
          <KpiGridSkeleton count={3} />
          <TableSkeleton rows={6} />
        </div>
      }
    >
      {data && (
        <>
          {/* profile feeds the printable statement — surface failures instead
              of silently printing nothing */}
          {profile.isError && (
            <LoadErrorCard
              compact
              what="your profile for the printable statement"
              error={profile.error}
              onRetry={() => void profile.refetch()}
            />
          )}
          <FeesBody data={data} onPrint={print} printDoc={printDoc} />
        </>
      )}
    </QueryBoundary>
  )
}

function FeesBody({
  data,
  onPrint,
  printDoc,
}: {
  data: FeeStatement
  onPrint: () => void
  printDoc: React.ReactNode
}) {
  const balanceColor =
    data.balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'

  // confirmation split: only CONFIRMED payments count toward the balance;
  // PENDING submissions await the finance office, REJECTED never count
  const confirmedCount = data.payments.filter((p) => p.status === 'CONFIRMED').length
  const pendingCount = data.payments.filter((p) => p.status === 'PENDING').length

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <ViewHeading
          title="Fees"
          description="Your fee statement, payments and self-service M-Pesa / bank top-ups."
          actions={
            <Button variant="outline" className="focus-glow min-h-11" onClick={onPrint}>
              <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
              Download statement
            </Button>
          }
        />
      </motion.div>

      {/* Summary cards */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        aria-label="Fee summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <SummaryCard
          icon={Receipt}
          label="Total charged"
          value={fmtKES(data.totalCharged)}
          hint="Tuition, registration & exam fees"
        />
        <SummaryCard
          icon={BadgeCheck}
          label="Total paid"
          value={fmtKES(data.totalPaid)}
          hint={`${confirmedCount} confirmed payment${confirmedCount === 1 ? '' : 's'}${
            pendingCount > 0 ? ` · ${pendingCount} pending` : ''
          }`}
        />
        <Card className={cn('relative rule-top-gold', data.balance > 0 && 'border-red-200 dark:border-red-900/50')}>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">Outstanding balance</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-400/15 text-gold-700 dark:text-gold-400">
                <Wallet className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p
              className={cn(
                'font-display tnum mt-2 text-2xl font-bold tracking-tight sm:text-3xl',
                balanceColor,
              )}
            >
              {fmtKES(data.balance)}
            </p>
            <p
              className={cn(
                'mt-1 text-xs font-medium',
                data.balance > 0
                  ? 'text-red-600/80 dark:text-red-400/80'
                  : 'text-green-600/80 dark:text-green-400/80',
              )}
            >
              {data.balance > 0 ? 'Please settle to avoid exam holds' : 'All fees cleared'}
            </p>
          </CardContent>
        </Card>
      </motion.section>

      {/* PENDING explainer — only when submissions await the finance office */}
      {pendingCount > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.08 }}
          aria-live="polite"
        >
          <Card className="border-warning/30 bg-warning/10">
            <CardContent className="flex items-start gap-3 p-4">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/15 text-warning-foreground"
                aria-hidden="true"
              >
                <Clock className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-warning-foreground">
                  {pendingCount} payment{pendingCount === 1 ? '' : 's'} awaiting confirmation
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  These payments await finance confirmation and don&rsquo;t yet reduce your balance.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      )}

      <PayFeesCard balance={data.balance} />

      <PaymentsCard data={data} />

      <StatementTable data={data} confirmedCount={confirmedCount} />

      {printDoc}
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Receipt
  label: string
  value: string
  hint: string
}) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600/10 text-brand-700 dark:text-brand-300">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <p className="font-display mt-2 text-2xl font-bold tracking-tight tabular-nums">{value}</p>
        <p className="mt-1 text-xs font-medium text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Payment dialog
// ---------------------------------------------------------------------------

function PayFeesCard({ balance }: { balance: number }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(() => (balance > 0 ? String(balance) : ''))
  const [method, setMethod] = useState<'MPESA' | 'BANK'>('MPESA')
  const [phone, setPhone] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<PayFeeResponse | null>(null)

  /** Close + reset the form for the next open (event-driven, not an effect). */
  const closeDialog = () => {
    setOpen(false)
    setReceipt(null)
    setFormError(null)
    setAmount(balance > 0 ? String(balance) : '')
  }

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setOpen(true)
    } else {
      closeDialog()
    }
  }

  const pay = useMutation({
    mutationFn: () =>
      post<PayFeeResponse>('/api/student/fees/pay', {
        amount: Number(amount),
        method,
        ...(method === 'MPESA' ? { phone: phone.replace(/\s+/g, '') } : {}),
      }),
    onSuccess: (res) => {
      setReceipt(res)
      // PENDING intent: the balance only drops once finance confirms
      toast.success('Payment submitted — the finance office will confirm shortly', {
        description: `${fmtKES(res.payment.amount)} via ${
          res.payment.method === 'MPESA' ? 'M-Pesa' : 'bank transfer'
        } · Ref ${res.payment.reference}`,
      })
      void queryClient.invalidateQueries({ queryKey: ['student-fees'] })
      void queryClient.invalidateQueries({ queryKey: ['student-dashboard'] })
    },
    onError: (err) => {
      setFormError(err instanceof Error ? err.message : 'Payment failed — please try again.')
    },
  })

  const validate = (): boolean => {
    const value = Number(amount)
    if (!amount.trim() || Number.isNaN(value) || value <= 0) {
      setFormError('Enter a valid amount (minimum KES 1).')
      return false
    }
    if (value > 1_000_000) {
      setFormError('Amount is too large — visit the finance office for payments above KES 1,000,000.')
      return false
    }
    if (method === 'MPESA' && !KE_PHONE.test(phone.replace(/\s+/g, ''))) {
      setFormError('Enter a valid Safaricom number e.g. 0703 710 879.')
      return false
    }
    return true
  }

  const handleConfirm = () => {
    if (!validate()) return
    setFormError(null)
    pay.mutate()
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      aria-labelledby="make-payment"
      className="print:hidden"
    >
      <Card className="relative rule-top-gold bg-gradient-to-br from-brand-50/70 via-card to-card dark:from-brand-100/15 dark:via-card dark:to-card">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-400/15 text-gold-700 dark:text-gold-400">
              <Smartphone className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="make-payment" className="font-display text-base font-semibold">
                Make a payment
              </h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Pay via M-Pesa or bank transfer directly from the portal. The finance office confirms
                each payment before it reflects on your balance.
              </p>
              <p className="mt-2.5">
                <span className="inline-flex flex-wrap items-center gap-1.5 rounded-lg border border-gold-400/40 bg-gold-400/10 px-2.5 py-1.5 text-[11px] font-medium text-gold-700 dark:text-gold-300">
                  <Smartphone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  M-Pesa Paybill <strong className="font-mono font-bold">522 890</strong> · Account:
                  your admission number
                </span>
              </p>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Confirm current paybill with the finance office — 0703 710 879.
              </p>
            </div>
          </div>
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button size="lg" className="focus-glow min-h-11 shrink-0">
                <Wallet className="mr-2 h-4 w-4" aria-hidden="true" />
                Pay now
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              {receipt ? (
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/15 text-warning">
                    <Clock className="h-8 w-8" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">Payment submitted</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {fmtKES(receipt.payment.amount)} via{' '}
                      {receipt.payment.method === 'MPESA' ? 'M-Pesa' : 'Bank transfer'} — awaiting
                      finance confirmation
                    </p>
                  </div>
                  <div className="w-full rounded-lg border bg-muted/40 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Transaction reference
                    </p>
                    <p className="mt-1 font-mono text-base font-bold text-brand-700 dark:text-gold-400">
                      {receipt.payment.reference}
                    </p>
                  </div>
                  <div className="flex w-full items-center justify-between gap-4 rounded-lg border p-4">
                    <span className="text-sm font-medium text-muted-foreground">
                      Balance (until confirmed)
                    </span>
                    <span
                      className={cn(
                        'tnum text-lg font-bold',
                        receipt.balance > 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400',
                      )}
                    >
                      {fmtKES(receipt.balance)}
                    </span>
                  </div>
                  <p className="text-left text-xs leading-relaxed text-muted-foreground">
                    The finance office verifies submitted payments before they count. Watch the
                    payments table below — the status shows <strong>Pending</strong> until confirmed.
                  </p>
                  <Button onClick={closeDialog} className="min-h-11 w-full">
                    Done
                  </Button>
                </div>
              ) : (
                <>
                  <DialogHeader>
                    <DialogTitle>Make a payment</DialogTitle>
                    <DialogDescription>
                      {balance > 0
                        ? `Your outstanding balance is ${fmtKES(balance)}.`
                        : 'You are fully paid — any extra payment is carried forward as credit.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pay-amount">Amount (KES)</Label>
                      <Input
                        id="pay-amount"
                        type="number"
                        min={1}
                        inputMode="numeric"
                        placeholder="e.g. 5000"
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value)
                          setFormError(null)
                        }}
                        className="h-11"
                        aria-invalid={Boolean(formError)}
                      />
                      {balance > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {[balance, 5000, 10000].slice(0, 3).map((v, i) =>
                            v > 0 && (i === 0 || v < balance) ? (
                              <button
                                key={v}
                                type="button"
                                onClick={() => setAmount(String(v))}
                                className="focus-glow rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-gold-400/50 hover:text-gold-700 dark:hover:text-gold-400"
                              >
                                {fmtKES(v)}
                              </button>
                            ) : null,
                          )}
                        </div>
                      )}
                    </div>

                    <fieldset className="space-y-2">
                      <legend className="text-sm font-medium">Payment method</legend>
                      <RadioGroup
                        value={method}
                        onValueChange={(v) => {
                          setMethod(v === 'BANK' ? 'BANK' : 'MPESA')
                          setFormError(null)
                        }}
                        className="grid grid-cols-2 gap-3"
                      >
                        <Label
                          htmlFor="pay-mpesa"
                          className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors has-[button[data-state=checked]]:border-gold-500 has-[button[data-state=checked]]:bg-gold-400/10"
                        >
                          <RadioGroupItem id="pay-mpesa" value="MPESA" />
                          <Smartphone className="h-4 w-4 text-gold-600 dark:text-gold-400" aria-hidden="true" />
                          <span className="text-sm font-medium">M-Pesa</span>
                        </Label>
                        <Label
                          htmlFor="pay-bank"
                          className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors has-[button[data-state=checked]]:border-gold-500 has-[button[data-state=checked]]:bg-gold-400/10"
                        >
                          <RadioGroupItem id="pay-bank" value="BANK" />
                          <Landmark className="h-4 w-4 text-gold-600 dark:text-gold-400" aria-hidden="true" />
                          <span className="text-sm font-medium">Bank</span>
                        </Label>
                      </RadioGroup>
                    </fieldset>

                    {method === 'MPESA' && (
                      <div className="space-y-2">
                        <Label htmlFor="pay-phone">M-Pesa phone number</Label>
                        <Input
                          id="pay-phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder="0703 710 879"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value)
                            setFormError(null)
                          }}
                          className="h-11"
                          aria-invalid={Boolean(formError)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Match the number you&rsquo;ll pay from — the finance office confirms it
                          against the M-Pesa receipt.
                        </p>
                      </div>
                    )}

                    {method === 'BANK' && (
                      <div className="rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                        <p className="font-semibold text-foreground">KIP College bank details</p>
                        <p className="mt-1">
                          Equity Bank · Kitui Branch · Acc 0123 4567 8901 · KIP COLLEGE
                        </p>
                        <p>
                          Use your admission number as the reference, then submit below so the
                          finance office can confirm it.
                        </p>
                      </div>
                    )}

                    {formError && (
                      <p role="alert" className="text-sm font-medium text-destructive">
                        {formError}
                      </p>
                    )}
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={closeDialog} className="min-h-11">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      disabled={pay.isPending}
                      className="min-h-11"
                    >
                      {pay.isPending ? (
                        <>
                          <span
                            className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground"
                            aria-hidden="true"
                          />
                          Submitting…
                        </>
                      ) : (
                        <>
                          <Banknote className="mr-2 h-4 w-4" aria-hidden="true" />
                          Submit {amount ? fmtKES(Number(amount) || 0) : ''}
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </motion.section>
  )
}

// ---------------------------------------------------------------------------
// Payments table (all payments with their confirmation status)
// ---------------------------------------------------------------------------

/** Method label chip shared by the payments table rows. */
function methodLabel(method: string): string {
  if (method === 'MPESA') return 'M-Pesa'
  if (method === 'BANK') return 'Bank'
  if (method === 'CASH') return 'Cash'
  return method
}

/**
 * Every payment on the account with its status — the PENDING submissions
 * the finance office still needs to confirm appear here with a warning
 * badge and do NOT reduce the balance.
 */
function PaymentsCard({ data }: { data: FeeStatement }) {
  // API returns payments newest first (orderBy paidAt desc)
  const payments = data.payments

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.12 }}
      aria-labelledby="payments-table"
    >
      <Card>
        <CardHeader className="pb-4">
          <CardTitle id="payments-table" className="flex items-center gap-2 text-base">
            <Wallet className="h-4 w-4 text-gold-600 dark:text-gold-400" aria-hidden="true" />
            Payments
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            All {payments.length} payment{payments.length === 1 ? '' : 's'} on your account —
            pending ones don&rsquo;t reduce your balance until finance confirms them.
          </p>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No payments yet"
              hint="M-Pesa and bank payments you submit will appear here with their status."
              className="py-10"
            />
          ) : (
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {/* Desktop / print table */}
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="bg-brand-50 text-[11px] uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-brand-100">
                        Date
                      </TableHead>
                      <TableHead className="bg-brand-50 text-[11px] uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-brand-100">
                        Method
                      </TableHead>
                      <TableHead className="bg-brand-50 text-[11px] uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-brand-100">
                        Reference
                      </TableHead>
                      <TableHead className="bg-brand-50 text-right text-[11px] uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-brand-100">
                        Amount
                      </TableHead>
                      <TableHead className="bg-brand-50 text-[11px] uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-brand-100">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow
                        key={p.id}
                        className={cn(
                          'transition-colors hover:bg-brand-50/60 dark:hover:bg-brand-100/15',
                          p.status === 'PENDING'
                            ? 'bg-warning/5'
                            : p.status === 'REJECTED'
                              ? 'bg-destructive/5'
                              : 'odd:bg-muted/40',
                        )}
                      >
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {fmtDateTime(p.paidAt)}
                        </TableCell>
                        <TableCell className="text-sm font-medium">{methodLabel(p.method)}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {p.reference}
                        </TableCell>
                        <TableCell className="tnum whitespace-nowrap text-right text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                          {fmtKES(p.amount)}
                        </TableCell>
                        <TableCell>
                          <PaymentStatusBadge status={p.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile stacked cards */}
              <ul className="space-y-3 md:hidden">
                {payments.map((p) => (
                  <li
                    key={p.id}
                    className={cn(
                      'rounded-xl border p-4',
                      p.status === 'PENDING'
                        ? 'border-warning/30 bg-warning/10'
                        : p.status === 'REJECTED'
                          ? 'border-destructive/30 bg-destructive/5'
                          : 'border-emerald-600/25 bg-emerald-500/5',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{methodLabel(p.method)} payment</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {fmtDateTime(p.paidAt)}
                        </p>
                      </div>
                      <p className="tnum shrink-0 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                        {fmtKES(p.amount)}
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <PaymentStatusBadge status={p.status} />
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {p.reference}
                      </Badge>
                      {p.note && (
                        <span className="max-w-full truncate text-[11px] text-muted-foreground">
                          {p.note}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.section>
  )
}

// ---------------------------------------------------------------------------
// Statement table
// ---------------------------------------------------------------------------

function feeTypeBadge(type: string) {
  const base =
    'inline-flex w-fit items-center justify-center whitespace-nowrap shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium'
  switch (type) {
    case 'TUITION':
      return (
        <span className={cn(base, 'border-transparent bg-brand-600/10 text-brand-700 dark:text-brand-300')}>
          Tuition
        </span>
      )
    case 'REGISTRATION':
      return <Badge variant="secondary">Registration</Badge>
    case 'EXAM':
      return (
        <span
          className={cn(
            base,
            'border-transparent bg-gold-400/15 text-gold-700 dark:text-gold-300',
          )}
        >
          Exam
        </span>
      )
    case 'PAYMENT':
      return (
        <span
          className={cn(
            base,
            'border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
          )}
        >
          Payment
        </span>
      )
    default:
      return <Badge variant="outline">Other</Badge>
  }
}

/** Running balance display: negative = credit paid ahead (bank-statement style). */
function fmtRunningBalance(value: number): string {
  return value < 0 ? `${fmtKES(Math.abs(value))} CR` : fmtKES(value)
}

function StatementTable({ data, confirmedCount }: { data: FeeStatement; confirmedCount: number }) {
  // buildStatementRows (print-docs.tsx) returns chronological order with
  // CONFIRMED payments only; the on-screen table shows newest first
  const rows = useMemo<StatementRow[]>(() => buildStatementRows(data).reverse(), [data])

  const empty = rows.length === 0

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.15 }}
      aria-labelledby="fee-statement"
    >
      <Card>
        <CardHeader className="pb-4">
          <CardTitle id="fee-statement" className="flex items-center gap-2 text-base">
            <Receipt className="h-4 w-4 text-gold-600 dark:text-gold-400" aria-hidden="true" />
            Fee statement
          </CardTitle>
        </CardHeader>
        <CardContent>
          {empty ? (
            <EmptyState
              icon={Receipt}
              title="No transactions yet"
              hint="Fee charges and payments will appear here."
              className="py-10"
            />
          ) : (
            <>
              {/* Desktop / print table */}
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="bg-brand-50 text-[11px] uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-brand-100">
                        Date
                      </TableHead>
                      <TableHead className="bg-brand-50 text-[11px] uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-brand-100">
                        Description
                      </TableHead>
                      <TableHead className="bg-brand-50 text-[11px] uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-brand-100">
                        Type
                      </TableHead>
                      <TableHead className="bg-brand-50 text-[11px] uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-brand-100">
                        Due
                      </TableHead>
                      <TableHead className="bg-brand-50 text-right text-[11px] uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-brand-100">
                        Amount
                      </TableHead>
                      <TableHead className="bg-brand-50 text-right text-[11px] uppercase tracking-[0.14em] text-brand-800 dark:bg-brand-100 dark:text-brand-100">
                        Balance
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow
                        key={row.key}
                        className={cn(
                          'transition-colors hover:bg-brand-50/60 dark:hover:bg-brand-100/15',
                          row.type === 'PAYMENT' ? 'bg-emerald-500/5' : 'odd:bg-muted/40',
                        )}
                      >
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {fmtDate(row.date)}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate text-sm font-medium">{row.description}</p>
                          {row.reference && (
                            <p className="font-mono text-[10px] text-muted-foreground">
                              Ref {row.reference}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>{feeTypeBadge(row.type)}</TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {row.due ? fmtDate(row.due) : '—'}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'whitespace-nowrap text-right text-sm font-semibold',
                            row.type === 'PAYMENT'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-foreground/80',
                          )}
                        >
                          {row.type === 'PAYMENT'
                            ? `− ${fmtKES(Math.abs(row.amount))}`
                            : fmtKES(row.amount)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'whitespace-nowrap text-right text-sm',
                            row.runningBalance < 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-muted-foreground',
                          )}
                        >
                          {fmtRunningBalance(row.runningBalance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="bg-brand-50/70 hover:bg-brand-50/70 dark:bg-brand-100/25 dark:hover:bg-brand-100/25">
                      <TableCell colSpan={4} className="text-sm font-semibold">
                        Totals · {data.feeItems.length} charges, {confirmedCount} confirmed payment
                        {confirmedCount === 1 ? '' : 's'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-sm">
                        <span className="text-foreground/70">Charged {fmtKES(data.totalCharged)}</span>
                        <br />
                        <span className="text-emerald-700 dark:text-emerald-400">
                          Paid {fmtKES(data.totalPaid)}
                        </span>
                      </TableCell>
                      <TableCell
                        className={cn(
                          'font-display whitespace-nowrap text-right text-sm font-bold',
                          data.balance > 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-green-600 dark:text-green-400',
                        )}
                      >
                        Balance
                        <br />
                        {fmtKES(data.balance)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>

              {/* Mobile stacked cards */}
              <ul className="space-y-3 md:hidden">
                {rows.map((row) => (
                  <li
                    key={row.key}
                    className={cn(
                      'rounded-xl border p-4',
                      row.type === 'PAYMENT' && 'border-emerald-600/25 bg-emerald-500/5',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-snug">{row.description}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{fmtDate(row.date)}</p>
                      </div>
                      <p
                        className={cn(
                          'shrink-0 text-sm font-bold',
                          row.type === 'PAYMENT'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-foreground/80',
                        )}
                      >
                        {row.type === 'PAYMENT'
                          ? `− ${fmtKES(Math.abs(row.amount))}`
                          : fmtKES(row.amount)}
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {feeTypeBadge(row.type)}
                      {row.due && (
                        <Badge variant="outline" className="text-[10px] font-medium">
                          Due {fmtDate(row.due)}
                        </Badge>
                      )}
                      {row.reference && (
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {row.reference}
                        </Badge>
                      )}
                      <span
                        className={cn(
                          'ml-auto text-xs',
                          row.runningBalance < 0
                            ? 'font-medium text-green-600 dark:text-green-400'
                            : 'text-muted-foreground',
                        )}
                      >
                        Bal {fmtRunningBalance(row.runningBalance)}
                      </span>
                    </div>
                  </li>
                ))}
                <li className="rounded-xl border border-dashed p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Charged</span>
                    <span className="font-display font-semibold tabular-nums">{fmtKES(data.totalCharged)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Paid</span>
                    <span className="font-display font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                      {fmtKES(data.totalPaid)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t pt-2">
                    <span className="text-sm font-semibold">Balance</span>
                    <span
                      className={cn(
                        'font-display text-base font-bold tabular-nums',
                        data.balance > 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400',
                      )}
                    >
                      {fmtKES(data.balance)}
                    </span>
                  </div>
                </li>
              </ul>
            </>
          )}
        </CardContent>
      </Card>
    </motion.section>
  )
}
