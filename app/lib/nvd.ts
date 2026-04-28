import { CVEItem } from '../types/cve'

const NVD_BASE = 'https://services.nvd.nist.gov/rest/json/cves/2.0'

interface RawCPEMatch {
  criteria: string
}
interface RawNode {
  cpeMatch?: RawCPEMatch[]
}
interface RawConfig {
  nodes?: RawNode[]
}
interface RawVuln {
  cve: {
    id: string
    published: string
    lastModified: string
    descriptions: { lang: string; value: string }[]
    metrics?: {
      cvssMetricV31?: { cvssData: { baseScore: number } }[]
      cvssMetricV30?: { cvssData: { baseScore: number } }[]
      cvssMetricV2?: { cvssData: { baseScore: number } }[]
    }
    weaknesses?: { description: { value: string }[] }[]
    configurations?: RawConfig[]
    references?: { url: string }[]
  }
}

export function scoreToSeverity(score: number | null): CVEItem['severity'] {
  if (score === null) return 'UNKNOWN'
  if (score >= 9.0) return 'CRITICAL'
  if (score >= 7.0) return 'HIGH'
  if (score >= 4.0) return 'MEDIUM'
  if (score > 0) return 'LOW'
  return 'NONE'
}

export async function fetchNVDCves(params: {
  keyword?: string
  startDate?: string
  endDate?: string
  severity?: string
  resultsPerPage?: number
  startIndex?: number
  apiKey?: string
}): Promise<{ cves: CVEItem[]; total: number }> {
  const url = new URL(NVD_BASE)

  if (params.keyword) url.searchParams.set('keywordSearch', params.keyword)
  if (params.startDate)
    url.searchParams.set('pubStartDate', `${params.startDate}T00:00:00.000`)
  if (params.endDate)
    url.searchParams.set('pubEndDate', `${params.endDate}T23:59:59.999`)
  if (params.severity && params.severity !== 'ALL')
    url.searchParams.set('cvssV3Severity', params.severity)

  url.searchParams.set('resultsPerPage', String(params.resultsPerPage ?? 20))
  url.searchParams.set('startIndex', String(params.startIndex ?? 0))

  const headers: Record<string, string> = {
    'User-Agent': 'ThreatIntelDashboard/1.0',
  }
  if (params.apiKey) headers['apiKey'] = params.apiKey

  const res = await fetch(url.toString(), {
    headers,
    next: { revalidate: 300 },
  })

  if (res.status === 404) {
    return { cves: [], total: 0 }
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`NVD API ${res.status}: ${text.slice(0, 200)}`)
  }

  const data = await res.json()

  const cves: CVEItem[] = (data.vulnerabilities ?? []).map((v: RawVuln) => {
    const cve = v.cve
    const desc =
      cve.descriptions.find((d) => d.lang === 'en')?.value ??
      'No description available.'

    let score: number | null = null
    let version: CVEItem['cvssVersion'] = 'N/A'
    const m = cve.metrics
    if (m?.cvssMetricV31?.[0]?.cvssData?.baseScore != null) {
      score = m.cvssMetricV31[0].cvssData.baseScore
      version = '3.1'
    } else if (m?.cvssMetricV30?.[0]?.cvssData?.baseScore != null) {
      score = m.cvssMetricV30[0].cvssData.baseScore
      version = '3.0'
    } else if (m?.cvssMetricV2?.[0]?.cvssData?.baseScore != null) {
      score = m.cvssMetricV2[0].cvssData.baseScore
      version = '2.0'
    }

    const cweId = cve.weaknesses?.[0]?.description?.[0]?.value

    let vendor = ''
    let product = ''
    outer: for (const cfg of cve.configurations ?? []) {
      for (const node of cfg.nodes ?? []) {
        const cpe = node.cpeMatch?.[0]?.criteria
        if (cpe) {
          const parts = cpe.split(':')
          vendor = parts[3] ?? ''
          product = parts[4] ?? ''
          break outer
        }
      }
    }

    return {
      id: cve.id,
      description: desc,
      cvssScore: score,
      cvssVersion: version,
      severity: scoreToSeverity(score),
      publishedDate: cve.published,
      lastModifiedDate: cve.lastModified,
      vendor: vendor || undefined,
      product: product || undefined,
      references: (cve.references ?? []).slice(0, 5).map((r) => r.url),
      cweId: cweId || undefined,
    } satisfies CVEItem
  })

  return { cves, total: data.totalResults ?? 0 }
}
