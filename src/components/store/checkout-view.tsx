'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle, ArrowRight, BadgeCheck, CheckCircle2, CreditCard, Loader2, Lock,
  MapPin, PartyPopper, Phone, ShoppingBag, Smartphone, Store, Truck, Wallet, Star,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { ProductImage } from '@/components/shared/book-cover'
import { kes, MpesaBadge } from '@/components/shared/ui-bits'
import { useCartStore, cartSubtotal } from '@/stores/cart-store'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { DELIVERY_ZONES, FREE_DELIVERY_THRESHOLD } from '@/lib/pricing'
import { cn } from '@/lib/utils'

type Step = 'details' | 'payment' | 'stkpush' | 'success'

export function CheckoutView() {
  const navigate = useUIStore((s) => s.navigate)
  const { items, clear } = useCartStore()
  const user = useAuthStore((s) => s.user)
  const refreshUser = useAuthStore((s) => s.refresh)
  const subtotal = cartSubtotal(items)

  const [step, setStep] = useState<Step>('details')
  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    zoneId: 'kitui-town',
    notes: '',
  })
  const [deliveryMethod, setDeliveryMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY')
  const [paymentMethod, setPaymentMethod] = useState<'MPESA' | 'COD'>('MPESA')
  const [mpesaPhone, setMpesaPhone] = useState(user?.phone ?? '')
  const [usePoints, setUsePoints] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [stkStatus, setStkStatus] = useState<'sending' | 'waiting' | 'checking' | 'done'>('sending')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const zone = DELIVERY_ZONES.find((z) => z.id === form.zoneId)!
  const freeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD
  const deliveryFee = deliveryMethod === 'PICKUP' || freeDelivery ? 0 : zone.fee
  const maxRedeem = user ? Math.min(user.loyaltyPoints, Math.floor(subtotal * 0.3)) : 0
  const discount = usePoints ? maxRedeem : 0
  const total = Math.max(0, subtotal + deliveryFee - discount)

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  const placeOrder = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error('Please fill in your name and phone number')
      return
    }
    if (deliveryMethod === 'DELIVERY' && !form.address.trim()) {
      toast.error('Please enter a delivery address')
      return
    }
    if (paymentMethod === 'MPESA' && !/^(\+?254|0)7\d{8}$|^(\+?254|0)1\d{8}$/.test(mpesaPhone.replace(/\s/g, ''))) {
      toast.error('Enter a valid Safaricom number, e.g. 0712 345 678')
      return
    }
    setPlacing(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          paymentMethod,
          mpesaPhone: paymentMethod === 'MPESA' ? mpesaPhone.replace(/\s/g, '') : null,
          deliveryMethod,
          zoneId: form.zoneId,
          address: form.address,
          town: zone.name,
          phone: form.phone,
          notes: form.notes,
          usePoints,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not place order')
      setOrder(data.order)
      if (paymentMethod === 'MPESA') {
        setStep('stkpush')
        simulateStk(data.order.orderNumber)
      } else {
        clear()
        setStep('success')
        refreshUser()
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setPlacing(false)
    }
  }

  const simulateStk = async (orderNumber: string) => {
    setStkStatus('sending')
    try {
      // Initiate STK push
      const res = await fetch('/api/mpesa/stk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, phone: mpesaPhone }),
      })
      const stk = await res.json()
      if (!res.ok) throw new Error(stk.error)
      toast.info('M-Pesa request sent — check your phone! 📱', { duration: 6000 })
      setStkStatus('waiting')

      // Poll for the simulated callback
      let ticks = 0
      pollRef.current = setInterval(async () => {
        ticks++
        try {
          const trackRes = await fetch(`/api/orders/${orderNumber}`)
          const track = await trackRes.json()
          if (track.order?.paymentStatus === 'PAID') {
            if (pollRef.current) clearInterval(pollRef.current)
            setStkStatus('done')
            setTimeout(() => {
              clear()
              setStep('success')
              refreshUser()
            }, 1400)
          } else if (ticks > 20) {
            if (pollRef.current) clearInterval(pollRef.current)
            toast.error('Payment timed out. Try again or choose Cash on Delivery.')
            setStkStatus('checking')
          }
        } catch {}
      }, 1500)
    } catch (e: any) {
      toast.error(e.message || 'Could not send M-Pesa request')
      setStep('payment')
    }
  }

  if (items.length === 0 && step !== 'success') {
    return (
      <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-muted">
          <ShoppingBag size={36} className="text-muted-foreground" />
        </div>
        <h1 className="text-xl font-black">Nothing to checkout</h1>
        <p className="text-sm text-muted-foreground">Your cart is empty. Add some books first!</p>
        <Button onClick={() => navigate('shop')}>Browse products <ArrowRight size={15} /></Button>
      </main>
    )
  }

  // ============ SUCCESS STEP ============
  if (step === 'success' && order) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-center">
        <div className="animate-fade-up space-y-6">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 animate-pulse-ring">
            <PartyPopper size={38} />
          </div>
          <div>
            <h1 className="text-3xl font-black">
              {order.paymentStatus === 'PAID' ? 'Payment received!' : 'Order confirmed!'}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Asante sana{form.name ? `, ${form.name.split(' ')[0]}` : ''}! Your order is being prepared.
            </p>
          </div>

          <Card className="text-left">
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Order Number</p>
                  <p className="text-2xl font-black tracking-tight text-primary">{order.orderNumber}</p>
                </div>
                {order.paymentStatus === 'PAID' && (
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">M-Pesa Receipt</p>
                    <p className="font-mono font-bold">{order.mpesaRef}</p>
                  </div>
                )}
              </div>
              <Separator />
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Items</span><span>{order.items?.length ?? 0} products</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{order.deliveryMethod === 'PICKUP' ? 'Store pickup' : zone.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total paid</span><span className="font-bold text-primary">{kes(order.total)}</span></div>
                {order.pointsEarned > 0 && (
                  <div className="flex justify-between text-amber-600 dark:text-amber-400">
                    <span className="flex items-center gap-1"><Star size={13} className="fill-current" /> Loyalty earned</span>
                    <span className="font-bold">{order.pointsEarned} points</span>
                  </div>
                )}
              </div>
              <Separator />
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  {order.deliveryMethod === 'PICKUP' ? <Store size={15} className="text-primary" /> : <Truck size={15} className="text-primary" />}
                  {order.deliveryMethod === 'PICKUP'
                    ? 'Collect at KIPS Building, Kitui Town CBD — ready in 2 hours.'
                    : `Delivery to ${order.address || 'your address'} — ${zone.eta}. We'll call ${order.phone} on arrival.`}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" onClick={() => navigate('track', { orderNumber: order.orderNumber })}>
              Track my order
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('shop')}>
              Continue shopping
            </Button>
          </div>
        </div>
      </main>
    )
  }

  // ============ STK PUSH STEP ============
  if (step === 'stkpush') {
    return (
      <main className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
              {stkStatus === 'done' ? <CheckCircle2 size={32} /> : <Smartphone size={30} className={stkStatus === 'sending' ? 'animate-bounce' : ''} />}
            </div>
            <CardTitle className="text-xl">
              {stkStatus === 'sending' && 'Sending M-Pesa request…'}
              {stkStatus === 'waiting' && 'Enter your M-Pesa PIN'}
              {stkStatus === 'done' && 'Payment successful!'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center text-sm">
            <p className="text-muted-foreground">
              {stkStatus === 'sending' && 'Contacting Safaricom M-Pesa…'}
              {stkStatus === 'waiting' && (
                <>
                  A payment request of <strong className="text-foreground">{kes(total)}</strong> was sent to{' '}
                  <strong className="text-foreground">{mpesaPhone}</strong>.
                  <br />Enter your PIN on your phone to authorise.
                </>
              )}
              {stkStatus === 'done' && 'Confirming your payment…'}
            </p>
            {stkStatus !== 'done' && <Progress value={stkStatus === 'sending' ? 15 : 70} className="h-1.5" />}
            <div className="rounded-lg border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground">
              <p className="flex items-center justify-center gap-1.5">
                <Lock size={12} /> Simulated Safaricom Daraja STK flow — no real money moves.
              </p>
            </div>
            {stkStatus === 'waiting' && (
              <p className="text-xs text-muted-foreground">Waiting for payment confirmation… (about 10 seconds)</p>
            )}
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={() => {
                if (pollRef.current) clearInterval(pollRef.current)
                setStep('payment')
                toast.info('Checkout paused — your order is saved')
              }}
            >
              Cancel & choose another method
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  // ============ DETAILS / PAYMENT STEPS ============
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      {/* Steps indicator */}
      <div className="mb-8 flex items-center justify-center gap-2 text-sm">
        {['Details', 'Payment', 'Confirmation'].map((label, i) => {
          const active = (step === 'details' && i === 0) || (step === 'payment' && i === 1)
          const done = step === 'payment' && i === 0
          return (
            <div key={label} className="flex items-center gap-2">
              <span
                className={cn(
                  'flex size-7 items-center justify-center rounded-full border text-xs font-bold',
                  done && 'border-primary bg-primary text-primary-foreground',
                  active && 'border-primary text-primary',
                  !done && !active && 'border-muted-foreground/30 text-muted-foreground'
                )}
              >
                {done ? <CheckCircle2 size={14} /> : i + 1}
              </span>
              <span className={cn('font-medium', active ? 'text-foreground' : 'text-muted-foreground')}>{label}</span>
              {i < 2 && <div className="h-px w-8 bg-border sm:w-14" />}
            </div>
          )
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* LEFT: forms */}
        <div className="space-y-6">
          {step === 'details' && (
            <div className="animate-fade-up space-y-6">
              {/* Delivery method */}
              <Card>
                <CardHeader><CardTitle className="text-lg">How should we get it to you?</CardTitle></CardHeader>
                <CardContent>
                  <RadioGroup
                    value={deliveryMethod}
                    onValueChange={(v) => setDeliveryMethod(v as any)}
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    <label className={cn('flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors', deliveryMethod === 'DELIVERY' && 'border-primary bg-primary/5')}>
                      <RadioGroupItem value="DELIVERY" className="mt-1" />
                      <div>
                        <p className="flex items-center gap-2 font-semibold"><Truck size={16} className="text-primary" /> Delivery</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {freeDelivery ? 'FREE on this order! 🎉' : `From KES 100 — same day in town`}
                        </p>
                      </div>
                    </label>
                    <label className={cn('flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors', deliveryMethod === 'PICKUP' && 'border-primary bg-primary/5')}>
                      <RadioGroupItem value="PICKUP" className="mt-1" />
                      <div>
                        <p className="flex items-center gap-2 font-semibold"><Store size={16} className="text-primary" /> Pick up in store</p>
                        <p className="mt-1 text-xs text-muted-foreground">Ready in 2 hours — Kitui Town CBD</p>
                      </div>
                    </label>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Contact */}
              <Card>
                <CardHeader><CardTitle className="text-lg">Your details</CardTitle></CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="co-name">Full name *</Label>
                    <Input id="co-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Jane Mwangi" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="co-phone">Phone (M-Pesa number) *</Label>
                    <Input id="co-phone" value={form.phone} onChange={(e) => { setForm({ ...form, phone: e.target.value }); setMpesaPhone(e.target.value) }} placeholder="07XX XXX XXX" inputMode="tel" />
                  </div>
                  {deliveryMethod === 'DELIVERY' && (
                    <>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor="co-address">Delivery address / landmark *</Label>
                        <Input id="co-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="e.g. Plot 45, Majengo Estate, near Kitui School gate" />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label>Delivery zone</Label>
                        <RadioGroup value={form.zoneId} onValueChange={(v) => setForm({ ...form, zoneId: v })} className="grid gap-2 sm:grid-cols-2">
                          {DELIVERY_ZONES.map((z) => (
                            <label key={z.id} className={cn('flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-sm transition-colors', form.zoneId === z.id && 'border-primary bg-primary/5')}>
                              <RadioGroupItem value={z.id} className="mt-0.5" />
                              <div>
                                <p className="font-medium">{z.name}</p>
                                <p className="text-xs text-muted-foreground">{z.eta} — {freeDelivery ? 'FREE' : kes(z.fee)}</p>
                              </div>
                            </label>
                          ))}
                        </RadioGroup>
                      </div>
                    </>
                  )}
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="co-notes">Order notes (optional)</Label>
                    <Textarea id="co-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="e.g. Call when arriving; gift-wrap the story books" />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button size="lg" className="rounded-full px-8" onClick={() => setStep('payment')}>
                  Continue to payment <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="animate-fade-up space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard size={18} /> Payment method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)} className="grid gap-3 sm:grid-cols-2">
                    <label className={cn('flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors', paymentMethod === 'MPESA' && 'border-primary bg-primary/5')}>
                      <RadioGroupItem value="MPESA" className="mt-1" />
                      <div>
                        <p className="flex items-center gap-2 font-semibold"><Smartphone size={16} className="text-emerald-600" /> M-Pesa <MpesaBadge className="ml-1" /></p>
                        <p className="mt-1 text-xs text-muted-foreground">Instant STK push — enter PIN on your phone</p>
                      </div>
                    </label>
                    <label className={cn('flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors', paymentMethod === 'COD' && 'border-primary bg-primary/5')}>
                      <RadioGroupItem value="COD" className="mt-1" />
                      <div>
                        <p className="flex items-center gap-2 font-semibold"><Wallet size={16} className="text-primary" /> Cash on Delivery</p>
                        <p className="mt-1 text-xs text-muted-foreground">Pay the rider or at pickup</p>
                      </div>
                    </label>
                  </RadioGroup>

                  {paymentMethod === 'MPESA' && (
                    <div className="space-y-1.5">
                      <Label htmlFor="mpesa-phone">M-Pesa phone number *</Label>
                      <Input
                        id="mpesa-phone"
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                        placeholder="07XX XXX XXX"
                        inputMode="tel"
                        className="max-w-xs"
                      />
                      <p className="text-xs text-muted-foreground">
                        You&apos;ll receive an M-Pesa prompt for {kes(total)} — enter your PIN to pay instantly.
                      </p>
                    </div>
                  )}

                  {/* Loyalty redemption */}
                  {user && maxRedeem > 0 && (
                    <div className={cn('flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4', !usePoints && 'opacity-80')}>
                      <div className="flex items-start gap-3">
                        <Checkbox id="use-points" checked={usePoints} onCheckedChange={(v) => setUsePoints(!!v)} className="mt-0.5" />
                        <label htmlFor="use-points" className="cursor-pointer">
                          <p className="flex items-center gap-1.5 text-sm font-semibold">
                            <Star size={14} className="fill-amber-400 text-amber-400" />
                            Redeem {maxRedeem} loyalty points
                          </p>
                          <p className="text-xs text-muted-foreground">Save {kes(maxRedeem)} — you have {user.loyaltyPoints} points (1pt = KES 1)</p>
                        </label>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <Button variant="outline" className="rounded-full" onClick={() => setStep('details')}>
                  Back to details
                </Button>
                <Button size="lg" className="rounded-full px-8" disabled={placing} onClick={placeOrder}>
                  {placing ? (
                    <><Loader2 size={16} className="animate-spin" /> Placing order…</>
                  ) : (
                    <>
                      <Lock size={15} /> {paymentMethod === 'MPESA' ? 'Pay' : 'Place order'} {kes(total)}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: order summary */}
        <aside aria-label="Order summary">
          <Card className="sticky top-44">
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="max-h-72 space-y-3 overflow-y-auto pr-1 scrollbar-thin">
                {items.map((i) => (
                  <li key={i.productId} className="flex items-center gap-3">
                    <div className="w-10 shrink-0">
                      <ProductImage name={i.name} image={i.image} level={i.level} subject={i.subject} className="shadow-sm" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-xs font-medium leading-tight">{i.name}</p>
                      <p className="text-[11px] text-muted-foreground">×{i.quantity}</p>
                    </div>
                    <span className="text-xs font-bold">{kes(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <Separator />
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{kes(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1 text-muted-foreground"><Truck size={13} /> Delivery</span>
                  <span className="font-medium">
                    {deliveryMethod === 'PICKUP' ? 'Pickup — free' : freeDelivery ? 'FREE 🎉' : kes(deliveryFee)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-amber-600 dark:text-amber-400">
                    <span className="flex items-center gap-1"><Star size={13} className="fill-current" /> Points redeemed</span>
                    <span className="font-medium">−{kes(discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-base font-black">
                  <span>Total</span>
                  <span className="text-primary">{kes(total)}</span>
                </div>
                {paymentMethod === 'MPESA' && !usePoints && total >= 100 && (
                  <p className="pt-1 text-[11px] text-muted-foreground">
                    You&apos;ll earn <strong className="text-amber-600">{Math.floor(total / 100)} loyalty points</strong> on this order
                  </p>
                )}
              </div>
              <div className="flex items-center justify-center gap-3 rounded-lg bg-muted/50 p-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><BadgeCheck size={13} className="text-primary" /> Genuine stock</span>
                <span className="flex items-center gap-1"><Lock size={13} className="text-primary" /> Secure checkout</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  )
}
