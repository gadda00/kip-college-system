'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BookOpenText,
  CalendarRange,
  Download,
  FileQuestion,
  FileSignature,
  FolderOpen,
  MessageSquareText,
  Receipt,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHero } from '@/components/kip/components/page-hero'
import { SectionHeading } from '@/components/kip/components/section-heading'
import { EmptyState } from '@/components/kip/components/empty-state'
import { ErrorPanel } from '@/components/kip/components/loading'
import { api } from '@/components/kip/lib/api'
import type { DownloadResource } from '@/components/kip/lib/types'
import { navigate } from '@/components/kip/lib/router'

const DOWNLOAD_CATEGORIES = ['Forms', 'Fees', 'Academic', 'Guides'] as const

const CATEGORY_META: Record<string, { icon: LucideIcon; blurb: string }> = {
  Forms: {
    icon: FileSignature,
    blurb: 'Application and registration forms you can complete and return to any campus.',
  },
  Fees: {
    icon: Receipt,
    blurb: 'Official fee structures and payment information for all programmes.',
  },
  Academic: {
    icon: CalendarRange,
    blurb: 'Calendars, logbooks and academic documents for enrolled students.',
  },
  Guides: {
    icon: BookOpenText,
    blurb: 'Prospectuses and step-by-step guides for applicants and candidates.',
  },
}

export function DownloadsView() {
  const [category, setCategory] = useState<string>('all')

  const downloads = useQuery({
    queryKey: ['public-downloads'],
    queryFn: () => api<DownloadResource[]>('/api/public/downloads'),
  })

  const categories = useMemo(() => {
    const present = new Set((downloads.data ?? []).map((d) => d.category))
    return DOWNLOAD_CATEGORIES.filter((c) => present.has(c))
  }, [downloads.data])

  const visible = useMemo(() => {
    const items = downloads.data ?? []
    return category === 'all' ? items : items.filter((d) => d.category === category)
  }, [downloads.data, category])

  const handleDownload = (item: DownloadResource) => {
    if (!item.fileUrl || item.fileUrl === '#') {
      toast.info('Coming soon', {
        description: 'This document will be published by the college office shortly.',
      })
      return
    }
    window.open(item.fileUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div>
      <PageHero
        eyebrow="Resources"
        title="Downloads & Resources"
        subtitle="Platform documents, guides and official college publications — free to download in one place."
        breadcrumb={[{ label: 'Downloads' }]}
      />

      <section
        className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
        aria-labelledby="downloads-list-title"
      >
        <SectionHeading
          eyebrow="Document library"
          title="Official Documents"
          description="Download, share and review. Additional college publications are added here as they are verified and released."
        />
        <h2 id="downloads-list-title" className="sr-only">
          Downloadable resources
        </h2>

        {/* category tabs */}
        <div className="mb-8 flex justify-center">
          <Tabs value={category} onValueChange={setCategory}>
            <TabsList aria-label="Filter downloads by category">
              <TabsTrigger value="all" className="min-h-9 px-3 text-xs sm:text-sm">
                All
              </TabsTrigger>
              {categories.map((c) => (
                <TabsTrigger key={c} value={c} className="min-h-9 px-3 text-xs sm:text-sm">
                  {c}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* resource cards */}
        <div aria-live="polite">
          {downloads.isPending ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-xl" />
              ))}
            </div>
          ) : downloads.isError ? (
            <ErrorPanel error={downloads.error} onRetry={() => downloads.refetch()} />
          ) : visible.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="No documents here yet"
              hint="Check the other categories, or request the document you need via the contact page."
              action={
                <Button variant="outline" className="min-h-11" onClick={() => navigate('/contact')}>
                  Request a document
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((item) => (
                <DownloadCard key={item.id} item={item} onDownload={handleDownload} />
              ))}
            </div>
          )}
        </div>

        {/* request-a-document CTA */}
        <div className="mt-10">
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-sky-100/60 dark:to-sky-950/30">
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:p-10">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileQuestion className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-lg font-semibold">Can't find what you need?</h3>
                <p className="mx-auto mt-1.5 max-w-xl text-sm text-muted-foreground">
                  Request a document — transcripts, recommendation letters, attachment letters,
                  hostel rates or any college paperwork — and our registry office will prepare it
                  for you.
                </p>
              </div>
              <Button onClick={() => navigate('/contact')} className="min-h-11">
                <MessageSquareText className="mr-2 h-4 w-4" aria-hidden="true" />
                Request a document
              </Button>
            </CardContent>
          </Card>
        </div>

      </section>
    </div>
  )
}

function DownloadCard({
  item,
  onDownload,
}: {
  item: DownloadResource
  onDownload: (item: DownloadResource) => void
}) {
  const meta = CATEGORY_META[item.category] ?? CATEGORY_META.Forms!
  const Icon = meta.icon

  return (
    <Card className="group flex h-full flex-col border-border/80 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <CardContent className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </span>
          <Badge variant="secondary" className="shrink-0">
            {item.category}
          </Badge>
        </div>

        <h3 className="mt-4 text-base font-semibold leading-snug">{item.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4">
          <span className="text-xs font-medium text-muted-foreground" aria-label="File details">
            {item.fileLabel}
          </span>
          <Button
            size="sm"
            onClick={() => onDownload(item)}
            aria-label={`Download ${item.title} (${item.fileLabel})`}
            className="h-11 font-semibold"
          >
            <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
