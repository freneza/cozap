import { describe, it, expect } from 'vitest'
import { buildCredentialHash } from './buildCredentialHash.js'
import { CredentialRequestData } from './types.js'

const validData: CredentialRequestData = {
  fullName: 'João Silva',
  course: 'Engenharia Elétrica',
  degreeType: 'graduation',
  entryYear: 2015,
  graduationYear: 2020,
}

describe('buildCredentialHash', () => {
  it('retorna string hex com prefixo 0x de 66 chars (32 bytes)', () => {
    const hash = buildCredentialHash(validData)
    expect(hash).toMatch(/^0x[0-9a-f]{64}$/)
    expect(hash).toHaveLength(66)
  })

  it('é determinístico — mesmos dados sempre produzem o mesmo hash', () => {
    const a = buildCredentialHash(validData)
    const b = buildCredentialHash(validData)
    expect(a).toBe(b)
  })

  it('dados diferentes produzem hashes diferentes', () => {
    const a = buildCredentialHash(validData)
    const b = buildCredentialHash({ ...validData, course: 'Engenharia Mecânica' })
    const c = buildCredentialHash({ ...validData, graduationYear: 2021 })
    const d = buildCredentialHash({ ...validData, degreeType: 'masters' })

    expect(a).not.toBe(b)
    expect(a).not.toBe(c)
    expect(a).not.toBe(d)
  })

  it('fullName não afeta o hash (não vai on-chain)', () => {
    const a = buildCredentialHash(validData)
    const b = buildCredentialHash({ ...validData, fullName: 'Outro Nome' })
    expect(a).toBe(b)
  })
})
