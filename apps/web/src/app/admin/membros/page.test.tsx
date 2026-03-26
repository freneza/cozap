import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MembrosPage from './page'
import { CredentialRequest } from '@cozap/core'

vi.mock('../../../hooks/useAlumniSBT.js', () => ({
  useAlumniSBT: vi.fn(),
}))

vi.mock('../../../hooks/useAuth.js', () => ({
  useAuth: vi.fn(() => ({ logout: vi.fn() })),
}))

const makeApproved = (id: string): CredentialRequest => ({
  id,
  walletAddress: `0xMember${id}` as `0x${string}`,
  status: 'approved',
  requestedAt: Date.now(),
  data: {
    fullName: `Alumni ${id}`,
    course: 'Computação',
    degreeType: 'graduation',
    entryYear: 2002,
    graduationYear: 2006,
  },
})

beforeEach(async () => {
  vi.clearAllMocks()
  const { useAlumniSBT } = await import('../../../hooks/useAlumniSBT.js')
  vi.mocked(useAlumniSBT).mockReturnValue({
    issueCredential: vi.fn(),
    revokeCredential: vi.fn().mockResolvedValue('0xtx'),
    isLoading: false,
    error: null,
  })
})

describe('MembrosPage', () => {
  it('renderiza lista de membros aprovados', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [makeApproved('1'), makeApproved('2')],
    })

    render(<MembrosPage />)

    await waitFor(() => {
      expect(screen.getByText('Alumni 1')).toBeInTheDocument()
      expect(screen.getByText('Alumni 2')).toBeInTheDocument()
    })
  })

  it('clique em Revogar SBT abre confirmação inline', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [makeApproved('1')],
    })

    const user = userEvent.setup()
    render(<MembrosPage />)

    await waitFor(() => expect(screen.getByText('Alumni 1')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /revogar sbt/i }))

    expect(screen.getByRole('button', { name: /confirmar revogação/i })).toBeInTheDocument()
  })

  it('confirmar revogação chama revokeCredential e então PATCH', async () => {
    const approved = makeApproved('1')
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [approved] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...approved, status: 'revoked' }) })

    const { useAlumniSBT } = await import('../../../hooks/useAlumniSBT.js')
    const revokeCredential = vi.fn().mockResolvedValue('0xtx')
    vi.mocked(useAlumniSBT).mockReturnValue({
      issueCredential: vi.fn(),
      revokeCredential,
      isLoading: false,
      error: null,
    })

    const user = userEvent.setup()
    render(<MembrosPage />)

    await waitFor(() => expect(screen.getByText('Alumni 1')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /revogar sbt/i }))
    await user.click(screen.getByRole('button', { name: /confirmar revogação/i }))

    await waitFor(() => {
      expect(revokeCredential).toHaveBeenCalledWith(approved.walletAddress)
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        expect.stringContaining('/1'),
        expect.objectContaining({ method: 'PATCH' }),
      )
    })
  })

  it('membro removido da lista após revogação', async () => {
    const approved = makeApproved('1')
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [approved] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...approved, status: 'revoked' }) })

    const user = userEvent.setup()
    render(<MembrosPage />)

    await waitFor(() => expect(screen.getByText('Alumni 1')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /revogar sbt/i }))
    await user.click(screen.getByRole('button', { name: /confirmar revogação/i }))

    await waitFor(() => {
      expect(screen.queryByText('Alumni 1')).not.toBeInTheDocument()
    })
  })

  it('exibe erro se revokeCredential falhar', async () => {
    const approved = makeApproved('1')
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => [approved] })

    const { useAlumniSBT } = await import('../../../hooks/useAlumniSBT.js')
    vi.mocked(useAlumniSBT).mockReturnValue({
      issueCredential: vi.fn(),
      revokeCredential: vi.fn().mockRejectedValue(new Error('Sem gas')),
      isLoading: false,
      error: null,
    })

    const user = userEvent.setup()
    render(<MembrosPage />)

    await waitFor(() => expect(screen.getByText('Alumni 1')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /revogar sbt/i }))
    await user.click(screen.getByRole('button', { name: /confirmar revogação/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Sem gas')
    })
  })

  it('cancelar fecha confirmação sem alterar lista', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [makeApproved('1')],
    })

    const user = userEvent.setup()
    render(<MembrosPage />)

    await waitFor(() => expect(screen.getByText('Alumni 1')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /revogar sbt/i }))

    expect(screen.getByRole('button', { name: /confirmar revogação/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(screen.queryByRole('button', { name: /confirmar revogação/i })).not.toBeInTheDocument()
    expect(screen.getByText('Alumni 1')).toBeInTheDocument()
  })
})
