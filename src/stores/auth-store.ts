'use client'

import { create } from 'zustand'

export type AuthUser = {
  id: string
  email: string
  name: string
  phone: string | null
  role: 'CUSTOMER' | 'SCHOOL' | 'STAFF' | 'ADMIN'
  loyaltyPoints: number
  schoolName: string | null
  address: string | null
  town: string | null
}

type AuthState = {
  user: AuthUser | null
  loading: boolean
  initialised: boolean
  init: () => Promise<void>
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  register: (data: {
    name: string
    email: string
    password: string
    phone?: string
    role?: 'CUSTOMER' | 'SCHOOL'
    schoolName?: string
    town?: string
  }) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
  setUser: (user: AuthUser | null) => void
  refresh: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialised: false,
  init: async () => {
    if (get().initialised) return
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      set({ user: data.user, initialised: true })
    } catch {
      set({ initialised: true })
    }
  },
  login: async (email, password) => {
    set({ loading: true })
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) return { ok: false, error: data.error || 'Login failed' }
      set({ user: data.user, loading: false })
      return { ok: true }
    } catch {
      return { ok: false, error: 'Network error. Please try again.' }
    } finally {
      set({ loading: false })
    }
  },
  register: async (data) => {
    set({ loading: true })
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) return { ok: false, error: json.error || 'Registration failed' }
      set({ user: json.user, loading: false })
      return { ok: true }
    } catch {
      return { ok: false, error: 'Network error. Please try again.' }
    } finally {
      set({ loading: false })
    }
  },
  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    set({ user: null })
  },
  setUser: (user) => set({ user }),
  refresh: async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      set({ user: data.user })
    } catch {}
  },
}))
