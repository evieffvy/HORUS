'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts'
import { CVEItem } from '../types/cve'

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
    <div className="bg-[#0a1929] border border-border rounded-lg p-3 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-white font-medium">
          {p.name}: <span className="text-blue-300">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

function getSeverityDistribution(cves: CVEItem[]) {
  const counts: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    NONE: 0,
    UNKNOWN: 0,
  }
  cves.forEach((c) => counts[c.severity]++)
  return Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))
}

function getTimelineData(cves: CVEItem[]) {
  const now = new Date()
  const days: Record<string, { date: string; CRITICAL: number; HIGH: number; MEDIUM: number; LOW: number }> = {}

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })
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
  const distData = getSeverityDistribution(cves)
  const timelineData = getTimelineData(cves)

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Severity Distribution */}
      <div className="card p-4 flex-1">
        <h3 className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
          การกระจาย Severity
        </h3>
        {cves.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-slate-600 text-xs">
            ยังไม่มีข้อมูล
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={distData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} name="จำนวน">
                {distData.map((entry) => (
                  <Cell key={entry.name} fill={SEV_COLORS[entry.name]} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Timeline (7 days) */}
      <div className="card p-4 flex-1">
        <h3 className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
          CVE 7 วันล่าสุด
        </h3>
        {cves.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-slate-600 text-xs">
            ยังไม่มีข้อมูล
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={timelineData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#64748b', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
                formatter={(v) => <span className="text-slate-400">{v}</span>}
              />
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
          { label: 'Critical', key: 'CRITICAL', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'High', key: 'HIGH', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
          { label: 'Medium', key: 'MEDIUM', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
          { label: 'Low', key: 'LOW', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
        ].map(({ label, key, color, bg }) => {
          const count = cves.filter((c) => c.severity === key).length
          return (
            <div key={key} className={`card border ${bg} px-3 py-2 flex items-center justify-between`}>
              <span className="text-xs text-slate-400">{label}</span>
              <span className={`text-lg font-bold font-mono ${color}`}>{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
