import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'

/**
 * POST /api/chat — KIPS Kitui AI Shopping Assistant.
 * Grounded with live store data (opening hours, delivery, top products, orders).
 */
export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 })
    }

    // Ground the assistant with live catalog data
    const [topProducts, categoryCount, orderCount] = await Promise.all([
      db.product.findMany({
        where: { isActive: true },
        orderBy: { sold: 'desc' },
        take: 12,
        select: { name: true, price: true, stock: true, level: true, subject: true, category: { select: { name: true } } },
      }),
      db.category.count(),
      db.order.count(),
    ])

    const catalogSummary = topProducts
      .map((p) => `- ${p.name} (KES ${p.price}, ${p.category.name}${p.level ? `, ${p.level}` : ''}, stock: ${p.stock})`)
      .join('\n')

    const systemPrompt = `You are "Kip", the friendly AI shopping assistant for KIPS Kitui — a leading bookstore, stationery and printing shop in Kitui town, Kenya (est. branch of the famous KIPS Kenya brand).

STORE FACTS:
- Location: Kitui Town CBD, opposite the main matatu stage, KIPS Building
- Hours: Mon–Sat 7:30am–6:30pm, Sun 2pm–5pm
- Phone: +254 700 111 222 | WhatsApp available
- Delivery: Kitui Town KES 100 (same day), Kitui County KES 250, Mwingi KES 300, other towns KES 400 by courier. FREE delivery on orders above KES 3,000!
- Payments: M-Pesa (STK push at checkout), Cash on Delivery, cards in store
- Services: photocopying (B/W KES 10/page A4, colour KES 50), printing, scanning, spiral & hard-cover binding, laminating
- Bulk orders: schools get 5% discount and teacher reference copies for 50+ copies
- Loyalty: 1 point per KES 100 spent, points redeem as shillings
- We stock ${categoryCount} categories; the shop has served ${orderCount}+ online orders

TOP SELLING PRODUCTS RIGHT NOW:
${catalogSummary}

YOUR JOB:
- Help customers find the right books/materials for their level (CBC PP1–Grade 9, Secondary Forms 1–4, college)
- Advise on printing options and estimate costs
- Explain delivery, payments, bulk/school orders and loyalty
- Be warm, concise and practical. Use Kenyan context (KCSE/KCPE, set books, M-Pesa, matatu stages)
- Prices in Kenyan Shillings (KES)
- If asked about something you don't know, suggest visiting or calling the shop
- Keep replies short (under 120 words) unless the customer asks for a list`

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        ...messages.slice(-12).map((m: any) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: String(m.content).slice(0, 2000) })),
      ],
      thinking: { type: 'disabled' },
    })

    const reply = completion.choices[0]?.message?.content || 'Sorry, I did not get that. Please try again.'
    return NextResponse.json({ reply })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Assistant unavailable right now. Please try again.' }, { status: 500 })
  }
}
