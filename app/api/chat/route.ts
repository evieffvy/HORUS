import { NextRequest } from 'next/server'
import { createChatStream } from '@/app/lib/ai'

export async function POST(req: NextRequest) {
  const { messages, cveContext } = await req.json()

  const cveContextStr =
    cveContext && typeof cveContext === 'object'
      ? JSON.stringify(cveContext, null, 2)
      : (cveContext as string | undefined)

  let stream: Awaited<ReturnType<typeof createChatStream>>
  try {
    stream = await createChatStream(messages, cveContextStr)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to start chat'
    return new Response(msg, { status: 500 })
  }

  const readable = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder()
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? ''
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
