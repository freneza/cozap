'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CredentialRequest } from '@cozap/core'
import { useAlumniSBT } from '../../../hooks/useAlumniSBT'
import { useAuth } from '../../../hooks/useAuth'

type ItemState = { confirmMode: boolean; error: string | null; loading: boolean }

const degreeLabel: Record<string, string> = {
  graduation: 'Graduação',
  masters: 'Mestrado',
  doctorate: 'Doutorado',
}

export default function MembrosPage() {
  const { revokeCredential } = useAlumniSBT()
  const { logout } = useAuth()
  const [members, setMembers] = useState<CredentialRequest[]>([])
  const [itemState, setItemState] = useState<Record<string, ItemState>>({})

  useEffect(() => {
    fetch('/api/credential-requests?status=approved')
      .then((r) => r.json())
      .then((data) => setMembers(data as CredentialRequest[]))
  }, [])

  function setItem(id: string, patch: Partial<ItemState>) {
    setItemState((prev) => ({
      ...prev,
      [id]: { confirmMode: false, error: null, loading: false, ...prev[id], ...patch },
    }))
  }

  async function handleRevoke(member: CredentialRequest) {
    setItem(member.id, { loading: true, error: null })
    try {
      await revokeCredential(member.walletAddress)

      await fetch(`/api/credential-requests/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke' }),
      })

      setMembers((prev) => prev.filter((m) => m.id !== member.id))
    } catch (err) {
      setItem(member.id, {
        loading: false,
        error: err instanceof Error ? err.message : 'Erro ao revogar credencial',
      })
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
            <Link
              href="/admin/solicitacoes"
              style={{ color: 'var(--color-gold-light)', fontSize: 'var(--text-sm)' }}
            >
              Solicitações
            </Link>
            <span style={{ color: 'var(--color-gold-light)', fontSize: 'var(--text-sm)' }}>
              Membros
            </span>
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

      <main className="page-main">
        <div className="container">
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <h1 style={{ marginBottom: 'var(--space-2)' }}>Membros verificados</h1>
            <p className="text-muted">
              Alumni com SBT ativo. A revogação é irreversível — o membro precisará solicitar nova credencial.
            </p>
          </div>

          {members.length === 0 && (
            <div className="card text-center" style={{ padding: 'var(--space-12)' }}>
              <p className="text-muted">Nenhum membro verificado no momento.</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {members.map((member) => {
              const state = itemState[member.id]
              return (
                <div className="card" key={member.id}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: 'var(--space-4)',
                    }}
                  >
                    <div>
                      <h3 style={{ marginBottom: 'var(--space-1)' }}>{member.data.fullName}</h3>
                      <p className="text-muted" style={{ marginBottom: 'var(--space-2)' }}>
                        {member.data.course} ·{' '}
                        {degreeLabel[member.data.degreeType] ?? member.data.degreeType} ·{' '}
                        {member.data.entryYear}–{member.data.graduationYear}
                      </p>
                      <code
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-muted)',
                          wordBreak: 'break-all',
                        }}
                      >
                        {member.walletAddress}
                      </code>
                    </div>
                    <span className="badge badge--approved">Ativo</span>
                  </div>

                  {state?.error && (
                    <div className="alert alert--error mt-4" role="alert">
                      {state.error}
                    </div>
                  )}

                  <hr className="divider" style={{ margin: 'var(--space-4) 0' }} />

                  {!state?.confirmMode ? (
                    <button
                      className="btn btn--danger"
                      onClick={() => setItem(member.id, { confirmMode: true })}
                      disabled={state?.loading}
                    >
                      Revogar SBT
                    </button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      <p style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)' }}>
                        Tem certeza? Esta ação é irreversível.
                      </p>
                      <div className="flex gap-3">
                        <button
                          className="btn btn--danger"
                          onClick={() => handleRevoke(member)}
                          disabled={state?.loading}
                        >
                          {state?.loading ? 'Revogando…' : 'Confirmar revogação'}
                        </button>
                        <button
                          className="btn btn--ghost"
                          onClick={() => setItem(member.id, { confirmMode: false })}
                          disabled={state?.loading}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </>
  )
}
