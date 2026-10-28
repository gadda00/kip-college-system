'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  productId: string
  slug: string
  name: string
  price: number
  image: string | null
  quantity: number
  stock: number
  level?: string | null
  subject?: string | null
}

type CartState = {
  items: CartItem[]
  recentlyViewed: string[]
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  clear: () => void
  addViewed: (productId: string) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      recentlyViewed: [],
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock || 99) }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity }] }
        }),
      removeItem: (productId) => set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock || 99)) } : i
          ),
        })),
      clear: () => set({ items: [] }),
      addViewed: (productId) =>
        set((state) => ({
          recentlyViewed: [productId, ...state.recentlyViewed.filter((id) => id !== productId)].slice(0, 8),
        })),
    }),
    { name: 'kips-cart' }
  )
)

export const cartSubtotal = (items: CartItem[]) => items.reduce((s, i) => s + i.price * i.quantity, 0)
export const cartCount = (items: CartItem[]) => items.reduce((s, i) => s + i.quantity, 0)
