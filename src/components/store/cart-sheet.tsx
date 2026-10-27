'use client'

import { Minus, Plus, ShoppingBag, Trash2, Truck, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { ProductImage } from '@/components/shared/book-cover'
import { kes } from '@/components/shared/ui-bits'
import { useCartStore, cartSubtotal, cartCount } from '@/stores/cart-store'
import { useUIStore } from '@/stores/ui-store'
import { FREE_DELIVERY_THRESHOLD } from '@/lib/pricing'

export function CartSheet() {
  const { cartOpen, setCartOpen, navigate } = useUIStore()
  const { items, setQuantity, removeItem } = useCartStore()
  const subtotal = cartSubtotal(items)
  const count = cartCount(items)
  const freeGap = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal)
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100)

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag size={18} /> Your Cart
            <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              {count} {count === 1 ? 'item' : 'items'}
            </span>
          </SheetTitle>
          <SheetDescription>
            {freeGap > 0 ? `Add ${kes(freeGap)} more for FREE delivery!` : '🎉 You unlocked FREE delivery!'}
          </SheetDescription>
          {/* Free delivery progress */}
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <ShoppingBag size={28} className="text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Your cart is empty</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse our catalog of KICD-approved books and supplies.
              </p>
            </div>
            <Button onClick={() => { setCartOpen(false); navigate('shop') }}>
              Start shopping <ArrowRight size={15} />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.productId} className="flex gap-3">
                    <div className="w-16 shrink-0">
                      <ProductImage
                        name={item.name}
                        image={item.image}
                        level={item.level}
                        subject={item.subject}
                        className="shadow-sm"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <button
                        className="line-clamp-2 text-left text-sm font-medium hover:text-primary"
                        onClick={() => {
                          setCartOpen(false)
                          navigate('product', { slug: item.slug })
                        }}
                      >
                        {item.name}
                      </button>
                      <span className="mt-0.5 text-sm font-bold text-primary">{kes(item.price)}</span>
                      <div className="mt-auto flex items-center gap-2 pt-1">
                        <div className="flex items-center rounded-full border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-full"
                            onClick={() => setQuantity(item.productId, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </Button>
                          <span className="w-7 text-center text-xs font-bold">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-full"
                            onClick={() => setQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-full text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.productId)}
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right text-sm font-bold">{kes(item.price * item.quantity)}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 border-t p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{kes(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Truck size={12} /> Delivery</span>
                <span>{subtotal >= FREE_DELIVERY_THRESHOLD ? 'FREE' : 'From KES 100'}</span>
              </div>
              <Separator />
              <Button
                className="h-11 w-full text-base"
                onClick={() => {
                  setCartOpen(false)
                  navigate('checkout')
                }}
              >
                Checkout <ArrowRight size={16} />
              </Button>
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={() => {
                  setCartOpen(false)
                  navigate('shop')
                }}
              >
                Continue shopping
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
