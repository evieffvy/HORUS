'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, Legend,
} from 'recharts'
import { CVEItem } from '../types/cve'
import { useLang } from '../context/LanguageContext'
import { t } from '../lib/translations'

interface Props {
  cves: CVEItem[]
}

const SEV_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
  NONE: '#6b7280',
  UNKNOWN: '#4b5563',
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { value: number; name: string }[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg p-3 text-xs shadow-2xl" style={{ background: 'rgba(6,13,26,0.95)', border: '1px solid var(--border-bright)' }}>
      <p className="text-slate-400 mb-1 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-white">
          {p.name}: <span className="text-blue-300 font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

function getSeverityDistribution(cves: CVEItem[]) {
  const counts: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, NONE: 0, UNKNOWN: 0 }
  cves.forEach((c) => counts[c.severity]++)
  return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }))
}

function getTimelineData(cves: CVEItem[], locale: string) {
  const now = new Date()
  const days: Record<string, { date: string; CRITICAL: number; HIGH: number; MEDIUM: number; LOW: number }> = {}

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
    days[key] = { date: label, CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
  }

  cves.forEach((cve) => {
    const day = cve.publishedDate.slice(0, 10)
    if (days[day] && ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(cve.severity)) {
      days[day][cve.severity as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW']++
    }
  })

  return Object.values(days)
}

export default function SeverityChart({ cves }: Props) {
  const { lang } = useLang()
  const tr = t[lang].chart
  const trStats = t[lang].stats
  const locale = lang === 'th' ? 'th-TH' : 'en-US'

  const distData = getSeverityDistribution(cves)
  const timelineData = getTimelineData(cves, locale)

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Severity Distribution */}
      <div className="card p-4 flex-1">
        <h3 className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400 inline-block flex-shrink-0" />
          {tr.distribution}
        </h3>
        {cves.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-slate-600 text-xs">{tr.noData}</div>
        ) : (
          <ResponsiveContainer width="100%" height={175}>
            <BarChart data={distData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} name={tr.count}>
                {distData.map((entry) => (
                  <Cell key={entry.name} fill={SEV_COLORS[entry.name]} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Timeline */}
      <div className="card p-4 flex-1">
        <h3 className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400 inline-block flex-shrink-0" />
          {tr.timeline}
        </h3>
        {cves.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-slate-600 text-xs">{tr.noData}</div>
        ) : (
          <ResponsiveContainer width="100%" height={175}>
            <LineChart data={timelineData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} formatter={(v) => <span className="text-slate-400">{v}</span>} />
              <Line type="monotone" dataKey="CRITICAL" stroke="#ef4444" strokeWidth={1.5} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="HIGH" stroke="#f97316" strokeWidth={1.5} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="MEDIUM" stroke="#eab308" strokeWidth={1.5} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="LOW" stroke="#22c55e" strokeWidth={1.5} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: trStats.critical, key: 'CRITICAL', color: 'text-red-400', style: { background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' } },
          { label: trStats.high,     key: 'HIGH',     color: 'text-orange-400', style: { background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)' } },
          { label: trStats.medium,   key: 'MEDIUM',   color: 'text-yellow-400', style: { background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)' } },
          { label: trStats.low,      key: 'LOW',      color: 'text-green-400', style: { background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' } },
        ].map(({ label, key, color, style }) => {
          const count = cves.filter((c) => c.severity === key).length
          return (
            <div key={key} className="rounded-lg px-3 py-2 flex items-center justify-between" style={style}>
              <span className="text-xs text-slate-400">{label}</span>
              <span className={`text-lg font-bold font-mono tabular-nums ${color}`}>{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
