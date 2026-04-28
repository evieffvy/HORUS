export interface CVEItem {
  id: string
  description: string
  cvssScore: number | null
  cvssVersion: '2.0' | '3.0' | '3.1' | 'N/A'
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' | 'UNKNOWN'
  publishedDate: string
  lastModifiedDate: string
  vendor?: string
  product?: string
  references: string[]
  aiSummary?: string
  cweId?: string
}

export interface CVEFilter {
  keyword: string
  severity: string
  startDate: string
  endDate: string
  minScore: string
  maxScore: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export interface CVEStats {
  total: number
  critical: number
  high: number
  medium: number
  low: number
}
