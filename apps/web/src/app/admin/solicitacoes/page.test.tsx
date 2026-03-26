import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SolicitacoesPage from './page'
import { CredentialRequest } from '@cozap/core'

vi.mock('../../../hooks/useAlumniSBT.js', () => ({
  useAlumniSBT: vi.fn(),
}))

vi.mock('../../../hooks/useAuth.js', () => ({
  useAuth: vi.fn(() => ({ logout: vi.fn() })),
}))

const makePending = (id: string): CredentialRequest => ({
  id,
  walletAddress: `0xAlumni${id}` as `0x${string}`,
  status: 'pending',
  requestedAt: Date.now(),
  data: {
    fullName: `Alumni ${id}`,
    course: 'Engenharia Elétrica',
    degreeType: 'graduation',
    entryYear: 2015,
    graduationYear: 2020,
  },
})

beforeEach(async () => {
  const { useAlumniSBT } = await import('../../../hooks/useAlumniSBT.js')
  vi.mocked(useAlumniSBT).mockReturnValue({
    issueCredential: vi.fn().mockResolvedValue('0xtx'),
    revokeCredential: vi.fn(),
    isLoading: false,
    error: null,
  })
})

describe('SolicitacoesPage', () => {
  it('renderiza lista de solicitações pendentes', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [makePending('1'), makePending('2')],
    })

    render(<SolicitacoesPage />)

    await waitFor(() => {
      expect(screen.getByText('Alumni 1')).toBeInTheDocument()
      expect(screen.getByText('Alumni 2')).toBeInTheDocument()
    })
  })

  it('aprovar chama issueCredential e então PATCH', async () => {
    const pending = makePending('1')
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [pending] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...pending, status: 'approved' }) })

    const { useAlumniSBT } = await import('../../../hooks/useAlumniSBT.js')
    const issueCredential = vi.fn().mockResolvedValue('0xtx')
    vi.mocked(useAlumniSBT).mockReturnValue({ issueCredential, revokeCredential: vi.fn(), isLoading: false, error: null })

    const user = userEvent.setup()
    render(<SolicitacoesPage />)

    await waitFor(() => expect(screen.getByText('Alumni 1')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /aprovar/i }))

    await waitFor(() => {
      expect(issueCredential).toHaveBeenCalledOnce()
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        expect.stringContaining('/1'),
        expect.objectContaining({ method: 'PATCH' }),
      )
    })
  })

  it('item removido da lista após aprovação', async () => {
    const pending = makePending('1')
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [pending] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...pending, status: 'approved' }) })

    const user = userEvent.setup()
    render(<SolicitacoesPage />)

    await waitFor(() => expect(screen.getByText('Alumni 1')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /aprovar/i }))

    await waitFor(() => {
      expect(screen.queryByText('Alumni 1')).not.toBeInTheDocument()
    })
  })

  it('rejeitar mostra campo de motivo e então PATCH com rejected', async () => {
    const pending = makePending('1')
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [pending] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...pending, status: 'rejected' }) })

    const user = userEvent.setup()
    render(<SolicitacoesPage />)

    await waitFor(() => expect(screen.getByText('Alumni 1')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /rejeitar/i }))

    expect(screen.getByPlaceholderText(/motivo/i)).toBeInTheDocument()

    await user.type(screen.getByPlaceholderText(/motivo/i), 'Não encontrado')
    await user.click(screen.getByRole('button', { name: /confirmar rejeição/i }))

    await waitFor(() => {
      const calls = vi.mocked(fetch).mock.calls
      const patchCall = calls.find(([, opts]) => (opts as RequestInit)?.method === 'PATCH')
      expect(patchCall).toBeDefined()
      const body = JSON.parse((patchCall![1] as RequestInit).body as string)
      expect(body.action).toBe('reject')
      expect(body.rejectionReason).toBe('Não encontrado')
    })
  })

  it('exibe erro se rejeição falhar', async () => {
    const pending = makePending('1')
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [pending] })
      .mockRejectedValueOnce(new Error('Falha no servidor'))

    const user = userEvent.setup()
    render(<SolicitacoesPage />)

    await waitFor(() => expect(screen.getByText('Alumni 1')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /rejeitar/i }))
    await user.click(screen.getByRole('button', { name: /confirmar rejeição/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Falha no servidor')
    })
  })

  it('botão cancelar fecha o modo de rejeição', async () => {
    const pending = makePending('1')
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [pending] })

    const user = userEvent.setup()
    render(<SolicitacoesPage />)

    await waitFor(() => expect(screen.getByText('Alumni 1')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /rejeitar/i }))

    expect(screen.getByPlaceholderText(/motivo/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(screen.queryByPlaceholderText(/motivo/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /rejeitar/i })).toBeInTheDocument()
  })

  it('exibe erro se issueCredential falhar', async () => {
    const pending = makePending('1')
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => [pending] })

    const { useAlumniSBT } = await import('../../../hooks/useAlumniSBT.js')
    vi.mocked(useAlumniSBT).mockReturnValue({
      issueCredential: vi.fn().mockRejectedValue(new Error('Sem gas')),
      revokeCredential: vi.fn(),
      isLoading: false,
      error: null,
    })

    const user = userEvent.setup()
    render(<SolicitacoesPage />)

    await waitFor(() => expect(screen.getByText('Alumni 1')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /aprovar/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Sem gas')
    })
  })

  it('exibe mensagem genérica se issueCredential lançar não-Error', async () => {
    const pending = makePending('1')
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => [pending] })

    const { useAlumniSBT } = await import('../../../hooks/useAlumniSBT.js')
    vi.mocked(useAlumniSBT).mockReturnValue({
      issueCredential: vi.fn().mockRejectedValue('falha estranha'),
      revokeCredential: vi.fn(),
      isLoading: false,
      error: null,
    })

    const user = userEvent.setup()
    render(<SolicitacoesPage />)

    await waitFor(() => expect(screen.getByText('Alumni 1')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /aprovar/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Erro ao aprovar')
    })
  })

  it('exibe mensagem genérica se rejeição lançar não-Error', async () => {
    const pending = makePending('1')
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [pending] })
      .mockRejectedValueOnce('erro não-Error')

    const user = userEvent.setup()
    render(<SolicitacoesPage />)

    await waitFor(() => expect(screen.getByText('Alumni 1')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /rejeitar/i }))
    await user.click(screen.getByRole('button', { name: /confirmar rejeição/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Erro ao rejeitar')
    })
  })

  it('exibe degreeType desconhecido sem tradução', async () => {
    const pending = {
      ...makePending('1'),
      data: { ...makePending('1').data, degreeType: 'postdoc' as 'graduation' },
    }
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [pending] })

    render(<SolicitacoesPage />)

    await waitFor(() => {
      expect(screen.getByText(/postdoc/)).toBeInTheDocument()
    })
  })
})
