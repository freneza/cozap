import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryCredentialRequestRepository } from './repository'
import { CredentialRequest } from '@cozap/core'

const makeRequest = (overrides?: Partial<CredentialRequest>): CredentialRequest => ({
  id: 'abc-123',
  walletAddress: '0xAbCd1234AbCd1234AbCd1234AbCd1234AbCd1234',
  status: 'pending',
  requestedAt: Date.now(),
  data: {
    fullName: 'João Silva',
    course: 'Engenharia Elétrica',
    degreeType: 'graduation',
    entryYear: 2015,
    graduationYear: 2020,
  },
  ...overrides,
})

describe('InMemoryCredentialRequestRepository', () => {
  let repo: InMemoryCredentialRequestRepository

  beforeEach(() => {
    repo = new InMemoryCredentialRequestRepository()
  })

  it('persiste uma solicitação e a recupera por id', async () => {
    const request = makeRequest()
    await repo.save(request)
    const found = await repo.findById(request.id)
    expect(found).toEqual(request)
  })

  it('retorna null para id inexistente', async () => {
    const found = await repo.findById('inexistente')
    expect(found).toBeNull()
  })

  it('findAll retorna todas as solicitações salvas', async () => {
    const a = makeRequest({ id: 'a' })
    const b = makeRequest({ id: 'b' })
    await repo.save(a)
    await repo.save(b)
    const all = await repo.findAll()
    expect(all).toHaveLength(2)
    expect(all).toContainEqual(a)
    expect(all).toContainEqual(b)
  })

  it('persiste entre chamadas no mesmo processo', async () => {
    const request = makeRequest()
    await repo.save(request)
    const all = await repo.findAll()
    expect(all).toHaveLength(1)
  })

  it('findAll filtra por status', async () => {
    await repo.save(makeRequest({ id: 'a', status: 'pending' }))
    await repo.save(makeRequest({ id: 'b', status: 'approved' }))
    await repo.save(makeRequest({ id: 'c', status: 'rejected' }))

    expect(await repo.findAll('pending')).toHaveLength(1)
    expect(await repo.findAll('approved')).toHaveLength(1)
    expect(await repo.findAll('rejected')).toHaveLength(1)
  })

  it('updateStatus atualiza para approved', async () => {
    await repo.save(makeRequest({ id: 'x' }))
    const updated = await repo.updateStatus('x', 'approved')
    expect(updated?.status).toBe('approved')
  })

  it('updateStatus atualiza para rejected com motivo', async () => {
    await repo.save(makeRequest({ id: 'x' }))
    const updated = await repo.updateStatus('x', 'rejected', 'Não encontrado na base')
    expect(updated?.status).toBe('rejected')
    expect(updated?.rejectionReason).toBe('Não encontrado na base')
  })

  it('updateStatus retorna null para id inexistente', async () => {
    const result = await repo.updateStatus('inexistente', 'approved')
    expect(result).toBeNull()
  })
})
