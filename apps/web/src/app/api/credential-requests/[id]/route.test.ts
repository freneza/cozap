import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { PATCH } from './route'
import { CredentialRequest } from '@cozap/core'

vi.mock('../../../../lib/repository', () => ({
  getRepository: vi.fn(),
}))

import { getRepository } from '../../../../lib/repository'

const makeApproved = (overrides?: Partial<CredentialRequest>): CredentialRequest => ({
  id: 'req-1',
  walletAddress: '0xMember1234' as `0x${string}`,
  status: 'approved',
  requestedAt: Date.now(),
  data: {
    fullName: 'Ana Souza',
    course: 'Computação',
    degreeType: 'graduation',
    entryYear: 2002,
    graduationYear: 2006,
  },
  ...overrides,
})

function makePatchRequest(body: object): NextRequest {
  return new NextRequest('http://localhost/api/credential-requests/req-1', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PATCH /api/credential-requests/:id — action revoke', () => {
  it('revoga solicitação aprovada e retorna status revoked', async () => {
    const mockUpdate = vi.fn().mockResolvedValue({ ...makeApproved(), status: 'revoked' })
    vi.mocked(getRepository).mockReturnValue({
      findAll: vi.fn(),
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(makeApproved()),
      updateStatus: mockUpdate,
    })

    const res = await PATCH(makePatchRequest({ action: 'revoke' }), { params: Promise.resolve({ id: 'req-1' }) })
    const body = await res.json() as CredentialRequest

    expect(res.status).toBe(200)
    expect(body.status).toBe('revoked')
    expect(mockUpdate).toHaveBeenCalledWith('req-1', 'revoked', undefined)
  })

  it('retorna 400 ao tentar revogar solicitação pendente', async () => {
    vi.mocked(getRepository).mockReturnValue({
      findAll: vi.fn(),
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(makeApproved({ status: 'pending' })),
      updateStatus: vi.fn(),
    })

    const res = await PATCH(makePatchRequest({ action: 'revoke' }), { params: Promise.resolve({ id: 'req-1' }) })
    expect(res.status).toBe(400)
  })

  it('retorna 404 para solicitação inexistente ao revogar', async () => {
    vi.mocked(getRepository).mockReturnValue({
      findAll: vi.fn(),
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      updateStatus: vi.fn(),
    })

    const res = await PATCH(makePatchRequest({ action: 'revoke' }), { params: Promise.resolve({ id: 'inexistente' }) })
    expect(res.status).toBe(404)
  })

  it('retorna 400 para ação inválida', async () => {
    vi.mocked(getRepository).mockReturnValue({
      findAll: vi.fn(),
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(makeApproved()),
      updateStatus: vi.fn(),
    })

    const res = await PATCH(makePatchRequest({ action: 'invalida' }), { params: Promise.resolve({ id: 'req-1' }) })
    expect(res.status).toBe(400)
  })
})
