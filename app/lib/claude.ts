import { GoogleGenerativeAI } from '@google/generative-ai'
import { CVEItem } from '../types/cve'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

export async function getCVESummary(cve: CVEItem): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const result = await model.generateContent(
    `สรุปช่องโหว่ CVE นี้เป็นภาษาไทยที่เข้าใจง่าย อธิบาย 3 ข้อ: (1) ระบบอะไรได้รับผลกระทบ (2) ผู้โจมตีทำอะไรได้บ้าง (3) ความเร่งด่วนในการแก้ไข ใช้ไม่เกิน 3 ย่อหน้า

CVE ID: ${cve.id}
CVSS Score: ${cve.cvssScore ?? 'N/A'} / 10 (${cve.severity})
Vendor: ${cve.vendor ?? 'N/A'} / Product: ${cve.product ?? 'N/A'}
CWE: ${cve.cweId ?? 'N/A'}
Description: ${cve.description}`
  )

  return result.response.text()
}

export async function createChatStream(
  messages: { role: 'user' | 'assistant'; content: string }[],
  cveContext?: string,
) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: `คุณเป็นผู้ช่วย AI ด้านความปลอดภัยไซเบอร์ที่เชี่ยวชาญเรื่อง CVE Threat Intelligence และ Vulnerability Management
ช่วยทีม Security วิเคราะห์ช่องโหว่ เข้าใจผลกระทบ และแนะนำการแก้ไข
ตอบเป็นภาษาไทยถ้าผู้ใช้ถามเป็นภาษาไทย มิฉะนั้นตอบเป็นภาษาอังกฤษ
${cveContext ? `\nข้อมูล CVE ที่กำลังดูอยู่:\n${cveContext}` : ''}`,
  })

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }))

  const lastMessage = messages[messages.length - 1]
  const chat = model.startChat({ history })
  return chat.sendMessageStream(lastMessage?.content ?? '')
}
