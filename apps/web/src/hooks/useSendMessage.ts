'use client'

import { useState } from 'react'
import { SimplePool, finalizeEvent } from 'nostr-tools'

type UseSendMessageResult = {
  sendMessage(content: string): Promise<void>
  isSending: boolean
  error: string | null
}

export function useSendMessage(
  channelId: string,
  relayUrls: string[],
  privkey: Uint8Array,
): UseSendMessageResult {
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sendMessage(content: string): Promise<void> {
    setIsSending(true)
    setError(null)

    try {
      const event = finalizeEvent(
        {
          kind: 42,
          created_at: Math.floor(Date.now() / 1000),
          tags: [['e', channelId, '', 'root']],
          content,
        },
        privkey,
      )

      const pool = new SimplePool()
      const results = pool.publish(relayUrls, event)
      await Promise.any(results)
    } catch (err) {
      let message: string
      if (err instanceof AggregateError && err.errors.length > 0) {
        const first = err.errors[0]
        message = first instanceof Error ? first.message : 'Erro ao enviar mensagem'
      } else {
        message = err instanceof Error ? err.message : 'Erro ao enviar mensagem'
      }
      setError(message)
      throw err
    } finally {
      setIsSending(false)
    }
  }

  return { sendMessage, isSending, error }
}
