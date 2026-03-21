import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SolicitarPage from './page'

vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../components/CredentialRequestForm.js', () => ({
  CredentialRequestForm: ({ onSubmit }: { onSubmit: (r: unknown) => void }) => (
    <button onClick={() => onSubmit({ id: 'x', status: 'pending', walletAddress: '0x1', requestedAt: 1, data: {} })}>
      mock-form-submit
    </button>
  ),
}))

const mockUseAuth = async () => {
  const { useAuth } = await import('../../hooks/useAuth.js')
  return useAuth as ReturnType<typeof vi.fn>
}

describe('SolicitarPage', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('exibe botões de autenticação quando não autenticado', async () => {
    const { useAuth } = await import('../../hooks/useAuth.js')
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      address: undefined,
      authMethod: null,
      login: vi.fn(),
      logout: vi.fn(),
    })

    render(<SolicitarPage />)

    expect(screen.getByRole('button', { name: /entrar com email ou google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /conectar carteira/i })).toBeInTheDocument()
  })

  it('chama login ao clicar em entrar com email ou google', async () => {
    const user = userEvent.setup()
    const login = vi.fn()
    const { useAuth } = await import('../../hooks/useAuth.js')
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      address: undefined,
      authMethod: null,
      login,
      logout: vi.fn(),
    })

    render(<SolicitarPage />)
    await user.click(screen.getByRole('button', { name: /entrar com email ou google/i }))

    expect(login).toHaveBeenCalledOnce()
  })

  it('exibe formulário quando autenticado', async () => {
    const { useAuth } = await import('../../hooks/useAuth.js')
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      address: '0xAbCd1234AbCd1234AbCd1234AbCd1234AbCd1234',
      authMethod: 'embedded',
      login: vi.fn(),
      logout: vi.fn(),
    })

    render(<SolicitarPage />)

    expect(screen.getByRole('button', { name: 'mock-form-submit' })).toBeInTheDocument()
  })

  it('exibe confirmação após submit com sucesso', async () => {
    const user = userEvent.setup()
    const { useAuth } = await import('../../hooks/useAuth.js')
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      address: '0xAbCd1234AbCd1234AbCd1234AbCd1234AbCd1234',
      authMethod: 'embedded',
      login: vi.fn(),
      logout: vi.fn(),
    })

    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })

    render(<SolicitarPage />)
    await user.click(screen.getByRole('button', { name: 'mock-form-submit' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /solicitação enviada/i })).toBeInTheDocument()
    })
  })

  it('exibe mensagem de erro se a API retornar erro', async () => {
    const user = userEvent.setup()
    const { useAuth } = await import('../../hooks/useAuth.js')
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      address: '0xAbCd1234AbCd1234AbCd1234AbCd1234AbCd1234',
      authMethod: 'embedded',
      login: vi.fn(),
      logout: vi.fn(),
    })

    global.fetch = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'Erro interno' }) })

    render(<SolicitarPage />)
    await user.click(screen.getByRole('button', { name: 'mock-form-submit' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })
})
