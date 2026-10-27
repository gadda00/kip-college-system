'use client'

import { create } from 'zustand'
import { api, post } from '@/components/kip/lib/api'
import type { SafeUser } from '@/components/kip/lib/types'

type AuthState = {
  user: SafeUser | null
  loading: boolean
  /** Re-hydrate the current session (GET /api/auth/me). */
  refresh: () => Promise<SafeUser | null>
  /** Sign in; returns the SafeUser on success (throws on bad creds). */
  login: (email: string, password: string) => Promise<SafeUser>
  /** Sign out (POST /api/auth/logout) then clear local state. */
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  refresh: async () => {
    try {
      const user = await api<SafeUser | null>('/api/auth/me')
      set({ user: user ?? null, loading: false })
      return user ?? null
    } catch {
      set({ user: null, loading: false })
      return null
    }
  },

  login: async (email, password) => {
    const user = await post<SafeUser>('/api/auth/login', { email, password })
    set({ user })
    return user
  },

  logout: async () => {
    try {
      await post('/api/auth/logout', {})
    } finally {
      set({ user: null })
    }
  },
}))

/** Portal home hash per role (used by login + portal guards). */
export function portalHomeFor(role: SafeUser['role'] | undefined): string {
  switch (role) {
    case 'ADMIN':
      return '/admin'
    case 'LECTURER':
      return '/lecturer'
    case 'STUDENT':
      return '/portal'
    default:
      return '/login'
  }
}
