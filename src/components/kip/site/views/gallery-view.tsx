'use client'

import { useCallback, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ImageOff, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorPanel } from '@/components/kip/components/loading'
import { EmptyState } from '@/components/kip/components/empty-state'
import { PageHero } from '@/components/kip/components/page-hero'
import { api } from '@/components/kip/lib/api'
import type { GalleryItem } from '@/components/kip/lib/types'

export function GalleryView() {
  const gallery = useQuery({
    queryKey: ['public-gallery'],
    queryFn: () => api<GalleryItem[]>('/api/public/gallery'),
  })

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const items = gallery.data ?? []
  const current = lightboxIndex != null ? items[lightboxIndex] : undefined

  const close = useCallback(() => setLightboxIndex(null), [])
  const showPrev = useCallback(() => {
    setLightboxIndex((i) => (i == null || items.length === 0 ? i : (i - 1 + items.length) % items.length))
  }, [items.length])
  const showNext = useCallback(() => {
    setLightboxIndex((i) => (i == null || items.length === 0 ? i : (i + 1) % items.length))
  }, [items.length])

  // keyboard navigation in lightbox
  useEffect(() => {
    if (lightboxIndex == null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') showPrev()
      if (e.key === 'ArrowRight') showNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, showPrev, showNext])

  return (
    <div>
      <PageHero
        eyebrow="Life at KIP"
        title="Photo Gallery"
        subtitle="A glimpse into our campuses, labs, workshops, studios and celebrations."
        breadcrumb={[{ label: 'Gallery' }]}
      />

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-label="Photo gallery">
        {gallery.isPending ? (
          <div className="columns-1 gap-4 sm:columns-2 md:columns-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="mb-4 h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : gallery.isError ? (
          <ErrorPanel error={gallery.error} onRetry={() => gallery.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState icon={ImageOff} title="No photos yet" hint="Gallery photos will appear here soon." />
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 md:columns-3">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLightboxIndex(i)}
                aria-label={`Open photo: ${item.title}`}
                className="group relative mb-4 block w-full overflow-hidden rounded-xl shadow-sm ring-1 ring-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-gold-400/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <span className="relative block">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={1200}
                    height={686}
                    sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </span>
                <span className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-brand-950/80 via-brand-950/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="text-sm font-semibold text-[#f2efe6]">{item.title}</span>
                  {item.caption && (
                    <span className="mt-0.5 line-clamp-2 text-xs text-[#f2efe6]/75">
                      {item.caption}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* lightbox */}
      <Dialog open={lightboxIndex != null} onOpenChange={(open) => !open && close()}>
        <DialogContent
          className="kip-pattern max-w-4xl overflow-hidden border-none bg-brand-950/95 p-0 sm:rounded-2xl [&>button]:z-10"
          aria-describedby={undefined}
        >
          {current && (
            <figure className="flex flex-col">
              <DialogTitle className="sr-only">{current.title}</DialogTitle>
              <div className="relative flex min-h-0 items-center justify-center">
                <Image
                  src={current.image}
                  alt={current.title}
                  width={1200}
                  height={686}
                  sizes="90vw"
                  className="max-h-[70vh] w-full object-contain"
                />
                {items.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Previous photo"
                      onClick={showPrev}
                      className="absolute left-3 h-11 w-11 rounded-full border border-white/15 bg-white/10 text-[#f2efe6] backdrop-blur-sm hover:bg-gold-400 hover:text-[#0e2233]"
                    >
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Next photo"
                      onClick={showNext}
                      className="absolute right-3 h-11 w-11 rounded-full border border-white/15 bg-white/10 text-[#f2efe6] backdrop-blur-sm hover:bg-gold-400 hover:text-[#0e2233]"
                    >
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </Button>
                  </>
                )}
              </div>
              <figcaption className="flex flex-col items-center gap-1 px-6 py-4 text-center">
                <p className="text-sm font-semibold text-[#f2efe6]">{current.title}</p>
                {current.caption && (
                  <p className="text-xs text-[#f2efe6]/70">{current.caption}</p>
                )}
                {items.length > 1 && (
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-[#f2efe6]/50">
                    {(lightboxIndex ?? 0) + 1} / {items.length} &middot; use arrow keys to navigate
                  </p>
                )}
              </figcaption>
            </figure>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close gallery"
            onClick={close}
            className="absolute right-3 top-3 h-11 w-11 rounded-full border border-white/15 bg-white/10 text-[#f2efe6] backdrop-blur-sm hover:bg-gold-400 hover:text-[#0e2233] md:hidden"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
