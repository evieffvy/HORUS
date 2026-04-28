# HORUS

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Author:** Evie ([@evieffvy](https://github.com/evieffvy))

> The all-seeing eye for live vulnerability intelligence.

HORUS is an **AI-powered threat intelligence dashboard** that pulls live CVE data from the **National Vulnerability Database (NVD)**, summarizes vulnerabilities in plain Thai/English using **Google Gemini**, and lets security analysts chat with an AI assistant about specific findings — all with one-click PDF export for offline triage.

Built to demonstrate end-to-end engineering across **threat intelligence ingestion, AI summarization, and analyst-friendly UX**.

---

## Highlights

| Layer | Notable bits |
|---|---|
| **Data** | NVD REST API v2.0 ingestion · CVSS v3.1 / v3.0 / v2 score normalization · CWE & CPE parsing · pagination |
| **AI** | Google Gemini 1.5 Flash · structured Thai-language CVE summarization (affected systems, attacker capabilities, urgency) · streaming chat with bilingual Thai/English assistant |
| **Frontend** | Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Recharts severity visualization · CVE detail modal |
| **UX** | Filterable CVE table (keyword, severity, date range, CVSS score) · interactive chat panel · one-click **PDF export** via jsPDF + jspdf-autotable |
| **Resilience** | Rate-limit-aware NVD fetching · optional API-key elevation (5 → 50 req/30s) · graceful error handling on every API route |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  Browser                                                         │
│  Next.js 14 App Router · React 18 · Tailwind · Recharts          │
│  ─ FilterBar      keyword / severity / date / CVSS range         │
│  ─ CVETable       paginated CVE list                             │
│  ─ SeverityChart  CRITICAL / HIGH / MEDIUM / LOW distribution    │
│  ─ CVEModal       detail view + AI summary trigger               │
│  ─ ChatPanel      streaming Q&A with CVE context                 │
└────────────────────────────┬─────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│  Next.js API routes                                              │
│  ─ GET  /api/cve         proxy to NVD with filters & pagination  │
│  ─ POST /api/summarize   structured CVE summary (Gemini)         │
│  ─ POST /api/chat        streaming chat (Gemini, SSE-style)      │
└────────────────────────────┬─────────────────────────────────────┘
                             │
              ┌──────────────┴───────────────┐
              ▼                              ▼
        NVD API v2.0                   Google Gemini
   (services.nvd.nist.gov)          (gemini-1.5-flash)
```

---

## Features in detail

### 1. NVD ingestion (`app/lib/nvd.ts`)
- Wraps the NVD REST API v2.0 (`/rest/json/cves/2.0`)
- Normalizes CVSS scores across **v3.1, v3.0, and v2** metric blocks (fallback chain)
- Maps numeric scores to severity bands (`CRITICAL ≥ 9.0`, `HIGH ≥ 7.0`, `MEDIUM ≥ 4.0`, `LOW > 0`)
- Extracts CWE IDs, vendor/product from CPE strings, and reference URLs
- Optional `NVD_API_KEY` lifts rate limit from **5 → 50 requests / 30 seconds**

### 2. AI summarization (`app/lib/claude.ts`)
Generates a 3-section Thai-language summary for each CVE covering:
- ระบบอะไรได้รับผลกระทบ (affected systems)
- ผู้โจมตีทำอะไรได้บ้าง (attacker capabilities)
- ความเร่งด่วนในการแก้ไข (remediation urgency)

### 3. Streaming chat
- Bilingual Thai/English security assistant
- CVE context injected into the system prompt when a vulnerability is in focus
- Server-side streaming via `chat.sendMessageStream`, forwarded to the browser as `text/plain` chunks

### 4. PDF export
Filtered CVE tables can be exported to PDF (jsPDF + jspdf-autotable) for offline triage and stakeholder reporting.

---

## Tech stack

**Frontend:** Next.js 14, React 18, TypeScript 5, Tailwind CSS 3, Recharts

**AI:** Google Generative AI SDK (`@google/generative-ai`), Gemini 1.5 Flash

**Data:** NVD REST API v2.0

**Export:** jsPDF, jspdf-autotable

---

## Local setup

### Prerequisites

- Node.js 18+
- A Google Gemini API key — [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- *(Optional)* An NVD API key for higher rate limits — [nvd.nist.gov/developers/request-an-api-key](https://nvd.nist.gov/developers/request-an-api-key)

### Run

```bash
git clone https://github.com/evieffvy/HORUS.git
cd HORUS

# install deps
npm install

# copy env template and fill in your keys
cp .env.local.example .env.local
# edit .env.local — at minimum, set GEMINI_API_KEY

# dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | Google Gemini access for summarization + chat |
| `NVD_API_KEY` | ⚪ optional | Lifts NVD rate limit from 5 → 50 req/30s |

---

## Project structure

```
app/
  api/
    cve/route.ts          NVD proxy with filtering
    summarize/route.ts    CVE → Gemini summary
    chat/route.ts         Streaming chat
  components/
    FilterBar.tsx         keyword / severity / date / CVSS filters
    CVETable.tsx          paginated table
    CVEModal.tsx          detail + AI summary
    SeverityChart.tsx     distribution chart (Recharts)
    ChatPanel.tsx         streaming Q&A panel
  lib/
    nvd.ts                NVD client + score/severity logic
    claude.ts             Gemini summarization & chat
  types/cve.ts            shared CVE type
```

---

## License

MIT
