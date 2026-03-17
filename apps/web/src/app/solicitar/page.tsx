'use client'

import { useState } from 'react'
import { CredentialRequest } from '@cozap/core'
import { useAuth } from '../../hooks/useAuth.js'
import { CredentialRequestForm } from '../../components/CredentialRequestForm.js'

type PageState = 'auth' | 'form' | 'success'

export default function SolicitarPage() {
  const { isAuthenticated, address, login } = useAuth()
  const [pageState, setPageState] = useState<PageState>(isAuthenticated ? 'form' : 'auth')
  const [apiError, setApiError] = useState<string | null>(null)

  if (isAuthenticated && pageState === 'auth') {
    setPageState('form')
  }

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

  if (pageState === 'success') {
    return (
      <main>
        <h1>Solicitação enviada</h1>
        <p>Sua solicitação foi recebida. Retornaremos em breve com a confirmação.</p>
      </main>
    )
  }

  if (pageState === 'form' && address) {
    return (
      <main>
        <h1>Solicitar credencial Alumni Poli</h1>
        {apiError && <p role="alert">{apiError}</p>}
        <CredentialRequestForm address={address} onSubmit={handleSubmit} />
      </main>
    )
  }

  return (
    <main>
      <h1>Solicitar credencial Alumni Poli</h1>
      <p>Para continuar, identifique-se:</p>
      <button onClick={login}>Entrar com email ou Google</button>
      <button onClick={login}>Conectar carteira</button>
    </main>
  )
}
