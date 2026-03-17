'use client'

import { useState, useEffect } from 'react'
import { SimplePool } from 'nostr-tools'
import type { ChannelMessage } from '@cozap/core'

type UseChannelMessagesResult = {
  messages: ChannelMessage[]
  isConnected: boolean
}

export function useChannelMessages(
  channelId: string,
  relayUrls: string[],
): UseChannelMessagesResult {
  const [messages, setMessages] = useState<ChannelMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!channelId || relayUrls.length === 0) return

    const pool = new SimplePool()

    const sub = pool.subscribeMany(
      relayUrls,
      [{ kinds: [42], '#e': [channelId], limit: 50 }],
      {
        onevent(event) {
          const msg: ChannelMessage = {
            id: event.id,
            authorPubkey: event.pubkey,
            channelId,
            content: event.content,
            createdAt: event.created_at,
          }
          setMessages((prev) =>
            [...prev, msg].sort((a, b) => a.createdAt - b.createdAt),
          )
        },
      },
    )

    setIsConnected(true)

    return () => {
      sub.close()
      pool.close(relayUrls)
      setIsConnected(false)
    }
  }, [channelId, relayUrls.join(',')])  // eslint-disable-line react-hooks/exhaustive-deps

  return { messages, isConnected }
}
