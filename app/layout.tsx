import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Threat Intel Dashboard',
  description: 'Real-time CVE feed powered by Claude AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
