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
      <div>
        <label htmlFor="fullName">Nome completo</label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="course">Curso de formação</label>
        <input
          id="course"
          type="text"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="degreeType">Tipo de diploma</label>
        <select
          id="degreeType"
          value={degreeType}
          onChange={(e) => setDegreeType(e.target.value as typeof degreeType)}
        >
          <option value="graduation">Graduação</option>
          <option value="masters">Mestrado</option>
          <option value="doctorate">Doutorado</option>
        </select>
      </div>

      <div>
        <label htmlFor="entryYear">Ano de entrada</label>
        <input
          id="entryYear"
          type="number"
          value={entryYear}
          onChange={(e) => setEntryYear(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="graduationYear">Ano de conclusão</label>
        <input
          id="graduationYear"
          type="number"
          value={graduationYear}
          onChange={(e) => setGraduationYear(e.target.value)}
        />
      </div>

      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={submitting}>
        Enviar solicitação
      </button>
    </form>
  )
}
