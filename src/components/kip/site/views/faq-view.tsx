'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BookOpenCheck,
  CircleHelp,
  Mail,
  MessageCircleQuestion,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { PageHero } from '@/components/kip/components/page-hero'
import { SectionHeading } from '@/components/kip/components/section-heading'
import { EmptyState } from '@/components/kip/components/empty-state'
import { ErrorPanel } from '@/components/kip/components/loading'
import { api } from '@/components/kip/lib/api'
import type { FAQ } from '@/components/kip/lib/types'
import { navigate } from '@/components/kip/lib/router'
import { cn } from '@/lib/utils'

const FAQ_CATEGORIES = ['Admissions', 'Fees', 'Courses', 'Exams', 'General'] as const

const CATEGORY_STYLES: Record<string, string> = {
  Admissions: 'bg-brand-50 text-brand-700 dark:bg-brand-100 dark:text-gold-300',
  Fees: 'bg-gold-400/15 text-gold-700 dark:text-gold-300',
  Courses: 'bg-brand-50 text-brand-700 dark:bg-brand-100 dark:text-gold-300',
  Exams: 'bg-gold-400/15 text-gold-700 dark:text-gold-300',
  General: 'bg-muted text-muted-foreground',
}

export function FaqView() {
  const [category, setCategory] = useState<string>('')
  const [search, setSearch] = useState('')

  const faqs = useQuery({
    queryKey: ['public-faqs'],
    queryFn: () => api<FAQ[]>('/api/public/faqs'),
  })

  const categories = useMemo(() => {
    const present = new Set((faqs.data ?? []).map((f) => f.category))
    return FAQ_CATEGORIES.filter((c) => present.has(c))
  }, [faqs.data])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (faqs.data ?? []).filter((f) => {
      const matchesCategory = !category || f.category === category
      const matchesSearch =
        !q ||
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [faqs.data, category, search])

  return (
    <div>
      <PageHero
        eyebrow="Help centre"
        title="Frequently Asked Questions"
        subtitle="Straight answers about admissions, fees, courses, examinations and college life at KIP College. Can't find what you need? Ask our AI assistant or contact us directly."
        breadcrumb={[{ label: 'FAQs' }]}
      />

      <section
        className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8"
        aria-labelledby="faq-list-title"
      >
        <SectionHeading
          eyebrow="Quick answers"
          title="How can we help?"
          description="Browse the categories below or search for a keyword — the answers cover the questions our admissions team hears most."
        />
        <h2 id="faq-list-title" className="sr-only">
          FAQ list
        </h2>

        {/* search + category filter pills */}
        <div className="mb-8 space-y-4">
          <div className="relative w-full">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <label htmlFor="faq-search" className="sr-only">
              Search frequently asked questions
            </label>
            <Input
              id="faq-search"
              type="search"
              placeholder="Search FAQs — fees, intakes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 pl-10"
            />
          </div>

          <div
            role="group"
            aria-label="Filter questions by category"
            className="flex flex-wrap gap-2"
          >
            <FilterPill
              active={category === ''}
              onClick={() => setCategory('')}
              label="All"
              count={faqs.data?.length}
            />
            {categories.map((c) => (
              <FilterPill
                key={c}
                active={category === c}
                onClick={() => setCategory(category === c ? '' : c)}
                label={c}
                count={faqs.data?.filter((f) => f.category === c).length}
              />
            ))}
          </div>
        </div>

        {/* accordion list */}
        <div aria-live="polite">
          {faqs.isPending ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : faqs.isError ? (
            <ErrorPanel error={faqs.error} onRetry={() => faqs.refetch()} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={CircleHelp}
              title="No matching questions"
              hint={
                search
                  ? 'Try a different keyword, or clear the filters to see all questions.'
                  : 'No questions in this category yet — contact us and we will answer directly.'
              }
              action={
                <Button
                  variant="outline"
                  className="min-h-11 hover:border-brand-700 hover:bg-brand-700 hover:text-[#f2efe6]"
                  onClick={() => {
                    setSearch('')
                    setCategory('')
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <Card className="overflow-hidden border-brand-500/15 shadow-sm">
              <CardContent className="p-2 sm:p-4">
                <Accordion
                  type="single"
                  collapsible
                  className="w-full"
                  aria-label="Frequently asked questions"
                >
                  {filtered.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id} className="border-b last:border-b-0">
                      <AccordionTrigger className="min-h-11 px-3 py-4 text-sm font-semibold hover:no-underline sm:text-base [&>svg]:hidden [&[data-state=open]_.faq-plus]:rotate-45">
                        <span className="flex items-start gap-3">
                          <span className="faq-plus mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold-500/40 bg-gold-400/10 text-gold-600 transition-transform duration-200 dark:text-gold-400">
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                          <span className="text-left">{faq.question}</span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 pb-5 pl-12">
                        <Badge
                          variant="secondary"
                          className={cn('mb-2.5', CATEGORY_STYLES[faq.category] ?? 'bg-muted')}
                        >
                          {faq.category}
                        </Badge>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {faq.answer}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}
        </div>

        {/* "Still have questions?" CTA band */}
        <div className="mt-10 space-y-4">
          <div className="bg-brand-band kip-pattern kip-grain relative overflow-hidden rounded-2xl text-[#f2efe6]">
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-gold-400/10 blur-3xl"
            />
            <div className="relative flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-400/15 text-gold-300 ring-1 ring-gold-400/30">
                  <Mail className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-[#f2efe6]">
                    Still have questions?
                  </h3>
                  <p className="mt-1 max-w-md text-sm leading-relaxed text-[#f2efe6]/70">
                    Our admissions team replies within one working day — call{' '}
                    <a
                      href="tel:+254703710879"
                      className="font-medium text-gold-300 underline-offset-2 hover:underline"
                    >
                      0703 710 879
                    </a>{' '}
                    or send us a message.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/contact')}
                className="btn-gold min-h-11 shrink-0 font-semibold"
              >
                Contact us
                <MessageCircleQuestion className="ml-1.5 h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <Card className="border-gold-500/30 bg-gold-400/10 transition-shadow hover:shadow-md dark:bg-gold-400/5">
            <CardContent className="flex flex-col items-start gap-3 p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/15 text-gold-700 dark:text-gold-300">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-semibold">Ask the KIP AI Assistant</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get instant answers about courses, fees and admissions — tap the chat bubble at
                  the bottom-right corner of any page, 24/7.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/academics')}
                className="min-h-11 hover:border-brand-700 hover:bg-brand-700 hover:text-[#f2efe6]"
              >
                <BookOpenCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                Browse courses
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        active
          ? 'border-brand-700 bg-brand-700 text-[#f2efe6] shadow-sm'
          : 'border-border bg-card text-muted-foreground hover:border-gold-500/50 hover:text-foreground',
      )}
    >
      {label}
      {count != null && (
        <span
          className={cn(
            'rounded-full px-1.5 text-xs font-semibold',
            active ? 'bg-white/20 text-[#f2efe6]' : 'bg-muted text-muted-foreground',
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}
