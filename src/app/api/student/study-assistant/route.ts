import { z } from 'zod'
import { db } from '@/lib/db'
import { handle, ok, readJson } from '@/lib/api-helpers'
import { HttpError } from '@/lib/auth'
import { currentStudent } from '@/lib/roles'
import { rateLimited, RATE_LIMITS } from '@/lib/rate-limit'
// SERVER-ONLY import — the z-ai SDK must never be bundled into client code.
import ZAI from 'z-ai-web-dev-sdk'

export const dynamic = 'force-dynamic'

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1, 'Message cannot be empty').max(4000, 'Message is too long'),
})

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1, 'messages is required'),
})

const FALLBACK_REPLY =
  'I could not reach my study notes just now — please try again in a moment. ' +
  'Meanwhile, your lecture notes and past papers are on the My Learning page, and your lecturer ' +
  'or the resource centre at your campus can help you in person. Keep going — Training for Excellence!'

/**
 * Build the "KIP Study Buddy" system prompt, embedding the signed-in student's
 * course, current-term units and available study material titles from the db,
 * so answers land in the context of what they actually study.
 */
async function buildSystemPrompt(): Promise<{
  prompt: string
  context: { units: string[]; materials: string[] }
}> {
  const { profile } = await currentStudent()

  const units = await db.unit.findMany({
    where: { courseId: profile.courseId, stage: profile.currentTerm },
    orderBy: { code: 'asc' },
    select: { code: true, name: true },
  })

  const materials = await db.studyMaterial.findMany({
    where: { courseId: profile.courseId },
    orderBy: { createdAt: 'desc' },
    take: 12,
    select: { title: true, type: true, unit: { select: { name: true } } },
  })

  const lines = [
    'You are "KIP Study Buddy", the friendly AI study tutor inside the student portal of KIP College — Kitui Institute of Professionals, a tertiary institution in Kitui Town, Kenya. Motto: "Training for Excellence".',
    `You are helping ${profile.user.name}, a ${profile.course.title} (${profile.course.level}) student at ${profile.campus.name}, currently in Year ${profile.yearOfStudy} Term ${profile.currentTerm} (admission ${profile.admissionNo}).`,
  ]
  if (units.length > 0) {
    lines.push(
      `Their current-term units include: ${units.map((u) => `${u.code} ${u.name}`).join('; ')}.`,
    )
  }
  if (materials.length > 0) {
    lines.push(
      `Study materials available to them on the portal: ${materials
        .map(
          (m) =>
            `${m.title} (${m.type.toLowerCase().replace(/_/g, ' ')}${
              m.unit ? `, unit: ${m.unit.name}` : ''
            })`,
        )
        .join('; ')}.`,
    )
  }
  lines.push(
    `Their course is examined by ${profile.course.examBody}.`,
    'Help with unit explanations, revision summaries, worked examples, past-paper guidance, exam technique and personalised study plans. General academic questions are fine when they help this student.',
    'Keep answers concise (max ~150 words), clear and encouraging; use short paragraphs or bullet points and simple language.',
    'If asked something unrelated to studying or their course, politely steer the conversation back to academics.',
    'Never invent fees, policies or personal data; for administrative matters (fees, admission letters, ID cards) point them to the portal pages or the campus offices.',
  )

  return {
    prompt: lines.join('\n'),
    context: {
      units: units.map((u) => `${u.code} ${u.name}`),
      materials: materials.map((m) => m.title),
    },
  }
}

/** Student AI study assistant — auth-guarded, multi-turn history from the client. */
export async function POST(req: Request) {
  return handle(async () => {
    // STUDENT-only guard (same session pattern as every other student route)
    const { user } = await currentStudent()
    if (
      rateLimited(`study-assistant:${user.id}`, RATE_LIMITS.ai.limit, RATE_LIMITS.ai.windowMs)
    ) {
      throw new HttpError(429, 'Too many requests — please wait a moment and try again')
    }

    const body = bodySchema.parse(await readJson(req))

    // keep at most the latest 12 client messages; system prompt is always first
    const history = body.messages.slice(-12).map((m) => ({ role: m.role, content: m.content }))
    const { prompt: systemPrompt, context } = await buildSystemPrompt()
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
      return ok({ reply: reply.trim(), context })
    } catch (err) {
      console.error('[study-assistant] SDK failure, returning fallback:', err)
      return ok({ reply: FALLBACK_REPLY, context })
    }
  })
}
