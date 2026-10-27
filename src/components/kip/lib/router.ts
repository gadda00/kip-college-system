'use client'

import { useCallback, useEffect, useState } from 'react'

/** A parsed hash route: '' → home. */
export type AppRoute = {
  /** First path segment ('' for home). */
  path: string
  /** Remaining path segments (e.g. ['abc123'] for '#/course/abc123'). */
  params: string[]
  /** Query params parsed from the hash ('#/academics?category=KASNEB'). */
  query: Record<string, string>
}

/** Parse a raw hash string ('', '#/', '#/course/abc123?x=1') into an AppRoute. */
export function parseRoute(hash: string): AppRoute {
  let raw = hash.trim()
  if (raw.startsWith('#')) raw = raw.slice(1)
  // split query off the path
  const qIndex = raw.indexOf('?')
  const queryPart = qIndex >= 0 ? raw.slice(qIndex + 1) : ''
  let pathPart = qIndex >= 0 ? raw.slice(0, qIndex) : raw
  pathPart = pathPart.replace(/^\/+/, '') // drop leading slashes

  const query: Record<string, string> = {}
  if (queryPart) {
    for (const pair of queryPart.split('&')) {
      if (!pair) continue
      const eq = pair.indexOf('=')
      if (eq < 0) {
        query[decodeURIComponent(pair)] = ''
      } else {
        query[decodeURIComponent(pair.slice(0, eq))] = decodeURIComponent(pair.slice(eq + 1))
      }
    }
  }

  const segments = pathPart.split('/').filter(Boolean)
  return { path: segments[0] ?? '', params: segments.slice(1), query }
}

/** Current route from location.hash. */
export function currentRoute(): AppRoute {
  if (typeof window === 'undefined') return { path: '', params: [], query: {} }
  return parseRoute(window.location.hash)
}

/** Navigate to a hash path (e.g. '/course/abc'). Scrolls to top. */
export function navigate(to: string): void {
  const target = to.startsWith('#') ? to : `#${to.startsWith('/') ? to : `/${to}`}`
  if (typeof window === 'undefined') return
  if (window.location.hash === target) {
    // same route — just scroll up
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  window.location.hash = target
  window.scrollTo({ top: 0 })
}

/** Subscribe to hash changes; returns the current AppRoute. */
export function useHashRoute(): AppRoute {
  const [route, setRoute] = useState<AppRoute>(() => currentRoute())

  useEffect(() => {
    const onChange = () => setRoute(currentRoute())
    window.addEventListener('hashchange', onChange)
    // capture in case the hash changed before mount
    onChange()
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}

/** Stable navigate callback for onClick handlers. */
export function useNavigate() {
  return useCallback((to: string) => navigate(to), [])
}

/** Map a route to a readable document title. */
export function routeTitle(route: AppRoute): string {
  const map: Record<string, string> = {
    '': 'KIP College — Technical, Business & KASNEB Courses in Kitui, Kenya',
    about: 'About — KIP College',
    academics: 'Academic Programmes — KIP College',
    course: 'Course Details — KIP College',
    admissions: 'Admissions — KIP College',
    apply: 'Apply Online — KIP College',
    campuses: 'Our Campuses — KIP College',
    news: 'News & Stories — KIP College',
    events: 'Events — KIP College',
    gallery: 'Gallery — KIP College',
    faq: 'FAQs — KIP College',
    downloads: 'Downloads & Resources — KIP College',
    contact: 'Contact Us — KIP College',
    login: 'Login — KIP College',
    portal: 'Student Portal — KIP College',
    lecturer: 'Lecturer Portal — KIP College',
    admin: 'Admin Dashboard — KIP College',
  }
  return map[route.path] ?? 'KIP College'
}
