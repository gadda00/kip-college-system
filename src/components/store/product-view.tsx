'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BadgeCheck, ChevronRight, Heart, Minus, Package, Plus, Share2, ShoppingCart, Star, Truck, Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ProductImage } from '@/components/shared/book-cover'
import { Stars, kes, EmptyState } from '@/components/shared/ui-bits'
import { ProductCard, type Product } from '@/components/store/product-card'
import { useCartStore } from '@/stores/cart-store'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { FREE_DELIVERY_THRESHOLD } from '@/lib/pricing'
import { cn } from '@/lib/utils'

type Review = { id: string; rating: number; comment: string | null; createdAt: string; user: { name: string } }

export function ProductView({ slug }: { slug: string }) {
  const navigate = useUIStore((s) => s.navigate)
  const setCartOpen = useUIStore((s) => s.setCartOpen)
  const setAuthOpen = useUIStore((s) => s.setAuthOpen)
  const addItem = useCartStore((s) => s.addItem)
  const addViewed = useCartStore((s) => s.addViewed)
  const recentlyViewed = useCartStore((s) => s.recentlyViewed)
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const [quantity, setQuantity] = useState(1)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [myRating, setMyRating] = useState(5)
  const [myComment, setMyComment] = useState('')

  const { data, isLoading } = useQuery<{ product: any; related: Product[] }>({
    queryKey: ['product', slug],
    queryFn: async () => (await fetch(`/api/products/${slug}`)).json(),
  })

  const product = data?.product

  useEffect(() => {
    if (product?.id) addViewed(product.id)
  }, [product?.id])

  // AI recommendations based on this product
  const { data: recData } = useQuery<{ products: Product[]; reason: string }>({
    queryKey: ['recommendations', product?.id],
    queryFn: async () => (await fetch(`/api/recommendations?ids=${product?.id}&limit=4`)).json(),
    enabled: !!product?.id,
  })

  const submitReview = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, rating: myRating, comment: myComment }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json
    },
    onSuccess: () => {
      toast.success('Thank you for your review! ⭐')
      setReviewOpen(false)
      setMyComment('')
      qc.invalidateQueries({ queryKey: ['product', slug] })
    },
    onError: (e: any) => toast.error(e.message || 'Could not save review'),
  })

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-[3/4] max-w-md animate-pulse rounded-xl bg-muted" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-24 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState
          title="Product not found"
          description="This item may have been removed or is out of stock."
          action={<Button onClick={() => navigate('shop')}>Back to shop</Button>}
        />
      </main>
    )
  }

  const reviews: Review[] = product.reviews ?? []
  const outOfStock = product.stock <= 0
  const discountToFree = Math.max(0, FREE_DELIVERY_THRESHOLD - product.price * quantity)

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <button className="hover:text-primary" onClick={() => navigate('home')}>Home</button>
        <ChevronRight size={14} />
        <button className="hover:text-primary" onClick={() => navigate('shop', { category: product.category?.slug })}>
          {product.category?.name}
        </button>
        <ChevronRight size={14} />
        <span className="line-clamp-1 font-medium text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image */}
        <div className="mx-auto w-full max-w-md space-y-4 lg:mx-0">
          <ProductImage
            name={product.name}
            image={product.image}
            level={product.level}
            subject={product.subject}
            brand={product.brand}
            className="shadow-lg"
          />
          <div className="flex items-center justify-center gap-4 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><BadgeCheck size={14} className="text-primary" /> Genuine / KICD-approved</span>
            <span className="flex items-center gap-1.5"><Package size={14} className="text-primary" /> SKU: {product.sku}</span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-5">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">{product.category?.name}</Badge>
              {product.level && <Badge variant="secondary">{product.level}</Badge>}
              {product.subject && <Badge variant="secondary">{product.subject}</Badge>}
              {product.isFeatured && (
                <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600">
                  <Star size={11} className="mr-1 fill-amber-500 text-amber-500" /> Bestseller
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl">{product.name}</h1>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Stars rating={product.rating} />
              <span className="font-semibold">{product.rating || '—'}</span>
              <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
              <span className="text-muted-foreground">• {product.sold}+ sold</span>
            </div>
            {product.brand && <p className="mt-1 text-sm text-muted-foreground">By {product.brand}</p>}
          </div>

          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-primary">{kes(product.price)}</span>
            {product.costPrice > 0 && product.price < product.costPrice * 1.3 && (
              <span className="pb-1 text-sm text-muted-foreground line-through">{kes(Math.round(product.price * 1.25))}</span>
            )}
          </div>

          <p className="leading-relaxed text-muted-foreground">{product.description}</p>

          {/* Stock */}
          <div className="flex items-center gap-2 text-sm">
            {outOfStock ? (
              <span className="font-semibold text-destructive">✗ Out of stock — restocking soon</span>
            ) : product.stock <= 10 ? (
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                ⚠ Hurry — only {product.stock} left in stock!
              </span>
            ) : (
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">✓ In stock ({product.stock} available)</span>
            )}
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border">
              <Button variant="ghost" size="icon" className="size-10 rounded-full" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                <Minus size={15} />
              </Button>
              <span className="w-10 text-center font-bold" aria-live="polite">{quantity}</span>
              <Button variant="ghost" size="icon" className="size-10 rounded-full" onClick={() => setQuantity((q) => Math.min(product.stock || 1, q + 1))} aria-label="Increase quantity">
                <Plus size={15} />
              </Button>
            </div>
            <Button
              size="lg"
              className="h-12 flex-1 rounded-full text-base shadow-lg"
              disabled={outOfStock}
              onClick={() => {
                addItem({
                  productId: product.id, slug: product.slug, name: product.name,
                  price: product.price, image: product.image, stock: product.stock,
                  level: product.level, subject: product.subject,
                }, quantity)
                toast.success('Added to cart', { action: { label: 'View cart', onClick: () => setCartOpen(true) } })
              }}
            >
              <ShoppingCart size={17} /> Add {quantity > 1 ? `${quantity} ` : ''}to Cart — {kes(product.price * quantity)}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-12 rounded-full"
              aria-label="Share product"
              onClick={() => {
                if (navigator.share) navigator.share({ title: product.name, text: `${product.name} — ${kes(product.price)} at KIPS Kitui` }).catch(() => {})
                else {
                  navigator.clipboard?.writeText(`${product.name} — ${kes(product.price)} at KIPS Kitui`)
                  toast.success('Product details copied')
                }
              }}
            >
              <Share2 size={17} />
            </Button>
          </div>

          {/* Buy now */}
          <Button
            variant="secondary"
            size="lg"
            className="h-12 w-full rounded-full text-base"
            disabled={outOfStock}
            onClick={() => {
              addItem({
                productId: product.id, slug: product.slug, name: product.name,
                price: product.price, image: product.image, stock: product.stock,
                level: product.level, subject: product.subject,
              }, quantity)
              navigate('checkout')
            }}
          >
            Buy Now — Checkout with M-Pesa
          </Button>

          {/* Delivery info */}
          <div className="space-y-2.5 rounded-xl border bg-muted/30 p-4 text-sm">
            <div className="flex gap-2.5">
              <Truck size={17} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <strong className="font-semibold">Delivery:</strong>{' '}
                {discountToFree > 0
                  ? `add ${kes(discountToFree)} more for FREE delivery, or from KES 100 within Kitui Town.`
                  : 'FREE delivery unlocked! 🎉'}
              </div>
            </div>
            <div className="flex gap-2.5">
              <BadgeCheck size={17} className="mt-0.5 shrink-0 text-primary" />
              <div><strong className="font-semibold">Returns:</strong> 7-day exchange on unopened items with receipt.</div>
            </div>
            <div className="flex gap-2.5">
              <Sparkles size={17} className="mt-0.5 shrink-0 text-primary" />
              <div><strong className="font-semibold">Schools:</strong> buying 50+ copies? <button className="font-semibold text-primary underline" onClick={() => navigate('bulk')}>Request a bulk quote</button> with 5% off.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-12" aria-labelledby="reviews-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="reviews-heading" className="text-xl font-black">Customer Reviews</h2>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => (user ? setReviewOpen(true) : setAuthOpen(true))}
          >
            <Star size={14} /> Write a review
          </Button>
        </div>
        {reviews.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            No reviews yet — be the first to review this product!
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {r.user.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{r.user.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <Stars rating={r.rating} size={13} />
                </div>
                {r.comment && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* AI Recommendations */}
      {recData && recData.products.length > 0 && (
        <section className="mt-12" aria-labelledby="recs-heading">
          <div className="mb-4 flex items-center gap-2">
            <h2 id="recs-heading" className="flex items-center gap-2 text-xl font-black">
              <Sparkles size={20} className="text-primary" /> You may also like
            </h2>
            <Badge variant="outline" className="border-primary/30 bg-primary/5 text-[11px] text-primary">AI picks</Badge>
          </div>
          {recData.reason && (
            <p className="mb-4 text-sm italic text-muted-foreground">“{recData.reason}”</p>
          )}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {recData.products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Related products */}
      {data?.related && data.related.length > 0 && (
        <section className="mt-12" aria-labelledby="related-heading">
          <h2 id="related-heading" className="mb-4 text-xl font-black">More in {product.category?.name}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {data.related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Review dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review {product.name}</DialogTitle>
            <DialogDescription>Share your experience to help other Kitui shoppers.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="mb-1.5 text-sm font-medium">Your rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} onClick={() => setMyRating(i)} aria-label={`Rate ${i} stars`}>
                    <Star size={30} className={cn('transition-transform hover:scale-110', i <= myRating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/30')} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium">Your review (optional)</p>
              <Textarea value={myComment} onChange={(e) => setMyComment(e.target.value)} rows={4} placeholder="How was the quality? Is it right for the class level?" />
            </div>
            <Button className="w-full" disabled={submitReview.isPending} onClick={() => submitReview.mutate()}>
              {submitReview.isPending ? 'Submitting…' : 'Submit review'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
