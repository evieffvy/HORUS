'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import FilterBar from './components/FilterBar'
import CVETable from './components/CVETable'
import SeverityChart from './components/SeverityChart'
import CVEModal from './components/CVEModal'
import ChatPanel from './components/ChatPanel'
import { CVEFilter, CVEItem } from './types/cve'
import { useLang } from './context/LanguageContext'
import { t } from './lib/translations'

const DEFAULT_FILTER: CVEFilter = {
  keyword: '',
  severity: 'ALL',
  startDate: '',
  endDate: '',
  minScore: '',
  maxScore: '',
}

const POLL_INTERVAL = 5 * 60 * 1000

export default function Page() {
  const { lang, setLang } = useLang()
  const tr = t[lang]

  const [filter, setFilter] = useState<CVEFilter>(DEFAULT_FILTER)
  const [cves, setCves] = useState<CVEItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [selectedCVE, setSelectedCVE] = useState<CVEItem | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const filterRef = useRef(filter)
  filterRef.current = filter

  const fetchCVEs = useCallback(async (f: CVEFilter, p: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (f.keyword) params.set('keyword', f.keyword)
      if (f.severity !== 'ALL') params.set('severity', f.severity)
      if (f.startDate) params.set('startDate', f.startDate)
      if (f.endDate) params.set('endDate', f.endDate)
      if (f.minScore) params.set('minScore', f.minScore)
      if (f.maxScore) params.set('maxScore', f.maxScore)
      params.set('page', String(p))

      const res = await fetch(`/api/cve?${params}`)
      const data = await res.json()
      setCves(data.cves ?? [])
      setTotal(data.total ?? 0)
      setLastUpdated(new Date())
    } catch {
      // retain previous data on error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCVEs(filter, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const id = setInterval(() => fetchCVEs(filterRef.current, page), POLL_INTERVAL)
    return () => clearInterval(id)
  }, [fetchCVEs, page])

  const handleSearch = () => {
    setPage(0)
    fetchCVEs(filter, 0)
  }

  const handlePageChange = (p: number) => {
    setPage(p)
    fetchCVEs(filter, p)
  }

  const criticalCount = cves.filter((c) => c.severity === 'CRITICAL').length
  const highCount = cves.filter((c) => c.severity === 'HIGH').length
  const locale = lang === 'th' ? 'th-TH' : 'en-US'

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 header-accent" style={{ background: 'rgba(10,18,32,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1a2d4d' }}>
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.7), rgba(139,92,246,0.5), transparent)' }} />

        <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)', boxShadow: '0 2px 12px rgba(79,70,229,0.35)' }}>
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="leading-none">
              <div className="text-sm font-bold text-slate-100 tracking-tight">Threat Intel</div>
              <div className="text-[10px] text-slate-500 mt-0.5">AI-Powered Dashboard</div>
            </div>
          </div>

          {/* Live badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
            <span className="text-[10px] text-green-400 font-semibold tracking-wide">{tr.live}</span>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-border flex-shrink-0" />

          {/* Stats */}
          <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto">
            <div className="stat-badge flex-shrink-0">
              <svg className="w-3 h-3 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              <span className="text-slate-500 flex-shrink-0">{tr.totalCVEs}</span>
              <span className="font-mono text-slate-100 font-bold">{total.toLocaleString()}</span>
            </div>

            {criticalCount > 0 && (
              <div className="stat-badge flex-shrink-0" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
                <span className="text-red-400 font-bold font-mono">{criticalCount}</span>
                <span className="text-red-400/60 text-[10px] uppercase tracking-wide">Critical</span>
              </div>
            )}

            {highCount > 0 && (
              <div className="stat-badge flex-shrink-0" style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                <span className="text-orange-400 font-mono">{highCount}</span>
                <span className="text-orange-400/60 text-[10px] uppercase tracking-wide">High</span>
              </div>
            )}

            {lastUpdated && (
              <div className="stat-badge flex-shrink-0">
                <svg className="w-3 h-3 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className="text-slate-600">
                  {tr.updatedAt(lastUpdated.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }))}
                </span>
              </div>
            )}
          </div>

          {/* Language Toggle */}
          <div className="lang-toggle flex-shrink-0">
            <button
              className={`lang-btn ${lang === 'en' ? 'lang-btn-active' : 'lang-btn-inactive'}`}
              onClick={() => setLang('en')}
            >
              EN
            </button>
            <button
              className={`lang-btn ${lang === 'th' ? 'lang-btn-active' : 'lang-btn-inactive'}`}
              onClick={() => setLang('th')}
            >
              TH
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-6 py-4 flex flex-col gap-4 pb-20">
        <FilterBar
          filter={filter}
          onChange={setFilter}
          onSearch={handleSearch}
          loading={loading}
        />

        <div className="flex gap-4 flex-1 min-h-0" style={{ height: 'calc(100vh - 220px)' }}>
          <div className="flex-1 min-w-0">
            <CVETable
              cves={cves}
              loading={loading}
              onSelect={setSelectedCVE}
              page={page}
              total={total}
              onPageChange={handlePageChange}
            />
          </div>

          <div className="w-72 flex-shrink-0">
            <SeverityChart cves={cves} />
          </div>
        </div>
      </main>

      <CVEModal cve={selectedCVE} onClose={() => setSelectedCVE(null)} />
      <ChatPanel selectedCVE={selectedCVE} />
    </div>
  )
}
