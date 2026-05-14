'use client'

import { CVEFilter } from '../types/cve'
import { useLang } from '../context/LanguageContext'
import { t } from '../lib/translations'

interface Props {
  filter: CVEFilter
  onChange: (f: CVEFilter) => void
  onSearch: () => void
  loading: boolean
}

const SEVERITIES = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

export default function FilterBar({ filter, onChange, onSearch, loading }: Props) {
  const { lang } = useLang()
  const tr = t[lang].filter
  const set = (key: keyof CVEFilter, val: string) => onChange({ ...filter, [key]: val })

  return (
    <div className="card p-4">
      <div className="flex flex-wrap gap-3 items-end">
        {/* Keyword */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
          <label className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <svg className="w-3 h-3 text-blue-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            {tr.keyword}
          </label>
          <input
            className="input"
            placeholder={tr.keywordPlaceholder}
            value={filter.keyword}
            onChange={(e) => set('keyword', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
        </div>

        {/* Severity */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <svg className="w-3 h-3 text-orange-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            {tr.severity}
          </label>
          <select
            className="input pr-8 appearance-none cursor-pointer"
            value={filter.severity}
            onChange={(e) => set('severity', e.target.value)}
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* CVSS Range */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <svg className="w-3 h-3 text-purple-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            {tr.cvssScore}
          </label>
          <div className="flex items-center gap-2">
            <input
              className="input w-16 text-center"
              type="number"
              min="0"
              max="10"
              step="0.1"
              placeholder="0"
              value={filter.minScore}
              onChange={(e) => set('minScore', e.target.value)}
            />
            <span className="text-slate-600 text-xs font-mono">–</span>
            <input
              className="input w-16 text-center"
              type="number"
              min="0"
              max="10"
              step="0.1"
              placeholder="10"
              value={filter.maxScore}
              onChange={(e) => set('maxScore', e.target.value)}
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <svg className="w-3 h-3 text-teal-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            {tr.dateRange}
          </label>
          <div className="flex items-center gap-2">
            <input
              className="input"
              type="date"
              value={filter.startDate}
              onChange={(e) => set('startDate', e.target.value)}
            />
            <span className="text-slate-600 text-xs font-mono">–</span>
            <input
              className="input"
              type="date"
              value={filter.endDate}
              onChange={(e) => set('endDate', e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 self-end">
          <button
            className="btn-primary flex items-center gap-2"
            onClick={onSearch}
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            )}
            {tr.search}
          </button>
          <button
            className="btn-ghost"
            onClick={() => onChange({ keyword: '', severity: 'ALL', startDate: '', endDate: '', minScore: '', maxScore: '' })}
          >
            {tr.reset}
          </button>
        </div>
      </div>
    </div>
  )
}
