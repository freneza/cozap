'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { CredentialRequest } from '@cozap/core'
import { useAuth } from '../../hooks/useAuth'
import { CredentialRequestForm } from '../../components/CredentialRequestForm'

type PageState = 'auth' | 'form' | 'success'

export default function SolicitarPage() {
  const { isAuthenticated, address, login, logout } = useAuth()
  const [pageState, setPageState] = useState<PageState>(isAuthenticated ? 'form' : 'auth')
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated && pageState === 'auth') {
      setPageState('form')
    }
  }, [isAuthenticated, pageState])

  async function handleSubmit(request: CredentialRequest) {
    setApiError(null)

    const response = await fetch('/api/credential-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const body = (await response.json()) as { error?: string }
      setApiError(body.error ?? 'Erro ao enviar solicitação. Tente novamente.')
      return
    }

    setPageState('success')
  }

  const header = (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" className="site-header__brand">
          <div className="site-header__logo">M</div>
          <div>
            <div className="site-header__title">coZap</div>
            <div className="site-header__subtitle">Alumni Poli</div>
          </div>
        </Link>
        {isAuthenticated && (
          <nav className="site-header__nav">
            <button className="btn btn--ghost btn--sm" onClick={logout} style={{ color: 'var(--color-text-inverse)' }}>
              Sair
            </button>
          </nav>
        )}
      </div>
    </header>
  )

  if (pageState === 'success') {
    return (
      <>
        {header}
        <main className="page-main">
          <div className="container container--narrow text-center">
            <div className="card card--elevated">
              <div className="badge badge--verified mb-4" style={{ margin: '0 auto var(--space-4)' }}>
                ✓ Enviado
              </div>
              <h2 style={{ marginBottom: 'var(--space-3)' }}>Solicitação recebida</h2>
              <p className="text-muted">
                Sua solicitação foi enviada com sucesso. Um administrador irá verificar seus dados
                e você receberá a confirmação em breve.
              </p>
              <hr className="divider" />
              <Link href="/" className="btn btn--outline">
                Voltar ao início
              </Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  if (pageState === 'form' && !address) {
    return (
      <>
        {header}
        <main className="page-main">
          <div className="container container--narrow text-center">
            <p className="text-muted">Carregando…</p>
          </div>
        </main>
      </>
    )
  }

  if (pageState === 'form' && address) {
    return (
      <>
        {header}
        <main className="page-main">
          <div className="container container--narrow">
            <div className="card card--elevated">
              <div className="card__header">
                <h2 className="card__title">Solicitar credencial Alumni Poli</h2>
                <p className="card__subtitle">
                  Preencha seus dados de formação para solicitar sua credencial verificada.
                </p>
              </div>
              {apiError && (
                <div className="alert alert--error mb-6" role="alert">
                  {apiError}
                </div>
              )}
              <CredentialRequestForm address={address} onSubmit={handleSubmit} />
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      {header}
      <main className="page-main">
        <div className="container container--narrow text-center">
          <div className="card card--elevated">
            <h2 style={{ marginBottom: 'var(--space-3)' }}>Solicitar credencial Alumni Poli</h2>
            <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>
              Para continuar, identifique-se com sua conta:
            </p>
            <div className="flex flex-col gap-3">
              <button className="btn btn--primary btn--lg btn--full" onClick={login}>
                Entrar com email ou Google
              </button>
              <button className="btn btn--outline btn--lg btn--full" onClick={login}>
                Conectar carteira
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
