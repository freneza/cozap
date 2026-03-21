import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomePage from './page'

vi.mock('../hooks/useAuth.js', () => ({ useAuth: vi.fn() }))
vi.mock('../hooks/useHasCredential.js', () => ({ useHasCredential: vi.fn() }))

const mockUseAuth = async (overrides = {}) => {
  const { useAuth } = await import('../hooks/useAuth.js')
  vi.mocked(useAuth).mockReturnValue({
    address: undefined,
    isAuthenticated: false,
    authMethod: null,
    login: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  })
}

const mockUseHasCredential = async (result: {
  hasCredential: boolean | null
  isLoading: boolean
}) => {
  const { useHasCredential } = await import('../hooks/useHasCredential.js')
  vi.mocked(useHasCredential).mockReturnValue(result)
}

beforeEach(async () => {
  await mockUseAuth()
  await mockUseHasCredential({ hasCredential: null, isLoading: false })
})

describe('HomePage', () => {
  it('exibe botões de login quando não autenticado', async () => {
    render(<HomePage />)
    expect(screen.getByRole('button', { name: /email|google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /carteira/i })).toBeInTheDocument()
  })

  it('login é chamado ao clicar nos botões de autenticação', async () => {
    const login = vi.fn()
    await mockUseAuth({ login })
    const user = userEvent.setup()

    render(<HomePage />)
    await user.click(screen.getByRole('button', { name: /email|google/i }))
    expect(login).toHaveBeenCalledOnce()
  })

  it('exibe estado de carregamento enquanto verifica credencial', async () => {
    await mockUseAuth({ isAuthenticated: true, address: '0xAlumni' as `0x${string}` })
    await mockUseHasCredential({ hasCredential: null, isLoading: true })

    render(<HomePage />)
    expect(screen.getByText(/verificando/i)).toBeInTheDocument()
  })

  it('exibe mensagem de análise quando autenticado sem SBT', async () => {
    await mockUseAuth({ isAuthenticated: true, address: '0xAlumni' as `0x${string}` })
    await mockUseHasCredential({ hasCredential: false, isLoading: false })

    render(<HomePage />)
    expect(screen.getByText(/análise/i)).toBeInTheDocument()
  })

  it('exibe boas-vindas quando autenticado com SBT', async () => {
    await mockUseAuth({ isAuthenticated: true, address: '0xAlumni' as `0x${string}` })
    await mockUseHasCredential({ hasCredential: true, isLoading: false })

    render(<HomePage />)
    expect(screen.getByText(/bem-vindo/i)).toBeInTheDocument()
  })

  it('botão Sair chama logout quando autenticado com SBT', async () => {
    const logout = vi.fn()
    await mockUseAuth({ isAuthenticated: true, address: '0xAlumni' as `0x${string}`, logout })
    await mockUseHasCredential({ hasCredential: true, isLoading: false })

    const user = userEvent.setup()
    render(<HomePage />)
    await user.click(screen.getByRole('button', { name: /sair/i }))
    expect(logout).toHaveBeenCalledOnce()
  })

  it('botão Sair chama logout quando autenticado sem SBT', async () => {
    const logout = vi.fn()
    await mockUseAuth({ isAuthenticated: true, address: '0xAlumni' as `0x${string}`, logout })
    await mockUseHasCredential({ hasCredential: false, isLoading: false })

    const user = userEvent.setup()
    render(<HomePage />)
    await user.click(screen.getByRole('button', { name: /sair/i }))
    expect(logout).toHaveBeenCalledOnce()
  })
})
