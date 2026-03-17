'use client'

import Link from 'next/link'
import { useAuth } from '../hooks/useAuth.js'
import { useHasCredential } from '../hooks/useHasCredential.js'

export default function HomePage() {
  const { isAuthenticated, address, login, logout } = useAuth()
  const { hasCredential, isLoading } = useHasCredential(address)

  if (!isAuthenticated) {
    return (
      <main>
        <h1>coZap — Alumni Poli</h1>
        <p>Plataforma de comunicação da comunidade Alumni Poli.</p>
        <button onClick={login}>Entrar com email ou Google</button>
        <button onClick={login}>Conectar carteira própria</button>
      </main>
    )
  }

  if (isLoading || hasCredential === null) {
    return (
      <main>
        <p>Verificando credencial...</p>
      </main>
    )
  }

  if (!hasCredential) {
    return (
      <main>
        <h1>coZap — Alumni Poli</h1>
        <p>Sua credencial está em análise.</p>
        <p>
          Ainda não solicitou? <Link href="/solicitar">Solicitar credencial</Link>
        </p>
        <button onClick={logout}>Sair</button>
      </main>
    )
  }

  return (
    <main>
      <h1>coZap — Alumni Poli</h1>
      <p>Bem-vindo à comunidade Alumni Poli!</p>
      <button onClick={logout}>Sair</button>
    </main>
  )
}
