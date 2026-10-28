'use client'

import { useState } from 'react'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock3,
  CircleHelp,
  Mail,
  MessageSquareText,
  Phone,
  Send,
  Smartphone,
} from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { motion } from 'framer-motion'
import { PageHero } from '@/components/kip/components/page-hero'
import { post } from '@/components/kip/lib/api'
import { navigate } from '@/components/kip/lib/router'
import { cn } from '@/lib/utils'

const SUBJECTS = ['Admissions', 'Fees', 'Courses', 'Attachment', 'Other'] as const

type ContactForm = {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

const EMPTY: ContactForm = { name: '', email: '', phone: '', subject: '', message: '' }

type FormErrors = Partial<Record<keyof ContactForm, string>>

function validate(form: ContactForm): FormErrors {
  const errors: FormErrors = {}
  if (form.name.trim().length < 2) errors.name = 'Enter your name (min 2 characters).'
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = 'Enter a valid email address.'
  if (!form.subject) errors.subject = 'Select a subject.'
  if (form.message.trim().length < 5) errors.message = 'Your message must be at least 5 characters.'
  return errors
}

/** Gold icon chip used across the contact info cards. */
function InfoChip({ icon: Icon, label }: { icon: typeof Phone; label: string }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-400/15 text-gold-700 dark:text-gold-300">
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  )
}

export function ContactView() {
  const [form, setForm] = useState<ContactForm>(EMPTY)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const set = <K extends keyof ContactForm>(key: K, value: ContactForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
    setServerError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validation = validate(form)
    setErrors(validation)
    if (Object.keys(validation).length > 0) {
      toast.error('Please fix the highlighted fields')
      return
    }
    setSubmitting(true)
    setServerError(null)
    try {
      await post('/api/public/contact', {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        subject: form.subject,
        message: form.message.trim(),
      })
      setSent(true)
      toast.success('Message sent', {
        description: 'We will get back to you within one working day.',
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not send your message.'
      setServerError(message)
      toast.error('Message failed', { description: message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHero
        eyebrow="Get in touch"
        title="Contact Us"
        subtitle="Questions about admissions, fees, courses or attachment? Send us a message — we reply within one working day."
        breadcrumb={[{ label: 'Contact' }]}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* form */}
          <div className="lg:col-span-2">
            <Card className="rule-top-gold relative overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2.5 text-lg">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-400/15 text-gold-700 dark:text-gold-300">
                    <MessageSquareText className="h-5 w-5" aria-hidden="true" />
                  </span>
                  Send us a message
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4 py-10 text-center"
                  >
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/60">
                      <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-lg font-semibold">Message sent</h2>
                      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                        Thank you, {form.name.split(' ')[0]}. Our team will respond within one
                        working day.
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                      <Button
                        variant="outline"
                        className="min-h-11 hover:border-brand-700 hover:bg-brand-700 hover:text-[#f2efe6]"
                        onClick={() => {
                          setForm(EMPTY)
                          setSent(false)
                        }}
                      >
                        Send another message
                      </Button>
                      <Button className="min-h-11" onClick={() => navigate('/academics')}>
                        Browse courses
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {serverError && (
                      <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" aria-hidden="true" />
                        <AlertTitle>Could not send</AlertTitle>
                        <AlertDescription>{serverError}</AlertDescription>
                      </Alert>
                    )}
                    <form onSubmit={handleSubmit} noValidate className="space-y-5">
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="contact-name">
                            Your name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="contact-name"
                            autoComplete="name"
                            placeholder="e.g. John Doe"
                            value={form.name}
                            onChange={(e) => set('name', e.target.value)}
                            aria-invalid={Boolean(errors.name)}
                            className="h-11"
                          />
                          {errors.name && <FieldError>{errors.name}</FieldError>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-subject">
                            Subject <span className="text-destructive">*</span>
                          </Label>
                          <Select value={form.subject} onValueChange={(v) => set('subject', v)}>
                            <SelectTrigger
                              id="contact-subject"
                              className="h-11 w-full"
                              aria-invalid={Boolean(errors.subject)}
                            >
                              <SelectValue placeholder="Choose a subject…" />
                            </SelectTrigger>
                            <SelectContent>
                              {SUBJECTS.map((subject) => (
                                <SelectItem key={subject} value={subject} className="py-2.5">
                                  {subject}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.subject && <FieldError>{errors.subject}</FieldError>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-email">Email</Label>
                          <Input
                            id="contact-email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) => set('email', e.target.value)}
                            aria-invalid={Boolean(errors.email)}
                            className="h-11"
                          />
                          {errors.email && <FieldError>{errors.email}</FieldError>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-phone">Phone</Label>
                          <Input
                            id="contact-phone"
                            type="tel"
                            autoComplete="tel"
                            placeholder="07XX XXX XXX"
                            value={form.phone}
                            onChange={(e) => set('phone', e.target.value)}
                            className="h-11"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-message">
                          Message <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="contact-message"
                          rows={6}
                          placeholder="How can we help you?"
                          value={form.message}
                          onChange={(e) => set('message', e.target.value)}
                          aria-invalid={Boolean(errors.message)}
                        />
                        {errors.message && <FieldError>{errors.message}</FieldError>}
                      </div>
                      <Button
                        type="submit"
                        size="lg"
                        disabled={submitting}
                        className="h-12 w-full shadow-md sm:w-auto sm:px-10"
                      >
                        {submitting ? (
                          <>
                            <span
                              className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground"
                              aria-hidden="true"
                            />
                            Sending…
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                            Send message
                          </>
                        )}
                      </Button>
                    </form>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* info cards */}
          <aside className="space-y-5" aria-label="Contact information">
            <Card>
              <CardContent className="space-y-4 p-5 text-sm">
                <h2 className="flex items-center gap-2.5 font-semibold">
                  <InfoChip icon={Phone} label="Phone lines" />
                  Phone lines
                </h2>
                <ul className="space-y-1.5 text-muted-foreground">
                  {['0703 710 879', '+254 703 710 879', '0711 224 507'].map((phone) => (
                    <li key={phone}>
                      <a
                        href={`tel:${phone.replace(/\s/g, '')}`}
                        className="flex min-h-9 items-center font-medium text-foreground transition-colors hover:text-primary"
                      >
                        {phone}
                      </a>
                    </li>
                  ))}
                  <li className="flex min-h-9 items-center gap-2 text-muted-foreground">
                    <Smartphone
                      className="h-4 w-4 text-gold-600 dark:text-gold-400"
                      aria-hidden="true"
                    />
                    WhatsApp: 0703 710 879
                  </li>
                </ul>
                <h2 className="flex items-center gap-2.5 pt-2 font-semibold">
                  <InfoChip icon={Mail} label="Email" />
                  Email
                </h2>
                <a
                  href="mailto:info@kipskitui.com"
                  className="block font-medium text-primary hover:underline"
                >
                  info@kipskitui.com
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3 p-5 text-sm">
                <h2 className="flex items-center gap-2.5 font-semibold">
                  <InfoChip icon={Building2} label="Campuses" />
                  Campuses
                </h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li>
                    <p className="font-medium text-foreground">Main Campus</p>
                    <p className="text-xs">Wikililye, Mulango Road, Kitui</p>
                  </li>
                  <li>
                    <p className="font-medium text-foreground">Town Campus</p>
                    <p className="text-xs">Muli Mall Building, Kitui CBD</p>
                  </li>
                  <li>
                    <p className="font-medium text-foreground">Mwingi Campus</p>
                    <p className="text-xs">Sunrise Building, Mwingi Town</p>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-brand-500/15 bg-brand-50 dark:bg-brand-100/10">
              <CardContent className="space-y-3 p-5 text-sm">
                <h2 className="flex items-center gap-2.5 font-semibold">
                  <InfoChip icon={Clock3} label="Office hours" />
                  Office hours
                </h2>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li className="flex justify-between gap-4">
                    <span>Monday – Friday</span>
                    <span className="font-medium text-foreground">8:00 – 17:00</span>
                  </li>
                  <li className="flex justify-between gap-4">
                    <span>Saturday</span>
                    <span className="font-medium text-foreground">9:00 – 13:00</span>
                  </li>
                  <li className="flex justify-between gap-4">
                    <span>Sundays &amp; holidays</span>
                    <span className="font-medium text-foreground">Closed</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-gold-500/30 bg-gold-400/10 transition-shadow hover:shadow-md dark:bg-gold-400/5">
              <CardContent className="flex flex-col gap-3 p-5 text-sm">
                <h2 className="flex items-center gap-2.5 font-semibold">
                  <InfoChip icon={CircleHelp} label="Quick answers" />
                  Quick answers
                </h2>
                <p className="text-muted-foreground">
                  Check our FAQs — instant answers on intakes, entry requirements, fees,
                  instalments and exam registration.
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/faq')}
                  className="min-h-11 w-full font-medium hover:border-brand-700 hover:bg-brand-700 hover:text-[#f2efe6]"
                >
                  Visit the FAQ page
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p role="alert" className={cn('text-xs font-medium text-destructive')}>{children}</p>
}
