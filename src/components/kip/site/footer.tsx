'use client'

import type { ReactNode } from 'react'
import {
  BadgeCheck,
  Facebook,
  Globe,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Twitter,
  Youtube,
} from 'lucide-react'
import { KipLink } from '@/components/kip/components/link'
import { KipLogoLight } from '@/components/kip/components/kip-logo'
import {
  CAMPUSES,
  EMAIL,
  EMAIL_HREF,
  PHONE_DISPLAY,
  PHONE_TEL,
  WHATSAPP_URL,
} from '@/components/kip/site/contact-info'

const SOCIALS = [
  { label: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
  { label: 'X (Twitter)', icon: Twitter, href: 'https://x.com' },
  { label: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
  { label: 'YouTube', icon: Youtube, href: 'https://youtube.com' },
]

/** Column heading — cream on emerald with a short emerald rule (gold is
 *  reserved for the Apply CTA and active highlights). */
function FooterHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-4 flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.18em] text-[#f2efe6]">
      <span aria-hidden="true" className="h-[3px] w-4 rounded-full bg-brand-500" />
      {children}
    </h3>
  )
}

/** Footer nav entry — a real KipLink anchor with an emerald slide-in tick. */
function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <li>
      <KipLink
        to={to}
        className="group flex min-h-9 items-center rounded text-sm text-[#f2efe6]/70 transition-colors hover:text-white"
      >
        <span
          aria-hidden="true"
          className="mr-0 h-px w-0 bg-brand-500 transition-all duration-200 group-hover:mr-2 group-hover:w-3"
        />
        {children}
      </KipLink>
    </li>
  )
}

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="kip-grain bg-brand-band relative mt-auto text-[#f2efe6]/85">
      <div className="kip-pattern pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── brand row ── */}
        <div className="flex flex-col gap-6 border-b border-white/10 py-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-md">
            <KipLogoLight />
            <p className="mt-4 text-sm leading-relaxed text-[#f2efe6]/70">
              Kitui Institute of Professionals (KIP College) — a leading tertiary learning
              institution in Kitui Town, Kenya offering Technical, Business and KASNEB
              professional courses across three campuses. Training for Excellence.
            </p>
          </div>
          <div className="flex flex-col gap-4 md:items-end">
            <div className="flex items-center gap-1.5 text-xs text-[#f2efe6]/55">
              <Globe className="h-3.5 w-3.5 shrink-0 text-brand-500" aria-hidden="true" />
              www.kipskitui.com
            </div>
            <div className="flex items-center gap-2">
              {SOCIALS.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`KIP College on ${label}`}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#f2efe6]/70 transition-all hover:border-white/30 hover:bg-white/15 hover:text-white"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── four columns ── */}
        <div className="grid grid-cols-1 gap-10 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Programmes */}
          <nav aria-label="Programmes">
            <FooterHeading>Programmes</FooterHeading>
            <ul className="grid grid-cols-1 gap-1">
              <FooterLink to="/academics?category=TECHNICAL">Technical &amp; Engineering</FooterLink>
              <FooterLink to="/academics?category=BUSINESS">Business &amp; Management</FooterLink>
              <FooterLink to="/academics?category=KASNEB">KASNEB Professional</FooterLink>
              <FooterLink to="/academics">All programmes</FooterLink>
              <FooterLink to="/downloads">Downloads &amp; resources</FooterLink>
            </ul>
          </nav>

          {/* Admissions & students */}
          <nav aria-label="Admissions and students">
            <FooterHeading>Admissions &amp; students</FooterHeading>
            <ul className="grid grid-cols-1 gap-1">
              <FooterLink to="/admissions">How to apply</FooterLink>
              <FooterLink to="/apply">Apply online</FooterLink>
              <FooterLink to="/admissions">Fees &amp; payment</FooterLink>
              <FooterLink to="/login">Student login</FooterLink>
              <FooterLink to="/login/staff">Staff login</FooterLink>
              <FooterLink to="/faq">FAQs</FooterLink>
            </ul>
          </nav>

          {/* Campuses + talk to us */}
          <div>
            <FooterHeading>Campuses</FooterHeading>
            <ul className="space-y-4 text-sm text-[#f2efe6]/70">
              {CAMPUSES.map((campus) => (
                <li key={campus.name}>
                  <p className="font-semibold text-[#f2efe6]">{campus.name}</p>
                  <p className="mt-1 inline-flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" aria-hidden="true" />
                    {campus.address}
                  </p>
                </li>
              ))}
            </ul>

            <h4 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-[#f2efe6]/60">
              Talk to us
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href={PHONE_TEL}
                  className="flex items-center gap-2 text-[#f2efe6]/70 transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
                  {PHONE_DISPLAY} — all campuses
                </a>
              </li>
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#f2efe6]/70 transition-colors hover:text-white"
                >
                  <MessageCircle className="h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
                  WhatsApp us
                </a>
              </li>
              <li>
                <a
                  href={EMAIL_HREF}
                  className="flex items-center gap-2 text-[#f2efe6]/70 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
                  {EMAIL}
                </a>
              </li>
            </ul>

            <div className="mt-6 rounded-lg border border-white/12 bg-white/5 p-3">
              <p className="font-semibold text-[#f2efe6]">M-Pesa Paybill 522 890</p>
              <p className="mt-0.5 text-xs text-[#f2efe6]/60">Account: Admission No.</p>
              <p className="mt-1 text-[11px] text-[#f2efe6]/45">
                Confirm current details with the finance office.
              </p>
            </div>
          </div>

          {/* About & legal */}
          <nav aria-label="About and legal">
            <FooterHeading>About &amp; legal</FooterHeading>
            <ul className="grid grid-cols-1 gap-1">
              <FooterLink to="/about">About KIP College</FooterLink>
              <FooterLink to="/news">News &amp; stories</FooterLink>
              <FooterLink to="/events">Upcoming events</FooterLink>
              <FooterLink to="/gallery">Photo gallery</FooterLink>
              <FooterLink to="/contact">Contact us</FooterLink>
            </ul>
            <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-[#f2efe6]/55">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
              KNEC &middot; TVET CDACC &middot; NITA &middot; KASNEB registered
            </p>
          </nav>
        </div>
      </div>

      {/* ── legal strip ── */}
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs text-[#f2efe6]/55 sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <p>
            &copy; {year} Kitui Institute of Professionals &middot; Training for Excellence
          </p>
          <p>
            Data protection enquiries:{' '}
            <a
              href={EMAIL_HREF}
              className="font-medium text-[#f2efe6]/80 underline-offset-2 transition-colors hover:text-white hover:underline"
            >
              {EMAIL}
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
