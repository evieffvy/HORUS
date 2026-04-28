'use client'

import { CVEFilter } from '../types/cve'

interface Props {
  filter: CVEFilter
  onChange: (f: CVEFilter) => void
  onSearch: () => void
  loading: boolean
}

const SEVERITIES = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

export default function FilterBar({ filter, onChange, onSearch, loading }: Props) {
  const set = (key: keyof CVEFilter, val: string) =>
    onChange({ ...filter, [key]: val })

  return (
    <div className="card p-4">
      <div className="flex flex-wrap gap-3 items-end">
        {/* Keyword */}
        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
          <label className="text-xs text-slate-400 font-medium">ค้นหาคำสำคัญ</label>
          <input
            className="input"
            placeholder="Apache, Log4j, RCE..."
            value={filter.keyword}
            onChange={(e) => set('keyword', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
        </div>

        {/* Severity */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400 font-medium">ความรุนแรง</label>
          <select
            className="input pr-8"
            value={filter.severity}
            onChange={(e) => set('severity', e.target.value)}
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* CVSS Range */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400 font-medium">CVSS Score</label>
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
            <span className="text-slate-500 text-sm">–</span>
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
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400 font-medium">วันที่เผยแพร่</label>
          <div className="flex items-center gap-2">
            <input
              className="input"
              type="date"
              value={filter.startDate}
              onChange={(e) => set('startDate', e.target.value)}
            />
            <span className="text-slate-500 text-sm">–</span>
            <input
              className="input"
              type="date"
              value={filter.endDate}
              onChange={(e) => set('endDate', e.target.value)}
            />
          </div>
        </div>

        {/* Search Button */}
        <button
          className="btn-primary flex items-center gap-2 self-end"
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
          ค้นหา
        </button>

        {/* Reset */}
        <button
          className="btn-ghost self-end"
          onClick={() =>
            onChange({ keyword: '', severity: 'ALL', startDate: '', endDate: '', minScore: '', maxScore: '' })
          }
        >
          รีเซ็ต
        </button>
      </div>
    </div>
  )
}
