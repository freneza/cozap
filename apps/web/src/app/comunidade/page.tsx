'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'
import { useHasCredential } from '../../hooks/useHasCredential'
import { useNostrIdentity } from '../../hooks/useNostrIdentity'
import { useChannelMessages } from '../../hooks/useChannelMessages'
import { useSendMessage } from '../../hooks/useSendMessage'

const CHANNEL_ID = process.env.NEXT_PUBLIC_NOSTR_CHANNEL_ID ?? ''

function getRelays(): string[] {
  try {
    return JSON.parse(process.env.NEXT_PUBLIC_NOSTR_RELAYS ?? '[]')
  } catch {
    return ['wss://relay.damus.io', 'wss://nos.lol']
  }
}

const RELAYS = getRelays()

export default function ComunidadePage() {
  const router = useRouter()
  const { isAuthenticated, address, logout } = useAuth()
  const { hasCredential, isLoading } = useHasCredential(address)
  const { pubkey, privkey } = useNostrIdentity()
  const { messages, isConnected } = useChannelMessages(CHANNEL_ID, RELAYS)
  const { sendMessage, isSending, error: sendError } = useSendMessage(CHANNEL_ID, RELAYS, privkey)
  const [draft, setDraft] = useState('')

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.trim()) return
    try {
      await sendMessage(draft.trim())
      setDraft('')
    } catch {
      // erro exposto via sendError
    }
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

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Escreva uma mensagem..."
          disabled={isSending}
        />
        <button type="submit" disabled={isSending}>
          Enviar
        </button>
      </form>

      {sendError && <p role="alert">{sendError}</p>}
    </main>
  )
}
