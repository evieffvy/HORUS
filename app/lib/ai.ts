import Groq from 'groq-sdk'
import { CVEItem } from '../types/cve'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY ?? '' })
const MODEL = 'llama-3.3-70b-versatile'

export async function getCVESummary(cve: CVEItem, lang: 'en' | 'th' = 'th'): Promise<string> {
  const prompt = lang === 'en'
    ? `Summarize this CVE vulnerability in clear English. Cover 3 points: (1) What systems are affected (2) What can an attacker do (3) Urgency of remediation. Use at most 3 short paragraphs.`
    : `สรุปช่องโหว่ CVE นี้เป็นภาษาไทยที่เข้าใจง่าย อธิบาย 3 ข้อ: (1) ระบบอะไรได้รับผลกระทบ (2) ผู้โจมตีทำอะไรได้บ้าง (3) ความเร่งด่วนในการแก้ไข ใช้ไม่เกิน 3 ย่อหน้า`

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'user',
        content: `${prompt}

CVE ID: ${cve.id}
CVSS Score: ${cve.cvssScore ?? 'N/A'} / 10 (${cve.severity})
Vendor: ${cve.vendor ?? 'N/A'} / Product: ${cve.product ?? 'N/A'}
CWE: ${cve.cweId ?? 'N/A'}
Description: ${cve.description}`,
      },
    ],
    max_tokens: 1024,
  })
  return response.choices[0]?.message?.content ?? ''
}

export async function createChatStream(
  messages: { role: 'user' | 'assistant'; content: string }[],
  cveContext?: string,
) {
  const systemContent = `คุณเป็นผู้ช่วย AI ด้านความปลอดภัยไซเบอร์ที่เชี่ยวชาญเรื่อง CVE Threat Intelligence และ Vulnerability Management
ช่วยทีม Security วิเคราะห์ช่องโหว่ เข้าใจผลกระทบ และแนะนำการแก้ไข
ตอบเป็นภาษาไทยถ้าผู้ใช้ถามเป็นภาษาไทย มิฉะนั้นตอบเป็นภาษาอังกฤษ${
    cveContext ? `\n\nข้อมูล CVE ที่กำลังดูอยู่:\n${cveContext}` : ''
  }`

  return groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemContent },
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ],
    stream: true,
    max_tokens: 2048,
  })
}
