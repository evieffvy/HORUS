'use client'

import { useEffect, useState } from 'react'
import { CVEItem } from '../types/cve'
import { useLang } from '../context/LanguageContext'
import { t } from '../lib/translations'

interface Props {
  cve: CVEItem | null
  onClose: () => void
}

const SCOLOR: Record<string, string> = {
  CRITICAL: 'text-red-400 bg-red-500/20 border-red-500/40',
  HIGH: 'text-orange-400 bg-orange-500/20 border-orange-500/40',
  MEDIUM: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40',
  LOW: 'text-green-400 bg-green-500/20 border-green-500/40',
  NONE: 'text-gray-400 bg-gray-500/20 border-gray-500/40',
  UNKNOWN: 'text-gray-400 bg-gray-500/20 border-gray-500/40',
}

const SCORE_BAR: Record<string, string> = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-green-500',
  NONE: 'bg-gray-500',
  UNKNOWN: 'bg-gray-600',
}

const SCORE_TEXT: Record<string, string> = {
  CRITICAL: 'text-red-400',
  HIGH: 'text-orange-400',
  MEDIUM: 'text-yellow-400',
  LOW: 'text-green-400',
  NONE: 'text-gray-400',
  UNKNOWN: 'text-gray-500',
}

async function exportPDF(cve: CVEItem, summary: string, lang: string) {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  doc.setFillColor(8, 14, 26)
  doc.rect(0, 0, 210, 40, 'F')
  doc.setTextColor(226, 232, 240)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('CVE Security Report', 15, 18)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text(`Generated: ${new Date().toISOString()}`, 15, 27)
  doc.text('AI-Powered Threat Intelligence Dashboard', 15, 33)

  const scoreColor = {
    CRITICAL: [239, 68, 68],
    HIGH: [249, 115, 22],
    MEDIUM: [234, 179, 8],
    LOW: [34, 197, 94],
    NONE: [107, 114, 128],
    UNKNOWN: [107, 114, 128],
  }[cve.severity] as [number, number, number]

  const locale = lang === 'th' ? 'th-TH' : 'en-US'
  const fmtDate = (d: string) => new Date(d).toLocaleString(locale, {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  autoTable(doc, {
    startY: 48,
    head: [['Field', 'Value']],
    body: [
      ['CVE ID', cve.id],
      ['CVSS Score', `${cve.cvssScore?.toFixed(1) ?? 'N/A'} (v${cve.cvssVersion})`],
      ['Severity', cve.severity],
      ['Vendor', cve.vendor ?? 'N/A'],
      ['Product', cve.product ?? 'N/A'],
      ['CWE', cve.cweId ?? 'N/A'],
      ['Published', fmtDate(cve.publishedDate)],
      ['Last Modified', fmtDate(cve.lastModifiedDate)],
    ],
    headStyles: { fillColor: [13, 21, 38], textColor: [100, 116, 139], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [10, 16, 30] },
    bodyStyles: { fillColor: [8, 14, 26], textColor: [226, 232, 240] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40, textColor: [148, 163, 184] },
      1: { textColor: [226, 232, 240] },
    },
  })

  const y1 = (doc as any).lastAutoTable.finalY + 10

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(226, 232, 240)
  doc.text('Description', 15, y1)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184)
  const descLines = doc.splitTextToSize(cve.description, 180)
  doc.text(descLines, 15, y1 + 7)

  const y2 = y1 + 10 + descLines.length * 4

  if (summary) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(96, 165, 250)
    doc.text(`AI Summary`, 15, y2 + 5)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(148, 163, 184)
    const sumLines = doc.splitTextToSize(summary, 180)
    doc.text(sumLines, 15, y2 + 13)
  }

  doc.setFillColor(...scoreColor)
  doc.rect(190, 48, 5, (doc as any).lastAutoTable.finalY - 48, 'F')

  doc.save(`${cve.id}-report.pdf`)
}

export default function CVEModal({ cve, onClose }: Props) {
  const { lang } = useLang()
  const tr = t[lang].modal
  const locale = lang === 'th' ? 'th-TH' : 'en-US'

  const [summary, setSummary] = useState('')
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [exportingPDF, setExportingPDF] = useState(false)

  function fmtDate(d: string) {
    return new Date(d).toLocaleString(locale, {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  useEffect(() => {
    if (!cve) { setSummary(''); return }
    setLoadingSummary(true)
    setSummary('')
    fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...cve, lang }),
    })
      .then((r) => r.json())
      .then((d) => setSummary(d.summary ?? d.error ?? ''))
      .catch(() => setSummary(tr.noSummary))
      .finally(() => setLoadingSummary(false))
  }, [cve]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!cve) return null

  const handleExport = async () => {
    setExportingPDF(true)
    try { await exportPDF(cve, summary, lang) }
    finally { setExportingPDF(false) }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(4,9,18,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-bright)', boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top severity accent */}
        <div className={`h-1 w-full ${SCORE_BAR[cve.severity]} rounded-t-2xl`} />

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-mono text-blue-400 font-bold text-lg tracking-tight">{cve.id}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {tr.published}: {fmtDate(cve.publishedDate)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className={`text-3xl font-bold font-mono tabular-nums ${SCORE_TEXT[cve.severity]}`}>
                {cve.cvssScore?.toFixed(1) ?? 'N/A'}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded border ${SCOLOR[cve.severity]}`}>
                {cve.severity}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg ml-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Score bar */}
        <div className="h-0.5 w-full bg-border/50">
          <div
            className={`h-full transition-all ${SCORE_BAR[cve.severity]}`}
            style={{ width: `${((cve.cvssScore ?? 0) / 10) * 100}%`, opacity: 0.6 }}
          />
        </div>

        <div className="p-5 space-y-5">
          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Vendor', value: cve.vendor },
              { label: 'Product', value: cve.product },
              { label: 'CVSS Version', value: cve.cvssVersion },
              { label: 'CWE', value: cve.cweId },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg px-3 py-2.5" style={{ background: 'rgba(6,13,26,0.8)', border: '1px solid var(--border)' }}>
                <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold mb-0.5">{label}</p>
                <p className="text-sm text-slate-200 font-medium">{value || '—'}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{tr.description}</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{cve.description}</p>
          </div>

          {/* AI Summary */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <h3 className="text-xs font-semibold text-blue-400 mb-3 flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              {tr.aiSummary}
              <span className="text-blue-400/50 font-normal">{tr.aiSummaryLang}</span>
            </h3>
            {loadingSummary ? (
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <svg className="animate-spin w-4 h-4 text-blue-500/60" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                {tr.analyzing}
              </div>
            ) : (
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {summary || tr.noSummary}
              </p>
            )}
          </div>

          {/* References */}
          {cve.references.length > 0 && (
            <div>
              <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{tr.references}</h3>
              <ul className="space-y-1">
                {cve.references.map((ref) => (
                  <li key={ref}>
                    <a
                      href={ref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400/70 hover:text-blue-300 transition-colors truncate block"
                    >
                      {ref}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-border">
            <button
              className="btn-primary flex items-center gap-2"
              onClick={handleExport}
              disabled={exportingPDF}
            >
              {exportingPDF ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              )}
              {tr.exportPDF}
            </button>
            <a
              href={`https://nvd.nist.gov/vuln/detail/${cve.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
              {tr.viewNVD}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
