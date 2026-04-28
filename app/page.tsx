'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import FilterBar from './components/FilterBar'
import CVETable from './components/CVETable'
import SeverityChart from './components/SeverityChart'
import CVEModal from './components/CVEModal'
import ChatPanel from './components/ChatPanel'
import { CVEFilter, CVEItem } from './types/cve'

const DEFAULT_FILTER: CVEFilter = {
  keyword: '',
  severity: 'ALL',
  startDate: '',
  endDate: '',
  minScore: '',
  maxScore: '',
}

const POLL_INTERVAL = 5 * 60 * 1000 // 5 minutes

export default function Page() {
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

  // Initial load
  useEffect(() => {
    fetchCVEs(filter, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Polling
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="pulse-dot w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs text-green-400 font-medium">LIVE</span>
            </div>
            <h1 className="text-base font-semibold text-slate-200 tracking-tight">
              AI Threat Intel Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Total CVEs:</span>
              <span className="font-mono text-slate-200 font-semibold">{total.toLocaleString()}</span>
            </div>
            {criticalCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-red-400 font-semibold font-mono">{criticalCount} CRITICAL</span>
              </div>
            )}
            {highCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-orange-400 font-mono">{highCount} HIGH</span>
              </div>
            )}
            {lastUpdated && (
              <span className="text-slate-600">
                อัปเดต {lastUpdated.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
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
          {/* CVE Table — takes most of the space */}
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

          {/* Charts sidebar */}
          <div className="w-72 flex-shrink-0">
            <SeverityChart cves={cves} />
          </div>
        </div>
      </main>

      {/* CVE Detail Modal */}
      <CVEModal cve={selectedCVE} onClose={() => setSelectedCVE(null)} />

      {/* AI Chat Panel */}
      <ChatPanel selectedCVE={selectedCVE} />
    </div>
  )
}
