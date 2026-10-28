'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardList,
  Download,
  Mail,
  Phone,
  Send,
} from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { PageHero } from '@/components/kip/components/page-hero'
import { api, post } from '@/components/kip/lib/api'
import { categoryMeta, fmtKES } from '@/components/kip/lib/format'
import type { Application, Campus, PublicCourse } from '@/components/kip/lib/types'
import { navigate } from '@/components/kip/lib/router'
import { cn } from '@/lib/utils'

const KCSE_GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E']
const CURRENT_YEAR = new Date().getFullYear()

type FormErrors = Partial<Record<string, string>>

type ApplyForm = {
  fullName: string
  email: string
  phone: string
  courseId: string
  campusId: string
  kcseGrade: string
  kcseYear: string
  gender: string
  guardianName: string
  guardianPhone: string
  message: string
}

const EMPTY_FORM: ApplyForm = {
  fullName: '',
  email: '',
  phone: '',
  courseId: '',
  campusId: '',
  kcseGrade: '',
  kcseYear: '',
  gender: '',
  guardianName: '',
  guardianPhone: '',
  message: '',
}

function validate(form: ApplyForm): FormErrors {
  const errors: FormErrors = {}
  if (form.fullName.trim().length < 3) errors.fullName = 'Enter your full name (min 3 characters).'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = 'Enter a valid email address.'
  if (form.phone.replace(/\D/g, '').length < 10)
    errors.phone = 'Enter a valid phone number (at least 10 digits).'
  if (!form.courseId) errors.courseId = 'Select the course you want to study.'
  if (!form.campusId) errors.campusId = 'Select your preferred campus.'
  if (!form.kcseGrade) errors.kcseGrade = 'Select your KCSE mean grade.'
  const year = Number(form.kcseYear)
  if (!form.kcseYear.trim() || Number.isNaN(year) || year < 1990 || year > CURRENT_YEAR)
    errors.kcseYear = `Enter your KCSE year (1990–${CURRENT_YEAR}).`
  return errors
}

export function ApplyView({ preselectedCourseId = '' }: { preselectedCourseId?: string }) {
  const courses = useQuery({
    queryKey: ['public-courses', 'apply'],
    queryFn: () => api<PublicCourse[]>('/api/public/courses'),
  })
  const campuses = useQuery({
    queryKey: ['public-campuses', 'apply'],
    queryFn: () => api<Campus[]>('/api/public/campuses'),
  })

  // initial state derives from the ?course= prop so EVERY mount (including
  // AnimatePresence re-mounts) starts preselected; the effect below only
  // covers same-view prop changes (#/apply → #/apply?course=x)
  const [form, setForm] = useState<ApplyForm>(() => ({
    ...EMPTY_FORM,
    courseId: preselectedCourseId || '',
  }))
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState<Application | null>(null)

  // preselect course from ?course= (covers same-view prop changes)
  useEffect(() => {
    if (preselectedCourseId) {
      setForm((f) => (f.courseId === preselectedCourseId ? f : { ...f, courseId: preselectedCourseId }))
    }
  }, [preselectedCourseId])

  const set = <K extends keyof ApplyForm>(key: K, value: ApplyForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
    setServerError(null)
  }

  const selectedCourse = useMemo(
    () => (courses.data ?? []).find((c) => c.id === form.courseId),
    [courses.data, form.courseId],
  )
  const selectedCampus = useMemo(
    () => (campuses.data ?? []).find((c) => c.id === form.campusId),
    [campuses.data, form.campusId],
  )

  const coursesByCategory = useMemo(() => {
    const groups = new Map<string, PublicCourse[]>()
    for (const course of courses.data ?? []) {
      const list = groups.get(course.category) ?? []
      list.push(course)
      groups.set(course.category, list)
    }
    return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [courses.data])

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
      const application = await post<Application>('/api/public/apply', {
        applicantName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        courseId: form.courseId,
        campusId: form.campusId,
        kcseGrade: form.kcseGrade,
        kcseYear: Number(form.kcseYear),
        ...(form.gender ? { gender: form.gender } : {}),
        guardianName: form.guardianName.trim() || undefined,
        guardianPhone: form.guardianPhone.trim() || undefined,
        message: form.message.trim() || undefined,
      })
      setSuccess(application)
      toast.success('Application received', {
        description: 'We will send your acceptance letter within 48 hours.',
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not submit your application.'
      setServerError(message)
      toast.error('Application failed', { description: message })
    } finally {
      setSubmitting(false)
    }
  }

  // ── success state ──
  if (success) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="border-primary/20 shadow-md">
            <CardContent className="flex flex-col items-center gap-5 p-8 text-center sm:p-10">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/60"
              >
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" aria-hidden="true" />
              </motion.span>
              <div>
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                  Application received
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Thank you, <strong>{success.applicantName}</strong>. Your application reference is{' '}
                  <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                    {success.reference ?? success.adminNote ?? success.id.slice(-8).toUpperCase()}
                  </span>
                </p>
              </div>
              <div className="w-full rounded-xl border bg-muted/40 p-5 text-left">
                <p className="text-sm font-semibold">What happens next?</p>
                <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
                  {(success.nextSteps ?? [
                    'Our admissions team verifies your details (within 48 hours).',
                    'You receive an acceptance letter, admission number and fee structure by email.',
                    'Pay registration + first-term fees via M-Pesa, bank or cash.',
                    'Report to your campus, register units and begin classes.',
                  ]).map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
                <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                  <Download className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <p className="text-muted-foreground">
                    Prefer paper?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/downloads')}
                      className="font-medium text-primary underline-offset-2 transition-colors hover:underline"
                    >
                      Download the application form from our Downloads page
                    </button>{' '}
                    and deliver it to any campus.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={() => navigate('/academics')} className="min-h-11">
                  Browse courses
                </Button>
                <Button variant="outline" onClick={() => navigate('/')} className="min-h-11">
                  Back home
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // ── form ──
  return (
    <div>
      <PageHero
        eyebrow="Admissions"
        title="Apply Online"
        subtitle="Fill this form to apply for admission — it is free, takes about 10 minutes, and you will hear from us within 48 hours."
        breadcrumb={[{ label: 'Admissions', to: '/admissions' }, { label: 'Apply' }]}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* form column */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardList className="h-5 w-5 text-primary" aria-hidden="true" />
                  Application Form
                </CardTitle>
              </CardHeader>
              <CardContent>
                {serverError && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    <AlertTitle>Could not submit</AlertTitle>
                    <AlertDescription>{serverError}</AlertDescription>
                  </Alert>
                )}

                {courses.isPending || campuses.isPending ? (
                  <div className="space-y-5">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-11 w-full" />
                      </div>
                    ))}
                  </div>
                ) : courses.isError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    <AlertTitle>Courses unavailable</AlertTitle>
                    <AlertDescription>
                      We could not load the course list. {courses.error instanceof Error ? courses.error.message : ''}{' '}
                      <Button variant="outline" size="sm" className="ml-2 h-8" onClick={() => courses.refetch()}>
                        Retry
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-6">
                    {/* personal details */}
                    <fieldset className="space-y-5">
                      <legend className="mb-1 text-sm font-semibold uppercase tracking-wide text-primary">
                        Personal details
                      </legend>
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">
                            Full name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="fullName"
                            autoComplete="name"
                            placeholder="e.g. Jane Ndanu Mutinda"
                            value={form.fullName}
                            onChange={(e) => set('fullName', e.target.value)}
                            aria-invalid={Boolean(errors.fullName)}
                            className="h-11"
                          />
                          {errors.fullName && <FieldError>{errors.fullName}</FieldError>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">
                            Email address <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="email"
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
                          <Label htmlFor="phone">
                            Phone number <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            autoComplete="tel"
                            placeholder="07XX XXX XXX"
                            value={form.phone}
                            onChange={(e) => set('phone', e.target.value)}
                            aria-invalid={Boolean(errors.phone)}
                            className="h-11"
                          />
                          {errors.phone && <FieldError>{errors.phone}</FieldError>}
                        </div>
                        <div className="space-y-2">
                          <Label>Gender</Label>
                          <RadioGroup
                            value={form.gender}
                            onValueChange={(v) => set('gender', v)}
                            className="flex h-11 items-center gap-6"
                          >
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="MALE" id="gender-male" />
                              <Label htmlFor="gender-male" className="cursor-pointer font-normal">
                                Male
                              </Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="FEMALE" id="gender-female" />
                              <Label htmlFor="gender-female" className="cursor-pointer font-normal">
                                Female
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </fieldset>

                    {/* programme */}
                    <fieldset className="space-y-5">
                      <legend className="mb-1 text-sm font-semibold uppercase tracking-wide text-primary">
                        Programme choice
                      </legend>
                      <div className="space-y-2">
                        <Label htmlFor="courseId">
                          Course to study <span className="text-destructive">*</span>
                        </Label>
                        <Select value={form.courseId} onValueChange={(v) => set('courseId', v)}>
                          <SelectTrigger id="courseId" className="h-11 w-full" aria-invalid={Boolean(errors.courseId)}>
                            <SelectValue placeholder="Select a course…" />
                          </SelectTrigger>
                          <SelectContent className="max-h-72">
                            {coursesByCategory.map(([category, list]) => (
                              <SelectGroup key={category}>
                                <SelectLabel className="text-primary">{category}</SelectLabel>
                                {list.map((course) => (
                                  <SelectItem key={course.id} value={course.id} className="py-2.5">
                                    {course.title}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.courseId && <FieldError>{errors.courseId}</FieldError>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="campusId">
                          Preferred campus <span className="text-destructive">*</span>
                        </Label>
                        <Select value={form.campusId} onValueChange={(v) => set('campusId', v)}>
                          <SelectTrigger id="campusId" className="h-11 w-full" aria-invalid={Boolean(errors.campusId)}>
                            <SelectValue placeholder="Select a campus…" />
                          </SelectTrigger>
                          <SelectContent>
                            {(campuses.data ?? []).map((campus) => (
                              <SelectItem key={campus.id} value={campus.id} className="py-2.5">
                                {campus.name} — {campus.location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.campusId && <FieldError>{errors.campusId}</FieldError>}
                      </div>
                    </fieldset>

                    {/* academics */}
                    <fieldset className="space-y-5">
                      <legend className="mb-1 text-sm font-semibold uppercase tracking-wide text-primary">
                        KCSE results
                      </legend>
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="kcseGrade">
                            Mean grade <span className="text-destructive">*</span>
                          </Label>
                          <Select value={form.kcseGrade} onValueChange={(v) => set('kcseGrade', v)}>
                            <SelectTrigger id="kcseGrade" className="h-11 w-full" aria-invalid={Boolean(errors.kcseGrade)}>
                              <SelectValue placeholder="Select grade…" />
                            </SelectTrigger>
                            <SelectContent>
                              {KCSE_GRADES.map((grade) => (
                                <SelectItem key={grade} value={grade} className="py-2.5">
                                  {grade}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.kcseGrade && <FieldError>{errors.kcseGrade}</FieldError>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="kcseYear">
                            KCSE year <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="kcseYear"
                            type="number"
                            inputMode="numeric"
                            min={1990}
                            max={CURRENT_YEAR}
                            placeholder={String(CURRENT_YEAR - 1)}
                            value={form.kcseYear}
                            onChange={(e) => set('kcseYear', e.target.value)}
                            aria-invalid={Boolean(errors.kcseYear)}
                            className="h-11"
                          />
                          {errors.kcseYear && <FieldError>{errors.kcseYear}</FieldError>}
                        </div>
                      </div>
                    </fieldset>

                    {/* guardian + message */}
                    <fieldset className="space-y-5">
                      <legend className="mb-1 text-sm font-semibold uppercase tracking-wide text-primary">
                        Guardian &amp; notes <span className="font-normal normal-case text-muted-foreground">(optional)</span>
                      </legend>
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="guardianName">Parent / guardian name</Label>
                          <Input
                            id="guardianName"
                            autoComplete="off"
                            placeholder="e.g. Peter Mutinda"
                            value={form.guardianName}
                            onChange={(e) => set('guardianName', e.target.value)}
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="guardianPhone">Parent / guardian phone</Label>
                          <Input
                            id="guardianPhone"
                            type="tel"
                            autoComplete="off"
                            placeholder="07XX XXX XXX"
                            value={form.guardianPhone}
                            onChange={(e) => set('guardianPhone', e.target.value)}
                            className="h-11"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Anything we should know?</Label>
                        <Textarea
                          id="message"
                          rows={4}
                          placeholder="e.g. I would like hostel accommodation, or I'm transferring from another college…"
                          value={form.message}
                          onChange={(e) => set('message', e.target.value)}
                        />
                      </div>
                    </fieldset>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={submitting}
                      className="h-12 w-full bg-primary text-base font-semibold shadow-md hover:bg-primary/90"
                    >
                      {submitting ? (
                        <>
                          <span
                            className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground"
                            aria-hidden="true"
                          />
                          Submitting…
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                          Submit application
                        </>
                      )}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      Fields marked <span className="text-destructive">*</span> are required. Your
                      details are used for admission processing only.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* summary column */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start" aria-label="Application summary">
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Your selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {selectedCourse ? (
                  <div>
                    <p className="font-semibold">{selectedCourse.title}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <Badge variant="secondary">{selectedCourse.category}</Badge>
                      <Badge variant="secondary">{selectedCourse.level}</Badge>
                      <Badge variant="outline">{selectedCourse.examBody}</Badge>
                    </div>
                    <div className="mt-4 space-y-2 rounded-lg bg-muted/50 p-3.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Registration</span>
                        <span className="font-semibold">{fmtKES(selectedCourse.registrationFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tuition / term</span>
                        <span className="font-semibold">{fmtKES(selectedCourse.tuitionPerTerm)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Exam fee (approx.)</span>
                        <span className="font-semibold">{fmtKES(selectedCourse.examFee)}</span>
                      </div>
                      <div className="mt-1 flex justify-between border-t pt-2 font-bold text-primary">
                        <span>First-term estimate</span>
                        <span>
                          {fmtKES(
                            selectedCourse.registrationFee +
                              selectedCourse.tuitionPerTerm +
                              selectedCourse.examFee,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed bg-muted/30 p-4 text-muted-foreground">
                    Select a course in the form to see its fee estimate here.
                  </p>
                )}
                {selectedCampus && (
                  <p className="flex items-start gap-2 text-muted-foreground">
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>
                      <strong className="text-foreground">{selectedCampus.name}</strong> —{' '}
                      {selectedCampus.location}
                    </span>
                  </p>
                )}
                <div className="flex items-start gap-2 rounded-lg bg-green-50 p-3 text-xs text-green-800 dark:bg-green-950/40 dark:text-green-300">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    Application is <strong>free</strong> — response within 48 hours. Flexible fee
                    instalments available.
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5">
              <CardContent className="p-5 text-sm">
                <p className="font-semibold">Need help with your application?</p>
                <ul className="mt-3 space-y-2">
                  <li>
                    <a
                      href="tel:+254712345678"
                      className="flex min-h-9 items-center gap-2 font-medium text-primary hover:underline"
                    >
                      <Phone className="h-4 w-4" aria-hidden="true" /> 0703 710 879
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:admissions@kipskitui.com"
                      className="flex min-h-9 items-center gap-2 font-medium text-primary hover:underline"
                    >
                      <Mail className="h-4 w-4" aria-hidden="true" /> admissions@kipskitui.com
                    </a>
                  </li>
                </ul>
                <Button
                  variant="ghost"
                  className="mt-3 h-11 w-full text-primary"
                  onClick={() => navigate('/admissions')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                  Admission requirements
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
  return (
    <p role="alert" className={cn('text-xs font-medium text-destructive')}>
      {children}
    </p>
  )
}
