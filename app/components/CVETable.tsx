'use client'

import { CVEItem } from '../types/cve'
import { useLang } from '../context/LanguageContext'
import { t } from '../lib/translations'

interface Props {
  cves: CVEItem[]
  loading: boolean
  onSelect: (cve: CVEItem) => void
  page: number
  total: number
  onPageChange: (p: number) => void
}

const PAGE_SIZE = 20

const SCOLOR: Record<string, string> = {
  CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/30',
  HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  MEDIUM: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  LOW: 'text-green-400 bg-green-500/10 border-green-500/30',
  NONE: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
  UNKNOWN: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
}

const SCORE_COLOR: Record<string, string> = {
  CRITICAL: 'text-red-400 font-bold',
  HIGH: 'text-orange-400 font-semibold',
  MEDIUM: 'text-yellow-400',
  LOW: 'text-green-400',
  NONE: 'text-gray-400',
  UNKNOWN: 'text-gray-500',
}

const ROW_ACCENT: Record<string, string> = {
  CRITICAL: 'row-critical',
  HIGH: 'row-high',
  MEDIUM: 'row-medium',
  LOW: 'row-low',
  NONE: '',
  UNKNOWN: '',
}

export default function CVETable({ cves, loading, onSelect, page, total, onPageChange }: Props) {
  const { lang } = useLang()
  const tr = t[lang].table
  const locale = lang === 'th' ? 'th-TH' : 'en-US'
  const totalPages = Math.ceil(total / PAGE_SIZE)

  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="card flex flex-col h-full overflow-hidden">
      {/* Table header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          CVE Feed
        </h2>
        <span className="text-xs text-slate-500 tabular-nums">
          {loading ? tr.loading : tr.found(total)}
        </span>
      </div>

      <div className="overflow-auto flex-1">
        {loading && cves.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-500 text-sm">
            <svg className="animate-spin w-6 h-6 text-blue-500/60" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            {tr.loadingNVD}
          </div>
        ) : cves.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-slate-500 text-sm">
            <svg className="w-8 h-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            {tr.noResults}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10" style={{ background: 'var(--surface)' }}>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2.5 text-[11px] text-slate-500 font-semibold uppercase tracking-wider w-36">{tr.colID}</th>
                <th className="text-center px-2 py-2.5 text-[11px] text-slate-500 font-semibold uppercase tracking-wider w-20">{tr.colScore}</th>
                <th className="text-center px-2 py-2.5 text-[11px] text-slate-500 font-semibold uppercase tracking-wider w-24">{tr.colSeverity}</th>
                <th className="text-left px-2 py-2.5 text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{tr.colDescription}</th>
                <th className="text-left px-2 py-2.5 text-[11px] text-slate-500 font-semibold uppercase tracking-wider w-28">{tr.colVendor}</th>
                <th className="text-left px-2 py-2.5 text-[11px] text-slate-500 font-semibold uppercase tracking-wider w-28">{tr.colDate}</th>
              </tr>
            </thead>
            <tbody>
              {cves.map((cve, i) => (
                <tr
                  key={cve.id}
                  className={`border-b border-border/40 cursor-pointer transition-all duration-100 hover:bg-blue-500/5 group ${ROW_ACCENT[cve.severity]} ${i % 2 === 0 ? '' : 'bg-white/[0.008]'}`}
                  onClick={() => onSelect(cve)}
                >
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-xs text-blue-400 group-hover:text-blue-300 transition-colors">
                      {cve.id}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    <span className={`font-mono text-sm tabular-nums ${SCORE_COLOR[cve.severity]}`}>
                      {cve.cvssScore?.toFixed(1) ?? 'N/A'}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded border ${SCOLOR[cve.severity]}`}>
                      {cve.severity}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 max-w-xs">
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed group-hover:text-slate-300 transition-colors">
                      {cve.description}
                    </p>
                  </td>
                  <td className="px-2 py-2.5">
                    <span className="text-xs text-slate-500 truncate block max-w-[100px]">
                      {cve.vendor || '—'}
                    </span>
                  </td>
                  <td className="px-2 py-2.5">
                    <span className="text-xs text-slate-600 tabular-nums">{fmtDate(cve.publishedDate)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-surface/50">
          <button
            className="btn-ghost py-1 px-3 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={page === 0 || loading}
            onClick={() => onPageChange(page - 1)}
          >
            {tr.prev}
          </button>
          <span className="text-xs text-slate-500 tabular-nums">
            {tr.page(page + 1, totalPages)}
          </span>
          <button
            className="btn-ghost py-1 px-3 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => onPageChange(page + 1)}
          >
            {tr.next}
          </button>
        </div>
      )}
    </div>
  )
}
