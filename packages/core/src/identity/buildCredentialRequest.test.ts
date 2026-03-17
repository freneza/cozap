import { describe, it, expect } from 'vitest'
import { buildCredentialRequest } from './buildCredentialRequest.js'
import { InvalidRequestData } from './errors.js'

const validData = {
  fullName: 'João Silva',
  course: 'Engenharia Elétrica',
  degreeType: 'graduation' as const,
  entryYear: 2015,
  graduationYear: 2020,
}

const address = '0xAbCd1234AbCd1234AbCd1234AbCd1234AbCd1234' as `0x${string}`

describe('buildCredentialRequest', () => {
  it('retorna solicitação com status pendente e dados corretos', () => {
    const request = buildCredentialRequest(validData, address)

    expect(request.status).toBe('pending')
    expect(request.walletAddress).toBe(address)
    expect(request.data).toEqual(validData)
  })

  it('requestedAt é um timestamp numérico', () => {
    const before = Date.now()
    const request = buildCredentialRequest(validData, address)
    const after = Date.now()

    expect(request.requestedAt).toBeGreaterThanOrEqual(before)
    expect(request.requestedAt).toBeLessThanOrEqual(after)
  })

  it('id gerado é único entre duas chamadas consecutivas', () => {
    const a = buildCredentialRequest(validData, address)
    const b = buildCredentialRequest(validData, address)

    expect(a.id).not.toBe(b.id)
  })

  it('lança InvalidRequestData quando entryYear >= graduationYear', () => {
    expect(() =>
      buildCredentialRequest({ ...validData, entryYear: 2020, graduationYear: 2020 }, address)
    ).toThrow(InvalidRequestData)

    expect(() =>
      buildCredentialRequest({ ...validData, entryYear: 2021, graduationYear: 2020 }, address)
    ).toThrow(InvalidRequestData)
  })

  it('lança InvalidRequestData quando fullName está vazio', () => {
    expect(() =>
      buildCredentialRequest({ ...validData, fullName: '' }, address)
    ).toThrow(InvalidRequestData)

    expect(() =>
      buildCredentialRequest({ ...validData, fullName: '   ' }, address)
    ).toThrow(InvalidRequestData)
  })
})
