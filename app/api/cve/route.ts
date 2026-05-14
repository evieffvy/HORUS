import { NextRequest, NextResponse } from 'next/server'
import { fetchNVDCves } from '@/app/lib/nvd'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams

  const minScore = sp.get('minScore') ? parseFloat(sp.get('minScore')!) : null
  const maxScore = sp.get('maxScore') ? parseFloat(sp.get('maxScore')!) : null

  try {
    const PAGE_SIZE = 20
    const page = Number(sp.get('page') ?? 0)
    const result = await fetchNVDCves({
      keyword: sp.get('keyword') || undefined,
      startDate: sp.get('startDate') || undefined,
      endDate: sp.get('endDate') || undefined,
      severity: sp.get('severity') || undefined,
      resultsPerPage: PAGE_SIZE,
      startIndex: page * PAGE_SIZE,
      apiKey: process.env.NVD_API_KEY,
    })

    let cves = result.cves
    if (minScore !== null || maxScore !== null) {
      cves = cves.filter((cve) => {
        if (cve.cvssScore === null) return false
        if (minScore !== null && cve.cvssScore < minScore) return false
        if (maxScore !== null && cve.cvssScore > maxScore) return false
        return true
      })
    }

    const hasScoreFilter = minScore !== null || maxScore !== null
    return NextResponse.json({
      cves,
      total: hasScoreFilter ? cves.length : result.total,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('[CVE API]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
