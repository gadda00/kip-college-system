'use client'

import { Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube, Globe, Award } from 'lucide-react'
import { navigate } from '@/components/kip/lib/router'
import { KipLogo } from '@/components/kip/components/kip-logo'

const QUICK_LINKS: { label: string; to: string }[] = [
  { label: 'Home', to: '/' },
  { label: 'About the College', to: '/about' },
  { label: 'Academic Programmes', to: '/academics' },
  { label: 'Admissions', to: '/admissions' },
  { label: 'Apply Online', to: '/apply' },
  { label: 'Downloads & Resources', to: '/downloads' },
  { label: 'Frequently Asked Questions', to: '/faq' },
  { label: 'News & Stories', to: '/news' },
  { label: 'Upcoming Events', to: '/events' },
  { label: 'Photo Gallery', to: '/gallery' },
  { label: 'Contact Us', to: '/contact' },
]

const SOCIALS = [
  { label: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
  { label: 'X (Twitter)', icon: Twitter, href: 'https://x.com' },
  { label: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
  { label: 'YouTube', icon: Youtube, href: 'https://youtube.com' },
]

const ACCREDITATION = ['KNEC', 'CDACC', 'NITA', 'KASNEB']

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto bg-[#0b1f3f] text-white/90">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* about */}
          <div>
            <KipLogo className="text-white" />
            <p className="mt-4 text-sm leading-relaxed text-white/75">
              Kitui Institute of Professionals (KIP College) — a leading tertiary learning
              institution in Kitui Town, Kenya offering Technical, Business and KASNEB
              professional courses across three campuses. Training for Excellence.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-white/60">
              <Globe className="h-3.5 w-3.5 shrink-0 text-sky-300" aria-hidden="true" />
              www.kipskitui.com
            </div>
            <div className="mt-5 flex items-center gap-2">
              {SOCIALS.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`KIP College on ${label}`}
                  className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-white/80 transition-colors hover:bg-sky-500 hover:text-white"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* quick links */}
          <nav aria-label="Footer quick links">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-sky-300">
              Quick Links
            </h3>
            <ul className="grid grid-cols-1 gap-1">
              {QUICK_LINKS.map((link) => (
                <li key={link.to}>
                  <button
                    type="button"
                    onClick={() => navigate(link.to)}
                    className="flex min-h-9 items-center rounded text-sm text-white/75 transition-colors hover:text-sky-300"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* campuses */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-sky-300">
              Our Campuses
            </h3>
            <ul className="space-y-4 text-sm text-white/75">
              <li>
                <p className="font-semibold text-white">Main Campus</p>
                <p className="mt-1 inline-flex items-start gap-1.5">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-300" aria-hidden="true" />
                  100m from Wikililye, Mulango Road, Kitui
                </p>
                <a
                  href="tel:+254703710879"
                  className="mt-1 flex items-center gap-1.5 transition-colors hover:text-sky-300"
                >
                  <Phone className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" /> 0703 710 879
                </a>
              </li>
              <li>
                <p className="font-semibold text-white">Town Campus</p>
                <p className="mt-1 inline-flex items-start gap-1.5">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-300" aria-hidden="true" />
                  Muli Mall Building, Kitui CBD
                </p>
                <a
                  href="tel:+254703710879"
                  className="mt-1 flex items-center gap-1.5 transition-colors hover:text-sky-300"
                >
                  <Phone className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" /> 0703 710 879
                </a>
              </li>
              <li>
                <p className="font-semibold text-white">Mwingi Campus</p>
                <p className="mt-1 inline-flex items-start gap-1.5">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-300" aria-hidden="true" />
                  Sunrise Building, Mwingi Town
                </p>
                <a
                  href="tel:+254703710879"
                  className="mt-1 flex items-center gap-1.5 transition-colors hover:text-sky-300"
                >
                  <Phone className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" /> 0703 710 879
                </a>
              </li>
            </ul>
          </div>

          {/* contact & payments */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-sky-300">
              Contact &amp; Payments
            </h3>
            <ul className="space-y-3 text-sm text-white/75">
              <li>
                <a
                  href="mailto:info@kipskitui.com"
                  className="flex items-center gap-2 transition-colors hover:text-sky-300"
                >
                  <Mail className="h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
                  info@kipskitui.com
                </a>
              </li>
              <li>
                <a
                  href="mailto:admissions@kipskitui.com"
                  className="flex items-center gap-2 transition-colors hover:text-sky-300"
                >
                  <Mail className="h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
                  admissions@kipskitui.com
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@kipskitui.com"
                  className="flex items-center gap-2 transition-colors hover:text-sky-300"
                >
                  <Mail className="h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
                  support@kipskitui.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
                0703 710 879
              </li>
              <li className="rounded-lg border border-white/15 bg-white/5 p-3">
                <p className="font-semibold text-white">M-Pesa Paybill 522 890</p>
                <p className="mt-0.5 text-xs text-white/70">Account: Admission No.</p>
              </li>
              <li className="rounded-lg border border-white/15 bg-white/5 p-3">
                <p className="font-semibold text-white">Equity Bank — Kitui Branch</p>
                <p className="mt-0.5 text-xs text-white/70">A/C 1234567890</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* accreditation strip */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/55 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 text-white/70">
            <Award className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" />
            Accredited &amp; Examined by
          </span>
          {ACCREDITATION.map((body) => (
            <span key={body}>{body}</span>
          ))}
        </div>
      </div>

      {/* bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center text-xs text-white/60 sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <p>
            &copy; {year} Kitui Institute of Professionals &middot; KIP College &middot; Training
            for Excellence
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="min-h-9 rounded transition-colors hover:text-sky-300"
            >
              Portal Login
            </button>
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="min-h-9 rounded transition-colors hover:text-sky-300"
            >
              Support
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
