'use client'

import { useState } from 'react'
import { buildCredentialRequest, CredentialRequest, InvalidRequestData } from '@cozap/core'

type Props = {
  address: `0x${string}`
  onSubmit: (request: CredentialRequest) => void
}

export function CredentialRequestForm({ address, onSubmit }: Props) {
  const [fullName, setFullName] = useState('')
  const [course, setCourse] = useState('')
  const [degreeType, setDegreeType] = useState<'graduation' | 'masters' | 'doctorate'>('graduation')
  const [entryYear, setEntryYear] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const request = buildCredentialRequest(
        {
          fullName,
          course,
          degreeType,
          entryYear: Number(entryYear),
          graduationYear: Number(graduationYear),
        },
        address,
      )
      onSubmit(request)
    } catch (err) {
      if (err instanceof InvalidRequestData) {
        setError(err.message)
      } else {
        setError('Erro inesperado. Tente novamente.')
      }
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="fullName">Nome completo</label>
        <input
          className="form-input"
          id="fullName"
          type="text"
          placeholder="Ex: João da Silva"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="course">Curso de formação</label>
        <input
          className="form-input"
          id="course"
          type="text"
          placeholder="Ex: Engenharia Elétrica"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="degreeType">Tipo de diploma</label>
        <select
          className="form-select"
          id="degreeType"
          value={degreeType}
          onChange={(e) => setDegreeType(e.target.value as typeof degreeType)}
        >
          <option value="graduation">Graduação</option>
          <option value="masters">Mestrado</option>
          <option value="doctorate">Doutorado</option>
        </select>
      </div>

      <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="entryYear">Ano de entrada</label>
          <input
            className="form-input"
            id="entryYear"
            type="number"
            placeholder="Ex: 2010"
            value={entryYear}
            onChange={(e) => setEntryYear(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="graduationYear">Ano de conclusão</label>
          <input
            className="form-input"
            id="graduationYear"
            type="number"
            placeholder="Ex: 2015"
            value={graduationYear}
            onChange={(e) => setGraduationYear(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="alert alert--error mb-6" role="alert">
          {error}
        </div>
      )}

      <button className="btn btn--primary btn--full btn--lg" type="submit" disabled={submitting}>
        {submitting ? 'Enviando…' : 'Enviar solicitação'}
      </button>
    </form>
  )
}
