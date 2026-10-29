'use client'

import {
  BookOpenCheck,
  Briefcase,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react'

/** KES currency, no decimals: "KES 25,000". */
const kesNumber = new Intl.NumberFormat('en-KE', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function fmtKES(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—'
  return `KES ${kesNumber.format(value)}`
}

/** "12 Sep 2026" style short date. */
export function fmtDate(value: string | Date | null | undefined): string {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** "12 Sep 2026, 09:00" style date-time. */
export function fmtDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return '—'
  return `${d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}, ${d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', hour12: false })}`
}

/** Tailwind text classes per letter grade (A best → E worst). */
export function gradeColor(grade: string | null | undefined): string {
  switch (grade) {
    case 'A':
      return 'text-green-700 dark:text-green-400'
    case 'B':
      return 'text-emerald-600 dark:text-emerald-400'
    case 'C':
      return 'text-amber-600 dark:text-amber-400'
    case 'D':
      return 'text-orange-600 dark:text-orange-400'
    default:
      return 'text-red-600 dark:text-red-400'
  }
}

export type CourseCategory = 'TECHNICAL' | 'BUSINESS' | 'KASNEB'

export type CategoryMeta = {
  label: string
  icon: LucideIcon
  image: string
  blurb: string
}

/** Presentation metadata for the three course categories. */
export function categoryMeta(category: string): CategoryMeta {
  switch (category) {
    case 'TECHNICAL':
      return {
        label: 'Technical & Engineering',
        icon: GraduationCap,
        image: '/images/cat-technical.webp',
        blurb:
          'ICT, electrical & electronic engineering, building construction, catering, fashion design and artisan trades — hands-on training in modern workshops and labs.',
      }
    case 'KASNEB':
      return {
        label: 'KASNEB Professional',
        icon: BookOpenCheck,
        image: '/images/cat-kasneb.webp',
        blurb:
          'CPA, CAMS, CS, CIFA and DICT — professional examination programmes taught by qualified accountants and practitioners, with exceptional pass rates.',
      }
    case 'BUSINESS':
    default:
      return {
        label: 'Business & Management',
        icon: Briefcase,
        image: '/images/cat-business.webp',
        blurb:
          'Business management, HR, supply chain, sales & marketing and project management — diplomas and certificates for the modern workplace.',
      }
  }
}

/** Human duration from months: 12 → "1 year", 18 → "18 months", 6 → "6 months". */
export function fmtDuration(months: number | null | undefined): string {
  if (!months) return '—'
  if (months % 12 === 0) {
    const years = months / 12
    return years === 1 ? '1 year' : `${years} years`
  }
  return months === 1 ? '1 month' : `${months} months`
}
