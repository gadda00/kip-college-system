'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'framer-motion'
import { useHashRoute, routeTitle } from '@/components/kip/lib/router'
import { useAuthStore } from '@/components/kip/stores/auth-store'
import { Header } from '@/components/kip/site/header'
import { Footer } from '@/components/kip/site/footer'
import { MobileActionBar } from '@/components/kip/site/mobile-action-bar'
import { ChatWidget } from '@/components/kip/chat-widget'
import { BackToTop } from '@/components/kip/components/back-to-top'

import { HomeView } from '@/components/kip/site/views/home-view'
import { AboutView } from '@/components/kip/site/views/about-view'
import { AcademicsView } from '@/components/kip/site/views/academics-view'
import { CourseDetailView } from '@/components/kip/site/views/course-detail-view'
import { AdmissionsView } from '@/components/kip/site/views/admissions-view'
import { ApplyView } from '@/components/kip/site/views/apply-view'
import { CampusesView } from '@/components/kip/site/views/campuses-view'
import { NewsView } from '@/components/kip/site/views/news-view'
import { NewsDetailView } from '@/components/kip/site/views/news-detail-view'
import { EventsView } from '@/components/kip/site/views/events-view'
import { GalleryView } from '@/components/kip/site/views/gallery-view'
import { ContactView } from '@/components/kip/site/views/contact-view'
import { LoginView } from '@/components/kip/site/views/login-view'
import { FaqView } from '@/components/kip/site/views/faq-view'
import { DownloadsView } from '@/components/kip/site/views/downloads-view'

/**
 * Authenticated portals are code-split: public visitors never download the
 * student/lecturer/admin bundles (recharts, data tables, mark-entry forms…).
 */
function PortalSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-7xl animate-pulse px-4 py-12 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-label="Loading portal"
    >
      <div className="h-8 w-48 rounded-lg bg-muted" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="mt-6 h-64 rounded-xl bg-muted" />
    </div>
  )
}

const StudentPortal = dynamic(
  () => import('@/components/kip/portal/student/StudentPortal').then((m) => m.StudentPortal),
  { ssr: false, loading: () => <PortalSkeleton /> },
)
const LecturerPortal = dynamic(
  () => import('@/components/kip/portal/lecturer/LecturerPortal').then((m) => m.LecturerPortal),
  { ssr: false, loading: () => <PortalSkeleton /> },
)
const AdminDashboard = dynamic(
  () => import('@/components/kip/admin/AdminDashboard').then((m) => m.AdminDashboard),
  { ssr: false, loading: () => <PortalSkeleton /> },
)

/**
 * KIP College single-page application shell.
 *
 * ROUTE TABLE (hash routing):
 *   ''              → HomeView          (home-view.tsx)
 *   about           → AboutView
 *   academics       → AcademicsView     (supports ?category=)
 *   course/:id      → CourseDetailView
 *   admissions      → AdmissionsView
 *   apply           → ApplyView         (supports ?course=)
 *   campuses        → CampusesView
 *   news            → NewsView
 *   news/:id        → NewsDetailView
 *   events          → EventsView
 *   gallery         → GalleryView
 *   faq             → FaqView
 *   downloads       → DownloadsView
 *   contact         → ContactView
 *   login           → LoginView
 *   portal/*        → StudentPortal (Task 5-b) — sub-routes: dashboard, learning,
 *                      fees, results, timetable, announcements, profile
 *   lecturer/*      → LecturerPortal (Task 5-b) — sub-routes: dashboard, classes,
 *                      timetable, class/:unitId, results, results/:unitId
 *   admin/*         → AdminDashboard (Task 5-c) — sub-routes: overview, students,
 *                      students/:id, applications, courses, courses/:id, fees,
 *                      results, timetable, announcements, news, messages
 */
function resolveView(path: string, params: string[], query: Record<string, string>) {
  switch (path) {
    case '':
      return <HomeView />
    case 'about':
      return <AboutView />
    case 'academics':
      return <AcademicsView initialCategory={query.category ?? ''} />
    case 'course':
      return <CourseDetailView courseId={params[0] ?? ''} />
    case 'admissions':
      return <AdmissionsView />
    case 'apply':
      return <ApplyView preselectedCourseId={query.course ?? ''} />
    case 'campuses':
      return <CampusesView />
    case 'news':
      return params[0] ? <NewsDetailView newsId={params[0]} /> : <NewsView />
    case 'events':
      return <EventsView />
    case 'gallery':
      return <GalleryView />
    case 'faq':
      return <FaqView />
    case 'downloads':
      return <DownloadsView />
    case 'contact':
      return <ContactView />
    case 'login':
      return <LoginView />
    case 'portal':
      return <StudentPortal sub={params[0] ?? 'dashboard'} />
    case 'lecturer':
      return <LecturerPortal sub={params[0] ?? 'dashboard'} unitId={params[1] ?? ''} />
    case 'admin':
      return <AdminDashboard sub={params[0] ?? 'overview'} id={params[1] ?? ''} />
    default:
      return <NotFoundView />
  }
}

/** Route segments whose views manage their own full-screen chrome — no
 *  public footer quick-actions there. */
const PRIVATE_ROUTE_PATHS = new Set(['portal', 'lecturer', 'admin'])

function NotFoundView() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-5xl font-black tracking-tight text-primary">404</p>
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The page you are looking for does not exist or may have been moved.
      </p>
    </div>
  )
}

export default function KipApp() {
  const route = useHashRoute()
  const refresh = useAuthStore((s) => s.refresh)

  // hydrate the auth session once on mount
  useEffect(() => {
    void refresh()
  }, [refresh])

  // document title + scroll restoration per view
  useEffect(() => {
    document.title = routeTitle(route)
    window.scrollTo({ top: 0 })
  }, [route.path, route.params.join('/'), route])

  const view = resolveView(route.path, route.params, route.query)
  // include the query in the key so e.g. #/academics?category=KASNEB (footer
  // programme links) remounts the view with the new filter applied
  const queryKey = new URLSearchParams(route.query).toString()
  const viewKey = `${route.path}/${route.params.join('/')}${queryKey ? `?${queryKey}` : ''}`
  const isPublicRoute = !PRIVATE_ROUTE_PATHS.has(route.path)

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main id="main-content" className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewKey}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {view}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      {/* Reserve scroll space on phones (<lg) so the fixed quick-action bar
          never covers footer content — safe area included for the iOS home
          indicator. Rendered only when the bar itself shows (public routes). */}
      {isPublicRoute && (
        <div className="h-16 pb-[env(safe-area-inset-bottom)] lg:hidden" aria-hidden="true" />
      )}
      {/* Sticky phone quick actions (Apply / WhatsApp / Call) — public pages
          only; the bar also self-hides on private routes and when printing. */}
      {isPublicRoute && <MobileActionBar />}
      {/* Floating utilities (AI assistant, back-to-top) — lifted above the
          mobile quick-action bar on phones so they never cover the Apply or
          Call buttons; desktop positions are untouched. */}
      <div className="max-lg:[&>button]:bottom-[calc(env(safe-area-inset-bottom)_+_5rem)] max-lg:[&>section]:bottom-[calc(env(safe-area-inset-bottom)_+_9rem)]">
        <ChatWidget />
        <BackToTop />
      </div>
    </div>
  )
}
