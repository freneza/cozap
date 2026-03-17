'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth.js'
import { useHasCredential } from '../../hooks/useHasCredential.js'
import { useNostrIdentity } from '../../hooks/useNostrIdentity.js'
import { useChannelMessages } from '../../hooks/useChannelMessages.js'

const CHANNEL_ID = process.env.NEXT_PUBLIC_NOSTR_CHANNEL_ID ?? ''

function getRelays(): string[] {
  try {
    return JSON.parse(process.env.NEXT_PUBLIC_NOSTR_RELAYS ?? '[]')
  } catch {
    return ['wss://relay.damus.io', 'wss://nos.lol']
  }
}

export default function ComunidadePage() {
  const router = useRouter()
  const { isAuthenticated, address, logout } = useAuth()
  const { hasCredential, isLoading } = useHasCredential(address)
  const { pubkey } = useNostrIdentity()
  const { messages, isConnected } = useChannelMessages(CHANNEL_ID, getRelays())

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || hasCredential === false)) {
      router.replace('/')
    }
  }, [isAuthenticated, hasCredential, isLoading, router])

  if (isLoading || hasCredential === null) {
    return (
      <main>
        <p>Conectando...</p>
      </main>
    )
  }

  if (!isAuthenticated || !hasCredential) {
    return null
  }

  return (
    <main>
      <header>
        <h1>Alumni Poli — Canal Geral</h1>
        <small>Conectado como {pubkey.slice(0, 8)}...</small>
        <button onClick={logout}>Sair</button>
      </header>

      {!isConnected && <p>Conectando ao relay...</p>}

      {isConnected && messages.length === 0 && (
        <p>Nenhuma mensagem ainda. Seja o primeiro a escrever!</p>
      )}

      <ul>
        {messages.map((msg) => (
          <li key={msg.id}>
            <strong>{msg.authorPubkey.slice(0, 8)}...</strong>
            <span>{msg.content}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}
