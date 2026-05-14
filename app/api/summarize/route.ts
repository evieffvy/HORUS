import { NextRequest, NextResponse } from 'next/server'
import { getCVESummary } from '@/app/lib/ai'
import { CVEItem } from '@/app/types/cve'

export async function POST(req: NextRequest) {
  try {
    const { lang, ...cve }: CVEItem & { lang?: 'en' | 'th' } = await req.json()
    const summary = await getCVESummary(cve, lang ?? 'th')
    return NextResponse.json({ summary })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to summarize'
    console.error('[Summarize]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
