import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

vi.mock('../../../lib/repository', () => ({
  getRepository: vi.fn(() => ({
    findAll: vi.fn().mockResolvedValue([]),
    save: vi.fn(),
    findById: vi.fn(),
    updateStatus: vi.fn(),
  })),
}))

import { getRepository } from '../../../lib/repository'

function makeRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost'))
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/credential-requests', () => {
  it('aceita status=revoked como filtro válido', async () => {
    vi.mocked(getRepository).mockReturnValue({
      findAll: vi.fn().mockResolvedValue([]),
      save: vi.fn(),
      findById: vi.fn(),
      updateStatus: vi.fn(),
    })

    const res = await GET(makeRequest('http://localhost/api/credential-requests?status=revoked'))
    expect(res.status).toBe(200)
  })

  it('rejeita status inválido com 400', async () => {
    const res = await GET(makeRequest('http://localhost/api/credential-requests?status=invalido'))
    expect(res.status).toBe(400)
  })
})
