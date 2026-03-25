'use client'

import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'
import { useHasCredential } from '../hooks/useHasCredential'

export default function HomePage() {
  const { isAuthenticated, address, login, logout } = useAuth()
  const { hasCredential, isLoading } = useHasCredential(address)

  if (!isAuthenticated) {
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
          <div className="container container--narrow text-center">
            <div className="card card--elevated">
              <h1 style={{ marginBottom: 'var(--space-3)' }}>Bem-vindo à comunidade</h1>
              <p className="text-muted" style={{ marginBottom: 'var(--space-8)' }}>
                Plataforma de comunicação exclusiva para egressos da Escola Politécnica da USP,
                com identidade verificada on-chain.
              </p>

              <div className="flex flex-col gap-3">
                <button className="btn btn--primary btn--lg btn--full" onClick={login}>
                  Entrar com email ou Google
                </button>
                <button className="btn btn--outline btn--lg btn--full" onClick={login}>
                  Conectar carteira própria
                </button>
              </div>

              <hr className="divider" />

              <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                Ainda não tem credencial?{' '}
                <Link href="/solicitar">Solicitar acesso</Link>
              </p>
            </div>
          </div>
        </main>
      </>
    )
  }

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
            <nav className="site-header__nav">
              <button className="btn btn--ghost btn--sm" onClick={logout} style={{ color: 'var(--color-text-inverse)' }}>
                Sair
              </button>
            </nav>
          </div>
        </header>
        <main className="page-main">
          <div className="container container--narrow text-center">
            <p className="text-muted">Verificando credencial on-chain…</p>
          </div>
        </main>
      </>
    )
  }

  if (!hasCredential) {
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
            <nav className="site-header__nav">
              <button className="btn btn--ghost btn--sm" onClick={logout} style={{ color: 'var(--color-text-inverse)' }}>
                Sair
              </button>
            </nav>
          </div>
        </header>

        <main className="page-main">
          <div className="container container--narrow text-center">
            <div className="card card--elevated">
              <div className="badge badge--pending mb-4" style={{ margin: '0 auto var(--space-4)' }}>
                Pendente
              </div>
              <h2 style={{ marginBottom: 'var(--space-3)' }}>Credencial em análise</h2>
              <p className="text-muted">
                Sua solicitação foi recebida e está sendo verificada pelos administradores.
                Você será notificado quando aprovado.
              </p>
              <hr className="divider" />
              <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                Ainda não solicitou?{' '}
                <Link href="/solicitar">Solicitar credencial</Link>
              </p>
            </div>
          </div>
        </main>
      </>
    )
  }

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
          <nav className="site-header__nav">
            <span className="badge badge--verified">✓ Verificado</span>
            <Link href="/comunidade" className="btn btn--accent btn--sm">
              Comunidade
            </Link>
            <button className="btn btn--ghost btn--sm" onClick={logout} style={{ color: 'var(--color-text-inverse)' }}>
              Sair
            </button>
          </nav>
        </div>
      </header>

      <main className="page-main">
        <div className="container container--narrow text-center">
          <div className="card card--elevated">
            <div className="badge badge--verified mb-4" style={{ margin: '0 auto var(--space-4)' }}>
              ✓ Alumni Verificado
            </div>
            <h2 style={{ marginBottom: 'var(--space-3)' }}>Bem-vindo à comunidade!</h2>
            <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>
              Sua identidade como egresso da Poli está verificada on-chain.
            </p>
            <Link href="/comunidade" className="btn btn--primary btn--lg">
              Acessar comunidade
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
