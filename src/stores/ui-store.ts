'use client'

import { create } from 'zustand'

export type View =
  | 'home'
  | 'shop'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'order-success'
  | 'track'
  | 'bulk'
  | 'printing'
  | 'account'
  | 'wishlist'
  | 'about'
  | 'contact'
  | 'login'
  | 'register'
  | 'admin'

export type ViewParams = {
  slug?: string
  orderNumber?: string
  category?: string
  q?: string
  section?: string
  bulkId?: string
}

type UIState = {
  view: View
  params: ViewParams
  history: { view: View; params: ViewParams }[]
  cartOpen: boolean
  authOpen: boolean
  chatOpen: boolean
  navigate: (view: View, params?: ViewParams) => void
  back: () => void
  setCartOpen: (open: boolean) => void
  setAuthOpen: (open: boolean) => void
  setChatOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  view: 'home',
  params: {},
  history: [],
  cartOpen: false,
  authOpen: false,
  chatOpen: false,
  navigate: (view, params = {}) => {
    const { view: curView, params: curParams, history } = get()
    set({
      view,
      params,
      history: [...history.slice(-12), { view: curView, params: curParams }],
      cartOpen: false,
    })
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  },
  back: () => {
    const { history } = get()
    const last = history[history.length - 1]
    if (last) {
      set({ view: last.view, params: last.params, history: history.slice(0, -1) })
      if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
    } else {
      set({ view: 'home', params: {} })
    }
  },
  setCartOpen: (cartOpen) => set({ cartOpen }),
  setAuthOpen: (authOpen) => set({ authOpen }),
  setChatOpen: (chatOpen) => set({ chatOpen }),
}))
