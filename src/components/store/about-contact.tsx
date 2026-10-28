'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Award, BookOpen, Building2, Clock, Heart, Leaf, MapPin, Phone, Target, Users, Printer, Star, Truck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUIStore } from '@/stores/ui-store'

const TEAM_IMG = 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/6684d0049d37.jpg'

export function AboutView() {
  const navigate = useUIStore((s) => s.navigate)

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      {/* Hero */}
      <section className="mb-12 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <BookOpen size={32} />
        </div>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">About KIPS Kitui</h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
          For over a decade, we&apos;ve been Eastern Kenya&apos;s trusted partner in education — stocking
          every KICD-approved textbook and equipping thousands of learners, teachers and schools.
        </p>
      </section>

      {/* Story */}
      <section className="mb-12 grid items-center gap-8 lg:grid-cols-2">
        <div className="relative">
          <div className="absolute -inset-3 rounded-2xl bg-primary/10 blur-xl" aria-hidden />
          <img src={TEAM_IMG} alt="Kenyan students learning in a classroom" className="relative aspect-[4/3] w-full rounded-2xl object-cover shadow-xl" />
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-black">Our story</h2>
          <p className="leading-relaxed text-muted-foreground">
            KIPS Kitui opened its doors in 2012 as part of the famous KIPS Kenya family — the
            country&apos;s most trusted name in exam revision materials. What began as a single shelf of
            KCPE past papers has grown into a full education superstore in the heart of Kitui town.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Today we serve over 120 schools and thousands of families across Kitui County — from CBC
            PP1 workbooks to university engineering texts, from a single biro pen to a full
            Form-4 bulk supply with binding and printing included.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { icon: BookOpen, value: '2,000+', label: 'Curriculum titles' },
              { icon: Users, value: '120+', label: 'Partner schools' },
              { icon: Award, value: '13 yrs', label: 'Serving Kitui' },
              { icon: Star, value: '4.8/5', label: 'Customer rating' },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="flex items-center gap-3 p-4">
                  <s.icon size={22} className="text-primary" />
                  <div>
                    <p className="text-lg font-black leading-none">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission / values */}
      <section className="mb-12">
        <h2 className="mb-6 text-center text-2xl font-black">What drives us</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Target,
              title: 'Our mission',
              desc: 'To ensure every learner in Kitui County — from PP1 to university — has access to genuine, affordable learning materials without travelling to Nairobi.',
            },
            {
              icon: Heart,
              title: 'Our promise',
              desc: 'KICD-approved stock only, honest prices, and service that treats every parent, teacher and student like family.',
            },
            {
              icon: Leaf,
              title: 'Our community',
              desc: 'We sponsor school prize-giving days, donate revision materials to needy students, and buy from local suppliers wherever possible.',
            },
          ].map((v) => (
            <Card key={v.title} className="text-center">
              <CardContent className="space-y-3 p-6">
                <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <v.icon size={23} />
                </div>
                <h3 className="text-lg font-bold">{v.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Visit */}
      <section className="mb-12 rounded-2xl border bg-muted/30 p-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black">
              <MapPin size={20} className="text-primary" /> Visit our shop
            </h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2.5"><Building2 size={16} className="mt-0.5 shrink-0 text-primary" /> KIPS Building, Kitui Town CBD — opposite the main matatu stage</li>
              <li className="flex gap-2.5"><Phone size={16} className="mt-0.5 shrink-0 text-primary" /> +254 700 111 222 / +254 733 111 222</li>
              <li className="flex gap-2.5"><Clock size={16} className="mt-0.5 shrink-0 text-primary" /> Mon–Sat: 7:30am – 6:30pm • Sun: 2pm – 5pm</li>
              <li className="flex gap-2.5"><Truck size={16} className="mt-0.5 shrink-0 text-primary" /> Same-day delivery within Kitui Town; county-wide in 1–2 days</li>
              <li className="flex gap-2.5"><Printer size={16} className="mt-0.5 shrink-0 text-primary" /> Full printing bureau with binding & laminating</li>
            </ul>
          </div>
          <div className="overflow-hidden rounded-xl border shadow-inner">
            <iframe
              title="Map of Kitui Town"
              src="https://www.openstreetmap.org/export/embed.html?bbox=38.010%2C-1.390%2C38.045%2C-1.360&layer=mapnik&marker=-1.375%2C38.028"
              className="h-full min-h-64 w-full"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <div className="text-center">
        <Button size="lg" className="rounded-full px-8" onClick={() => navigate('shop')}>
          Explore our catalogue
        </Button>
      </div>
    </main>
  )
}

export function ContactView() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.subject || !form.message) return
    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSent(true)
        setForm({ name: '', email: '', phone: '', subject: '', message: '' })
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black tracking-tight">Contact Us</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Questions about books, bulk pricing, printing or delivery? We reply within a few hours during business time.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Form */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Send us a message</CardTitle></CardHeader>
          <CardContent>
            {sent ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                  <Leaf size={30} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Message sent! 🎉</h3>
                  <p className="mt-1 text-sm text-muted-foreground">We&apos;ll get back to you shortly. Asante!</p>
                </div>
                <Button variant="outline" onClick={() => setSent(false)}>Send another message</Button>
              </div>
            ) : (
              <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="c-name" className="text-sm font-medium">Name *</label>
                  <input
                    id="c-name"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="c-phone" className="text-sm font-medium">Phone</label>
                  <input
                    id="c-phone"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="07XX XXX XXX"
                    inputMode="tel"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="c-email" className="text-sm font-medium">Email</label>
                  <input
                    id="c-email"
                    type="email"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="c-subject" className="text-sm font-medium">Subject *</label>
                  <input
                    id="c-subject"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g. Wholesale prices for my kiosk"
                    required
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="c-message" className="text-sm font-medium">Message *</label>
                  <textarea
                    id="c-message"
                    className="flex min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="How can we help?"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 sm:col-span-2 sm:justify-self-end"
                >
                  {sending ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Info cards */}
        <aside className="space-y-4">
          {[
            { icon: Phone, title: 'Call / WhatsApp', lines: ['+254 700 111 222', '+254 733 111 222'], hint: 'Mon–Sat 7:30am–6:30pm' },
            { icon: MapPin, title: 'Visit the shop', lines: ['KIPS Building, Kitui Town CBD', 'Opposite the main matatu stage'] },
            { icon: Building2, title: 'Postal', lines: ['P.O. Box 456-90200', 'Kitui, Kenya'] },
          ].map((c) => (
            <Card key={c.title}>
              <CardContent className="flex gap-3.5 p-5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <c.icon size={19} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">{c.title}</h3>
                  {c.lines.map((l) => <p key={l} className="text-sm text-muted-foreground">{l}</p>)}
                  {c.hint && <p className="mt-1 text-xs text-muted-foreground">{c.hint}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </aside>
      </div>
    </main>
  )
}
