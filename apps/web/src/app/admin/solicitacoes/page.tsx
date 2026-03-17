'use client'

import { useEffect, useState } from 'react'
import { CredentialRequest } from '@cozap/core'
import { buildCredentialHash } from '@cozap/core'
import { useAlumniSBT } from '../../../hooks/useAlumniSBT.js'

type ItemState = { rejectMode: boolean; error: string | null; loading: boolean }

export default function SolicitacoesPage() {
  const { issueCredential } = useAlumniSBT()
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

  return (
    <main>
      <h1>Solicitações pendentes</h1>
      {requests.length === 0 && <p>Nenhuma solicitação pendente.</p>}
      <ul>
        {requests.map((req) => {
          const state = itemState[req.id]
          return (
            <li key={req.id}>
              <strong>{req.data.fullName}</strong> — {req.data.course} ({req.data.degreeType}){' '}
              {req.data.entryYear}–{req.data.graduationYear}
              <br />
              <small>{req.walletAddress}</small>

              {state?.error && <p role="alert">{state.error}</p>}

              {!state?.rejectMode ? (
                <>
                  <button onClick={() => handleApprove(req)} disabled={state?.loading}>
                    Aprovar
                  </button>
                  <button onClick={() => setItem(req.id, { rejectMode: true })} disabled={state?.loading}>
                    Rejeitar
                  </button>
                </>
              ) : (
                <>
                  <input
                    placeholder="Motivo da rejeição"
                    value={rejectReasons[req.id] ?? ''}
                    onChange={(e) => setRejectReasons((prev) => ({ ...prev, [req.id]: e.target.value }))}
                  />
                  <button onClick={() => handleReject(req)} disabled={state?.loading}>
                    Confirmar rejeição
                  </button>
                  <button onClick={() => setItem(req.id, { rejectMode: false })} disabled={state?.loading}>
                    Cancelar
                  </button>
                </>
              )}
            </li>
          )
        })}
      </ul>
    </main>
  )
}
