import { NextRequest } from 'next/server'
import { createChatStream } from '@/app/lib/claude'

export async function POST(req: NextRequest) {
  const { messages, cveContext } = await req.json()

  const stream = await createChatStream(messages, cveContext)

  const readable = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder()
      try {
        for await (const chunk of stream) {
          const text = chunk.text()
          if (text) controller.enqueue(enc.encode(text))
        }
      } catch (e) {
        controller.error(e)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}
