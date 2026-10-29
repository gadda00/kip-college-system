/**
 * Real KIP College contact channels — a single source of truth shared by the
 * site chrome (header, footer and the mobile quick-action bar).
 */

/** Main office line — shared by all three campuses. */
export const PHONE_DISPLAY = '0703 710 879'
export const PHONE_TEL = 'tel:+254703710879'

/** WhatsApp enquiry line with a pre-filled greeting. */
export const WHATSAPP_URL = `https://wa.me/254703710879?text=${encodeURIComponent(
  "Hello KIP College, I'd like to enquire about ",
)}`

export const EMAIL = 'info@kipskitui.com'
export const EMAIL_HREF = 'mailto:info@kipskitui.com'

/** Intake calendar note (three intakes per year). */
export const INTAKE_NOTE = 'January · May · September intakes'

/** Physical campuses. */
export const CAMPUSES: { name: string; address: string }[] = [
  { name: 'Main Campus', address: '100m from Wikililye, Mulango Road, Kitui' },
  { name: 'Town Campus', address: 'Muli Mall Building, Kitui CBD' },
  { name: 'Mwingi Campus', address: 'Sunrise Building, Mwingi Town' },
]
