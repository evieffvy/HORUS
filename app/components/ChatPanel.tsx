'use client'

import { useEffect, useRef, useState } from 'react'
import { ChatMessage, CVEItem } from '../types/cve'
import { useLang } from '../context/LanguageContext'
import { t } from '../lib/translations'

interface Props {
  selectedCVE: CVEItem | null
}

export default function ChatPanel({ selectedCVE }: Props) {
  const { lang } = useLang()
  const tr = t[lang].chat

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const send = async () => {
    const text = input.trim()
    if (!text || streaming) return
    setInput('')

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text }
    const aiId = (Date.now() + 1).toString()
    setMessages((prev) => [...prev, userMsg, { id: aiId, role: 'assistant', content: '' }])
    setStreaming(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          cveContext: selectedCVE ?? undefined,
        }),
      })

      if (!res.body) throw new Error('no body')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages((prev) =>
          prev.map((m) => (m.id === aiId ? { ...m, content: accumulated } : m))
        )
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.id === aiId ? { ...m, content: tr.disconnected } : m))
      )
    } finally {
      setStreaming(false)
    }
  }

  return (
    <div className="fixed bottom-0 right-6 z-40 w-[420px]">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors shadow-2xl rounded-t-xl"
        style={{ background: 'rgba(10,18,32,0.95)', border: '1px solid var(--border)', borderBottom: 'none', backdropFilter: 'blur(12px)' }}
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          {tr.panel}
          {selectedCVE && (
            <span className="text-xs text-blue-400/60 font-mono truncate max-w-[160px]">{selectedCVE.id}</span>
          )}
        </span>
        <span className="flex items-center gap-2">
          {streaming && (
            <span className="flex gap-1">
              {[0, 150, 300].map((delay) => (
                <span key={delay} className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
              ))}
            </span>
          )}
          <svg className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/>
          </svg>
        </span>
      </button>

      {/* Panel body */}
      {open && (
        <div
          className="flex flex-col shadow-2xl"
          style={{ height: '400px', background: 'rgba(10,18,32,0.97)', border: '1px solid var(--border)', borderTop: 'none', backdropFilter: 'blur(12px)' }}
        >
          {/* Context bar */}
          {selectedCVE && (
            <div className="px-3 py-1.5 border-b text-xs text-blue-400/80 flex items-center gap-1.5 flex-shrink-0" style={{ background: 'rgba(59,130,246,0.06)', borderColor: 'rgba(59,130,246,0.15)' }}>
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {tr.context}: <span className="font-mono">{selectedCVE.id}</span>
              <span className="text-blue-400/40 mx-1">·</span>
              <span className="text-blue-400/60">{selectedCVE.severity}</span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
                  <svg className="w-5 h-5 text-blue-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                  </svg>
                </div>
                <div className="text-center">
                  {tr.emptyHint.map((line, i) => (
                    <p key={i} className="text-xs">{line}</p>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'rounded-br-sm text-slate-200'
                      : 'rounded-bl-sm text-slate-300'
                  }`}
                  style={msg.role === 'user'
                    ? { background: 'rgba(37,99,235,0.25)', border: '1px solid rgba(59,130,246,0.2)' }
                    : { background: 'rgba(6,13,26,0.8)', border: '1px solid var(--border)' }
                  }
                >
                  {msg.role === 'assistant' && msg.content === '' ? (
                    <span className="typing-cursor text-slate-500">{tr.thinking}</span>
                  ) : (
                    <span className="whitespace-pre-wrap">
                      {msg.content}
                      {msg.role === 'assistant' && streaming && messages[messages.length - 1]?.id === msg.id && (
                        <span className="typing-cursor" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border flex gap-2 flex-shrink-0">
            <input
              ref={inputRef}
              className="input flex-1 text-xs py-2"
              placeholder={tr.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
              disabled={streaming}
            />
            <button
              className="btn-primary py-2 px-3 disabled:opacity-40"
              onClick={send}
              disabled={!input.trim() || streaming}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
