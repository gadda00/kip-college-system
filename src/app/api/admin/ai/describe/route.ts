import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { requireAdmin, HttpError } from '@/lib/auth'

/**
 * POST /api/admin/ai/describe — AI marketing copy generator.
 * Generates Kenyan-market product descriptions for inventory staff.
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const { name, category, level, subject, brand, price } = await req.json()
    if (!name) return NextResponse.json({ error: 'Product name required' }, { status: 400 })

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `You write short, punchy e-commerce product descriptions for KIPS Kitui, a bookstore & stationery shop in Kitui, Kenya. Write ONE description of 35-60 words for:
Product: ${name}
Category: ${category || 'general'}
Level: ${level || 'any'}
Subject: ${subject || 'general'}
Brand/Publisher: ${brand || 'assorted'}
Price: KES ${price ?? 'TBD'}

Mention practical benefits for Kenyan students/teachers/parents where relevant (CBC, KCSE, exams, durability). Warm, confident tone. Output ONLY the description text, no quotes, no title.`,
        },
      ],
      thinking: { type: 'disabled' },
    })
    const description = (completion.choices[0]?.message?.content || '').trim().replace(/^["']|["']$/g, '')
    return NextResponse.json({ description })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ error: 'AI generator unavailable, try again' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
