'use client'

import { Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube, Globe, Award, BadgeCheck } from 'lucide-react'
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
    <footer className="kip-grain relative mt-auto bg-brand-950 text-[#f2efe6]/85">
      {/* gold hairline on top */}
      <div
        aria-hidden="true"
        className="h-[3px] w-full bg-gradient-to-r from-transparent via-gold-500/70 to-transparent"
      />
      <div className="kip-pattern pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* about */}
          <div>
            <KipLogo className="text-[#f2efe6]" />
            <p className="mt-4 text-sm leading-relaxed text-[#f2efe6]/70">
              Kitui Institute of Professionals (KIP College) — a leading tertiary learning
              institution in Kitui Town, Kenya offering Technical, Business and KASNEB
              professional courses across three campuses. Training for Excellence.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-[#f2efe6]/55">
              <Globe className="h-3.5 w-3.5 shrink-0 text-gold-400" aria-hidden="true" />
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
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#f2efe6]/70 transition-all hover:border-gold-400/50 hover:bg-gold-400 hover:text-brand-950"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* quick links */}
          <nav aria-label="Footer quick links">
            <h3 className="mb-4 flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.18em] text-gold-300">
              <span className="gold-rule w-4" aria-hidden="true" />
              Quick Links
            </h3>
            <ul className="grid grid-cols-1 gap-1">
              {QUICK_LINKS.map((link) => (
                <li key={link.to}>
                  <button
                    type="button"
                    onClick={() => navigate(link.to)}
                    className="group flex min-h-9 items-center rounded text-sm text-[#f2efe6]/70 transition-colors hover:text-gold-300"
                  >
                    <span
                      aria-hidden="true"
                      className="mr-0 h-px w-0 bg-gold-400 transition-all duration-200 group-hover:mr-2 group-hover:w-3"
                    />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* campuses */}
          <div>
            <h3 className="mb-4 flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.18em] text-gold-300">
              <span className="gold-rule w-4" aria-hidden="true" />
              Our Campuses
            </h3>
            <ul className="space-y-4 text-sm text-[#f2efe6]/70">
              <li>
                <p className="font-semibold text-[#f2efe6]">Main Campus</p>
                <p className="mt-1 inline-flex items-start gap-1.5">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-400" aria-hidden="true" />
                  100m from Wikililye, Mulango Road, Kitui
                </p>
                <a
                  href="tel:+254703710879"
                  className="mt-1 flex items-center gap-1.5 transition-colors hover:text-gold-300"
                >
                  <Phone className="h-3.5 w-3.5 text-gold-400" aria-hidden="true" /> 0703 710 879
                </a>
              </li>
              <li>
                <p className="font-semibold text-[#f2efe6]">Town Campus</p>
                <p className="mt-1 inline-flex items-start gap-1.5">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-400" aria-hidden="true" />
                  Muli Mall Building, Kitui CBD
                </p>
                <a
                  href="tel:+254703710879"
                  className="mt-1 flex items-center gap-1.5 transition-colors hover:text-gold-300"
                >
                  <Phone className="h-3.5 w-3.5 text-gold-400" aria-hidden="true" /> 0703 710 879
                </a>
              </li>
              <li>
                <p className="font-semibold text-[#f2efe6]">Mwingi Campus</p>
                <p className="mt-1 inline-flex items-start gap-1.5">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-400" aria-hidden="true" />
                  Sunrise Building, Mwingi Town
                </p>
                <a
                  href="tel:+254703710879"
                  className="mt-1 flex items-center gap-1.5 transition-colors hover:text-gold-300"
                >
                  <Phone className="h-3.5 w-3.5 text-gold-400" aria-hidden="true" /> 0703 710 879
                </a>
              </li>
            </ul>
          </div>

          {/* contact & payments */}
          <div>
            <h3 className="mb-4 flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.18em] text-gold-300">
              <span className="gold-rule w-4" aria-hidden="true" />
              Contact &amp; Payments
            </h3>
            <ul className="space-y-3 text-sm text-[#f2efe6]/70">
              <li>
                <a
                  href="mailto:info@kipskitui.com"
                  className="flex items-center gap-2 transition-colors hover:text-gold-300"
                >
                  <Mail className="h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                  info@kipskitui.com
                </a>
              </li>
              <li>
                <a
                  href="mailto:admissions@kipskitui.com"
                  className="flex items-center gap-2 transition-colors hover:text-gold-300"
                >
                  <Mail className="h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                  admissions@kipskitui.com
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@kipskitui.com"
                  className="flex items-center gap-2 transition-colors hover:text-gold-300"
                >
                  <Mail className="h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                  support@kipskitui.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                0703 710 879
              </li>
              <li className="rounded-lg border border-gold-500/25 bg-gold-400/8 p-3">
                <p className="font-semibold text-gold-200">M-Pesa Paybill 522 890</p>
                <p className="mt-0.5 text-xs text-[#f2efe6]/60">Account: Admission No.</p>
              </li>
              <li className="rounded-lg border border-white/12 bg-white/5 p-3">
                <p className="font-semibold text-[#f2efe6]">Equity Bank — Kitui Branch</p>
                <p className="mt-0.5 text-xs text-[#f2efe6]/60">A/C 1234567890</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* accreditation strip */}
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#f2efe6]/50 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 text-[#f2efe6]/65">
            <Award className="h-3.5 w-3.5 text-gold-400" aria-hidden="true" />
            Accredited &amp; Examined by
          </span>
          {ACCREDITATION.map((body) => (
            <span key={body} className="inline-flex items-center gap-1">
              <BadgeCheck className="h-3.5 w-3.5 text-gold-500/70" aria-hidden="true" />
              {body}
            </span>
          ))}
        </div>
      </div>

      {/* bottom bar */}
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center text-xs text-[#f2efe6]/55 sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <p>
            &copy; {year} Kitui Institute of Professionals &middot; KIP College &middot; Training
            for Excellence
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="min-h-9 rounded transition-colors hover:text-gold-300"
            >
              Portal Login
            </button>
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="min-h-9 rounded transition-colors hover:text-gold-300"
            >
              Support
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
