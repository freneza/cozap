'use client'

import Link from 'next/link'
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
      <>
        <header className="site-header">
          <div className="container site-header__inner">
            <div className="site-header__brand">
              <div className="site-header__logo">M</div>
              <div>
                <div className="site-header__title">coZap</div>
                <div className="site-header__subtitle">Alumni Poli</div>
              </div>
            </div>
          </div>
        </header>
        <main className="page-main">
          <div className="container text-center">
            <p className="text-muted">Conectando…</p>
          </div>
        </main>
      </>
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
    <>
      <header className="site-header">
        <div className="container site-header__inner">
          <Link href="/" className="site-header__brand">
            <div className="site-header__logo">M</div>
            <div>
              <div className="site-header__title">coZap</div>
              <div className="site-header__subtitle">Alumni Poli</div>
            </div>
          </Link>
          <nav className="site-header__nav">
            <span className="badge badge--verified">✓ Verificado</span>
            <button
              className="btn btn--ghost btn--sm"
              onClick={logout}
              style={{ color: 'var(--color-text-inverse)' }}
            >
              Sair
            </button>
          </nav>
        </div>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
        {/* Barra do canal */}
        <div style={{
          background: 'var(--color-bg-card)',
          borderBottom: '1px solid var(--color-border)',
          padding: 'var(--space-3) var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>
              # canal-geral
            </span>
            {!isConnected && (
              <span className="text-muted" style={{ fontSize: 'var(--text-sm)', marginLeft: 'var(--space-3)' }}>
                Conectando ao relay…
              </span>
            )}
            {isConnected && (
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-success)', marginLeft: 'var(--space-3)' }}>
                ● Online
              </span>
            )}
          </div>
          <small className="text-muted">
            {pubkey.slice(0, 8)}…
          </small>
        </div>

        {/* Lista de mensagens */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}>
          {isConnected && messages.length === 0 && (
            <div className="text-center" style={{ marginTop: 'var(--space-12)' }}>
              <p className="text-muted">Nenhuma mensagem ainda. Seja o primeiro a escrever!</p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3) var(--space-4)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                <span style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  fontFamily: 'monospace',
                }}>
                  {msg.authorPubkey.slice(0, 8)}…
                </span>
              </div>
              <p style={{ margin: 0, wordBreak: 'break-word' }}>{msg.content}</p>
            </div>
          ))}
        </div>

        {/* Input de mensagem */}
        <div style={{
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-bg-card)',
          padding: 'var(--space-4) var(--space-6)',
          flexShrink: 0,
        }}>
          {sendError && (
            <div className="alert alert--error mb-4" role="alert">
              {sendError}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <input
              className="form-input"
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Escreva uma mensagem para a comunidade…"
              disabled={isSending}
              style={{ flex: 1 }}
            />
            <button
              className="btn btn--primary"
              type="submit"
              disabled={isSending || !draft.trim()}
            >
              {isSending ? 'Enviando…' : 'Enviar'}
            </button>
          </form>
        </div>
      </main>
    </>
  )
}
