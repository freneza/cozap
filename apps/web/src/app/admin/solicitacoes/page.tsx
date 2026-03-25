'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CredentialRequest } from '@cozap/core'
import { buildCredentialHash } from '@cozap/core'
import { useAlumniSBT } from '../../../hooks/useAlumniSBT'
import { useAuth } from '../../../hooks/useAuth'

type ItemState = { rejectMode: boolean; error: string | null; loading: boolean }

export default function SolicitacoesPage() {
  const { issueCredential } = useAlumniSBT()
  const { logout } = useAuth()
  const [requests, setRequests] = useState<CredentialRequest[]>([])
  const [itemState, setItemState] = useState<Record<string, ItemState>>({})
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/credential-requests?status=pending')
      .then((r) => r.json())
      .then((data) => setRequests(data as CredentialRequest[]))
  }, [])

  function setItem(id: string, patch: Partial<ItemState>) {
    setItemState((prev) => ({ ...prev, [id]: { rejectMode: false, error: null, loading: false, ...prev[id], ...patch } }))
  }

  async function handleApprove(req: CredentialRequest) {
    setItem(req.id, { loading: true, error: null })
    try {
      const hash = buildCredentialHash(req.data)
      await issueCredential(req.walletAddress, hash)

      await fetch(`/api/credential-requests/${req.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })

      setRequests((prev) => prev.filter((r) => r.id !== req.id))
    } catch (err) {
      setItem(req.id, { loading: false, error: err instanceof Error ? err.message : 'Erro ao aprovar' })
    }
  }

  async function handleReject(req: CredentialRequest) {
    const reason = rejectReasons[req.id] ?? ''
    setItem(req.id, { loading: true, error: null })
    try {
      await fetch(`/api/credential-requests/${req.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', rejectionReason: reason }),
      })
      setRequests((prev) => prev.filter((r) => r.id !== req.id))
    } catch (err) {
      setItem(req.id, { loading: false, error: err instanceof Error ? err.message : 'Erro ao rejeitar' })
    }
  }

  const degreeLabel: Record<string, string> = {
    graduation: 'Graduação',
    masters: 'Mestrado',
    doctorate: 'Doutorado',
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
            <span style={{ color: 'var(--color-gold-light)', fontSize: 'var(--text-sm)' }}>
              Painel Admin
            </span>
            <button className="btn btn--ghost btn--sm" onClick={logout} style={{ color: 'var(--color-text-inverse)' }}>
              Sair
            </button>
          </nav>
        </div>
      </header>

      <main className="page-main">
        <div className="container">
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <h1 style={{ marginBottom: 'var(--space-2)' }}>Solicitações pendentes</h1>
            <p className="text-muted">
              Revise os dados de formação e verifique na base da Poli antes de aprovar.
            </p>
          </div>

          {requests.length === 0 && (
            <div className="card text-center" style={{ padding: 'var(--space-12)' }}>
              <p className="text-muted">Nenhuma solicitação pendente no momento.</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {requests.map((req) => {
              const state = itemState[req.id]
              return (
                <div className="card" key={req.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                    <div>
                      <h3 style={{ marginBottom: 'var(--space-1)' }}>{req.data.fullName}</h3>
                      <p className="text-muted" style={{ marginBottom: 'var(--space-2)' }}>
                        {req.data.course} · {degreeLabel[req.data.degreeType] ?? req.data.degreeType} · {req.data.entryYear}–{req.data.graduationYear}
                      </p>
                      <code style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', wordBreak: 'break-all' }}>
                        {req.walletAddress}
                      </code>
                    </div>

                    <span className="badge badge--pending">Pendente</span>
                  </div>

                  {state?.error && (
                    <div className="alert alert--error mt-4" role="alert">
                      {state.error}
                    </div>
                  )}

                  <hr className="divider" style={{ margin: 'var(--space-4) 0' }} />

                  {!state?.rejectMode ? (
                    <div className="flex gap-3">
                      <button
                        className="btn btn--primary"
                        onClick={() => handleApprove(req)}
                        disabled={state?.loading}
                      >
                        {state?.loading ? 'Processando…' : '✓ Aprovar'}
                      </button>
                      <button
                        className="btn btn--danger"
                        onClick={() => setItem(req.id, { rejectMode: true })}
                        disabled={state?.loading}
                      >
                        Rejeitar
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor={`reason-${req.id}`}>
                          Motivo da rejeição
                        </label>
                        <input
                          className="form-input"
                          id={`reason-${req.id}`}
                          placeholder="Descreva o motivo da rejeição"
                          value={rejectReasons[req.id] ?? ''}
                          onChange={(e) => setRejectReasons((prev) => ({ ...prev, [req.id]: e.target.value }))}
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          className="btn btn--danger"
                          onClick={() => handleReject(req)}
                          disabled={state?.loading}
                        >
                          {state?.loading ? 'Processando…' : 'Confirmar rejeição'}
                        </button>
                        <button
                          className="btn btn--ghost"
                          onClick={() => setItem(req.id, { rejectMode: false })}
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
