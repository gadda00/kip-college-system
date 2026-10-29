import { z } from 'zod'
import { db } from '@/lib/db'
import { handle, ok, readJson } from '@/lib/api-helpers'
import { HttpError } from '@/lib/auth'
// SERVER-ONLY import — the z-ai SDK must never be bundled into client code.
import ZAI from 'z-ai-web-dev-sdk'

export const dynamic = 'force-dynamic'

// ---- simple in-memory rate limit: max 20 requests / minute / IP ----
const RATE_LIMIT = 20
const WINDOW_MS = 60_000
const hits = new Map<string, { count: number; windowStart: number }>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = hits.get(ip)
  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    hits.set(ip, { count: 1, windowStart: now })
    return false
  }
  entry.count += 1
  return entry.count > RATE_LIMIT
}

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1, 'Message cannot be empty').max(4000, 'Message is too long'),
})

const assistantSchema = z.object({
  messages: z.array(messageSchema).min(1, 'messages is required'),
})

const FALLBACK_REPLY =
  'I am having a little trouble connecting right now — please try again in a moment. ' +
  'You can also reach us directly at info@kipskitui.com or admissions@kipskitui.com, call 0703 710 879, ' +
  'or apply online via the application form on this website. Karibu KIP College — Training for Excellence!'

/** Build the "KIP Assistant" system prompt, embedding live course + fee data from the db. */
async function buildSystemPrompt(): Promise<string> {
  const courses = await db.course.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { title: true, category: true, level: true, tuitionPerTerm: true, registrationFee: true, examFee: true },
  })

  const byCategory = new Map<string, string[]>()
  for (const c of courses) {
    const list = byCategory.get(c.category) ?? []
    list.push(
      `${c.title} (${c.level}) — tuition KES ${c.tuitionPerTerm.toLocaleString('en-KE')}/term, ` +
        `registration KES ${c.registrationFee.toLocaleString('en-KE')}, exam KES ${c.examFee.toLocaleString('en-KE')}`,
    )
    byCategory.set(c.category, list)
  }
  const courseSummary = [...byCategory.entries()]
    .map(([category, list]) => `${category}:\n- ${list.join('\n- ')}`)
    .join('\n\n')

  return [
    'You are "KIP Assistant", the friendly AI helper for KIP College — Kitui Institute of Professionals, a tertiary learning institution in Kitui Town, Kenya. Motto: "Training for Excellence". Website: www.kipskitui.com.',
    'Three campuses: Main Campus (100m from Wikililye, Mulango Road, Kitui), Town Campus (Muli Mall Building, Kitui CBD — evening/weekend classes), Mwingi Campus (Sunrise Building, Mwingi Town).',
    'Accreditation & examination bodies: KNEC, CDACC (TVET-CDACC), NITA and KASNEB.',
    'It offers TECHNICAL (ICT, Electrical & Electronic Engineering, Water Engineering, Building Construction, Plumbing, Catering & Accommodation, Hairdressing & Beauty, Fashion Design & Garment Making, Artisan Electrical Installation), BUSINESS (Business Management, HRM, Supply Chain, Sales & Marketing, Project Management, Community & Social Development, Secretarial Studies, Storekeeping & Warehouse, Salesmanship + certificates) and KASNEB (CPA, ATD, CAMS, CS, CIFA, DICT) courses.',
    'CURRENT COURSE & FEE LIST (live from our records — prefer these exact numbers when quoting fees):',
    courseSummary,
    'Tuition ranges ~KES 6,500–16,000 per term; registration KES 1,500–3,000; exam fees extra (KASNEB ~KES 6,600/level sitting). Flexible instalment plans available; bursaries accepted (county & national government funds).',
    'Intakes: January, May, September. Requirements: Diplomas KCSE C- (CPA needs C+ with C+ in Maths & English, or CAMS/ATD bridging), Certificates KCSE D+/D, Artisan KCSE D-. Evening & weekend classes at Town Campus.',
    'Facilities: engineering workshops, ICT labs, library, hostels at Main Campus, training kitchen, beauty studio, radio/audio studio, college transport.',
    "To apply: fill the online application form on the website (#/apply) or visit any campus admissions office; application is free; response within 48 hours. Downloads (application form, fee structure, prospectus) are on the website's Downloads page.",
    'Fees may be paid in cash at any campus finance office.',
    'For current fee payment channels (M-Pesa paybill, bank accounts), ask the student to contact the finance office at any campus or call +254 703 710 879 — do not quote specific account numbers.',
    'Contact: info@kipskitui.com / admissions@kipskitui.com / support@kipskitui.com, phone 0703 710 879. Students access the student portal via the Login button.',
    'Answer ONLY topics about KIP College, courses, admissions, fees, campuses, portals, and general education guidance in Kenya; if asked something unrelated, politely steer back.',
    'Keep answers concise (max ~120 words), warm, professional, and format with short paragraphs/bullets. Never invent phone numbers, fees, or policies beyond those given.',
  ].join('\n')
}

/** KIP Assistant chat endpoint — multi-turn history supplied by the client. */
export async function POST(req: Request) {
  return handle(async () => {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'local'
    if (rateLimited(ip)) throw new HttpError(429, 'Too many requests — please wait a moment and try again')

    const body = assistantSchema.parse(await readJson(req))

    // keep at most the latest 12 client messages; system prompt is always first
    const history = body.messages.slice(-12).map((m) => ({ role: m.role, content: m.content }))
    const systemPrompt = await buildSystemPrompt()
    // the SDK accepts a proper system-role message — instructions stay out of
    // the visible assistant turn and are no longer mistaken for conversation
    const messages = [{ role: 'system' as const, content: systemPrompt }, ...history]

    try {
      const zai = await ZAI.create()
      const completion = await zai.chat.completions.create({
        messages,
        thinking: { type: 'disabled' },
      })
      const reply: string | undefined = completion?.choices?.[0]?.message?.content
      if (!reply || !reply.trim()) throw new Error('Empty completion')
      return ok({ reply: reply.trim() })
    } catch (err) {
      console.error('[assistant] SDK failure, returning fallback:', err)
      return ok({ reply: FALLBACK_REPLY })
    }
  })
}
