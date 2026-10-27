'use client'

import { Heart, Plus, ShoppingCart, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductImage } from '@/components/shared/book-cover'
import { Stars, kes } from '@/components/shared/ui-bits'
import { useCartStore } from '@/stores/cart-store'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'

export type Product = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  stock: number
  image: string | null
  brand: string | null
  level: string | null
  subject: string | null
  isFeatured: boolean
  rating: number
  reviewCount: number
  sold: number
  category?: { name: string; slug: string }
}

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const navigate = useUIStore((s) => s.navigate)
  const addItem = useCartStore((s) => s.addItem)
  const setCartOpen = useUIStore((s) => s.setCartOpen)
  const user = useAuthStore((s) => s.user)
  const setAuthOpen = useUIStore((s) => s.setAuthOpen)
  const qc = useQueryClient()

  const { data: wishData } = useQuery<{ items: { productId: string }[] }>({
    queryKey: ['wishlist'],
    queryFn: async () => (await fetch('/api/wishlist')).json(),
    enabled: !!user,
  })
  const saved = wishData?.items?.some((i) => i.productId === product.id) ?? false

  const toggleWish = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })
      return res.json()
    },
    onSuccess: (data) => {
      toast.success(data.saved ? 'Saved to wishlist' : 'Removed from wishlist')
      qc.invalidateQueries({ queryKey: ['wishlist'] })
    },
    onError: () => toast.error('Could not update wishlist'),
  })

  const outOfStock = product.stock <= 0
  const lowStock = product.stock > 0 && product.stock <= 10

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
        className
      )}
    >
      {/* Wishlist + quick view buttons */}
      <div className="absolute right-4 top-4 z-10 flex flex-col gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <Button
          variant="secondary"
          size="icon"
          className="size-8 rounded-full shadow-sm"
          aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={(e) => {
            e.stopPropagation()
            if (!user) {
              setAuthOpen(true)
              return
            }
            toggleWish.mutate()
          }}
        >
          <Heart size={14} className={saved ? 'fill-red-500 text-red-500' : ''} />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="size-8 rounded-full shadow-sm"
          aria-label="Quick view product"
          onClick={(e) => {
            e.stopPropagation()
            navigate('product', { slug: product.slug })
          }}
        >
          <Eye size={14} />
        </Button>
      </div>

      <button
        className="text-left"
        onClick={() => navigate('product', { slug: product.slug })}
        aria-label={`View ${product.name}`}
      >
        <ProductImage
          name={product.name}
          image={product.image}
          level={product.level}
          subject={product.subject}
          brand={product.brand}
          className="transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </button>

      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            {product.category?.name ?? ''}
          </span>
          {product.isFeatured && (
            <Badge variant="outline" className="shrink-0 border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400">
              Bestseller
            </Badge>
          )}
        </div>

        <button
          onClick={() => navigate('product', { slug: product.slug })}
          className="line-clamp-2 text-left text-sm font-semibold leading-snug hover:text-primary"
        >
          {product.name}
        </button>

        <div className="flex items-center gap-1.5">
          <Stars rating={product.rating} size={12} />
          <span className="text-[11px] text-muted-foreground">({product.reviewCount})</span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div>
            <div className="text-base font-extrabold text-primary">{kes(product.price)}</div>
            {outOfStock ? (
              <span className="text-[11px] font-semibold text-destructive">Out of stock</span>
            ) : lowStock ? (
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                Only {product.stock} left!
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground">{product.sold}+ sold</span>
            )}
          </div>
          <Button
            size="icon"
            className="size-9 rounded-full shadow-sm"
            disabled={outOfStock}
            aria-label={`Add ${product.name} to cart`}
            onClick={() => {
              addItem({
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.image,
                stock: product.stock,
                level: product.level,
                subject: product.subject,
              })
              toast.success(`${product.name.slice(0, 40)} added to cart`, {
                action: { label: 'View cart', onClick: () => setCartOpen(true) },
              })
            }}
          >
            <ShoppingCart size={15} />
          </Button>
        </div>
      </div>
    </div>
  )
}
