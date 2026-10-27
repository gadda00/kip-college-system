import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'

/**
 * GET /api/recommendations?context=<cart|recent>&ids=a,b,c
 * Hybrid recommender: content-based candidates + LLM ranking with reasoning.
 */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const contextIds = (sp.get('ids') || '').split(',').filter(Boolean)
    const limit = Math.min(parseInt(sp.get('limit') || '4'), 8)

    // Context products (cart / viewed)
    const contextProducts = contextIds.length
      ? await db.product.findMany({ where: { id: { in: contextIds }, isActive: true } })
      : []

    // Candidate pool: same categories/subjects/levels as context, else bestsellers
    let candidates: any[] = []
    if (contextProducts.length) {
      const catIds = [...new Set(contextProducts.map((p) => p.categoryId))]
      const levels = [...new Set(contextProducts.map((p) => p.level).filter(Boolean))]
      candidates = await db.product.findMany({
        where: {
          isActive: true,
          id: { notIn: contextIds },
          OR: [...catIds.map((categoryId) => ({ categoryId })), ...levels.map((level) => ({ level }))],
        },
        orderBy: [{ sold: 'desc' }],
        take: 24,
      })
    }
    if (candidates.length < limit) {
      const extra = await db.product.findMany({
        where: { isActive: true, id: { notIn: [...contextIds, ...candidates.map((c) => c.id)] } },
        orderBy: [{ sold: 'desc' }],
        take: limit * 3,
      })
      candidates = [...candidates, ...extra]
    }
    candidates = candidates.slice(0, 16)

    const contextSummary = contextProducts.map((p) => p.name).join('; ') || 'general back-to-school shopping'
    const candidateSummary = candidates
      .map((c, i) => `${i + 1}. ${c.name} | KES ${c.price} | ${c.category?.name ?? ''} | level:${c.level ?? 'any'} | subject:${c.subject ?? 'any'} | rating:${c.rating} | sold:${c.sold}`)
      .join('\n')

    let picks: number[] = candidates.slice(0, limit).map((_, i) => i)
    let reason = 'Popular with other shoppers right now'

    try {
      const zai = await ZAI.create()
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: `You are a product recommendation engine for KIPS Kitui bookstore in Kenya. The customer is interested in: ${contextSummary}.\n\nAvailable products:\n${candidateSummary}\n\nPick the ${limit} most relevant products for this customer. Respond ONLY with compact JSON: {"picks":[numbers],"reason":"one warm sentence (max 18 words) explaining the selection"}`,
          },
        ],
        thinking: { type: 'disabled' },
      })
      const raw = (completion.choices[0]?.message?.content || '').trim().replace(/```json|```/g, '')
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed.picks)) {
        const valid = parsed.picks.filter((n: any) => typeof n === 'number' && n >= 1 && n <= candidates.length).map((n: number) => n - 1)
        if (valid.length >= 2) picks = valid.slice(0, limit)
      }
      if (parsed.reason && typeof parsed.reason === 'string') reason = parsed.reason.slice(0, 140)
    } catch {
      // fallback to content-based picks above
    }

    const products = picks.map((i) => candidates[i]).filter(Boolean)
    return NextResponse.json({ products, reason })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ products: [], reason: '' })
  }
}
