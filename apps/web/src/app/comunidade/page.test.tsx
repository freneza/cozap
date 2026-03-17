import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ComunidadePage from './page.js'

vi.mock('next/navigation', () => ({ useRouter: vi.fn() }))
vi.mock('../../hooks/useAuth.js', () => ({ useAuth: vi.fn() }))
vi.mock('../../hooks/useHasCredential.js', () => ({ useHasCredential: vi.fn() }))
vi.mock('../../hooks/useNostrIdentity.js', () => ({ useNostrIdentity: vi.fn() }))
vi.mock('../../hooks/useChannelMessages.js', () => ({ useChannelMessages: vi.fn() }))

const mockRouter = { replace: vi.fn() }

async function setup(opts: {
  isAuthenticated?: boolean
  hasCredential?: boolean | null
  credentialLoading?: boolean
  messages?: { id: string; authorPubkey: string; channelId: string; content: string; createdAt: number }[]
  isConnected?: boolean
}) {
  const { useRouter } = await import('next/navigation')
  const { useAuth } = await import('../../hooks/useAuth.js')
  const { useHasCredential } = await import('../../hooks/useHasCredential.js')
  const { useNostrIdentity } = await import('../../hooks/useNostrIdentity.js')
  const { useChannelMessages } = await import('../../hooks/useChannelMessages.js')

  vi.mocked(useRouter).mockReturnValue(mockRouter as ReturnType<typeof useRouter>)
  vi.mocked(useAuth).mockReturnValue({
    address: opts.isAuthenticated ? ('0xAlumni' as `0x${string}`) : undefined,
    isAuthenticated: opts.isAuthenticated ?? false,
    authMethod: null,
    login: vi.fn(),
    logout: vi.fn(),
  })
  vi.mocked(useHasCredential).mockReturnValue({
    hasCredential: opts.hasCredential ?? null,
    isLoading: opts.credentialLoading ?? false,
  })
  vi.mocked(useNostrIdentity).mockReturnValue({
    pubkey: 'mypubkey',
    privkey: new Uint8Array(32),
  })
  vi.mocked(useChannelMessages).mockReturnValue({
    messages: opts.messages ?? [],
    isConnected: opts.isConnected ?? true,
  })
}

beforeEach(async () => {
  mockRouter.replace.mockClear()
  await setup({ isAuthenticated: true, hasCredential: true, isConnected: true })
})

describe('ComunidadePage', () => {
  it('redireciona para / quando não autenticado', async () => {
    await setup({ isAuthenticated: false, hasCredential: null })
    render(<ComunidadePage />)
    expect(mockRouter.replace).toHaveBeenCalledWith('/')
  })

  it('redireciona para / quando autenticado sem SBT', async () => {
    await setup({ isAuthenticated: true, hasCredential: false })
    render(<ComunidadePage />)
    expect(mockRouter.replace).toHaveBeenCalledWith('/')
  })

  it('exibe "Conectando..." enquanto verifica credencial', async () => {
    await setup({ isAuthenticated: true, hasCredential: null, credentialLoading: true })
    render(<ComunidadePage />)
    expect(screen.getByText(/conectando/i)).toBeInTheDocument()
  })

  it('exibe mensagens quando conectado', async () => {
    await setup({
      isAuthenticated: true,
      hasCredential: true,
      isConnected: true,
      messages: [
        { id: 'e1', authorPubkey: 'pubkey1', channelId: 'ch1', content: 'Olá turma!', createdAt: 1700000001 },
        { id: 'e2', authorPubkey: 'pubkey2', channelId: 'ch1', content: 'Boa noite!', createdAt: 1700000002 },
      ],
    })
    render(<ComunidadePage />)
    expect(screen.getByText('Olá turma!')).toBeInTheDocument()
    expect(screen.getByText('Boa noite!')).toBeInTheDocument()
  })

  it('exibe "Nenhuma mensagem ainda" quando conectado mas sem mensagens', async () => {
    await setup({ isAuthenticated: true, hasCredential: true, isConnected: true, messages: [] })
    render(<ComunidadePage />)
    expect(screen.getByText(/nenhuma mensagem/i)).toBeInTheDocument()
  })

  it('botão Sair chama logout', async () => {
    const logout = vi.fn()
    const { useAuth } = await import('../../hooks/useAuth.js')
    vi.mocked(useAuth).mockReturnValue({
      address: '0xAlumni' as `0x${string}`,
      isAuthenticated: true,
      authMethod: null,
      login: vi.fn(),
      logout,
    })

    const user = userEvent.setup()
    render(<ComunidadePage />)
    await user.click(screen.getByRole('button', { name: /sair/i }))
    expect(logout).toHaveBeenCalledOnce()
  })
})
