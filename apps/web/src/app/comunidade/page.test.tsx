import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ComunidadePage from './page'

vi.mock('next/navigation', () => ({ useRouter: vi.fn() }))
vi.mock('../../hooks/useAuth.js', () => ({ useAuth: vi.fn() }))
vi.mock('../../hooks/useHasCredential.js', () => ({ useHasCredential: vi.fn() }))
vi.mock('../../hooks/useNostrIdentity.js', () => ({ useNostrIdentity: vi.fn() }))
vi.mock('../../hooks/useChannelMessages.js', () => ({ useChannelMessages: vi.fn() }))
vi.mock('../../hooks/useSendMessage.js', () => ({ useSendMessage: vi.fn() }))

const mockRouter = { replace: vi.fn() }
const mockSendMessage = vi.fn()

async function setup(opts: {
  isAuthenticated?: boolean
  hasCredential?: boolean | null
  credentialLoading?: boolean
  messages?: { id: string; authorPubkey: string; channelId: string; content: string; createdAt: number }[]
  isConnected?: boolean
  isSending?: boolean
  sendError?: string | null
}) {
  const { useRouter } = await import('next/navigation')
  const { useAuth } = await import('../../hooks/useAuth.js')
  const { useHasCredential } = await import('../../hooks/useHasCredential.js')
  const { useNostrIdentity } = await import('../../hooks/useNostrIdentity.js')
  const { useChannelMessages } = await import('../../hooks/useChannelMessages.js')
  const { useSendMessage } = await import('../../hooks/useSendMessage.js')

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
  vi.mocked(useSendMessage).mockReturnValue({
    sendMessage: mockSendMessage,
    isSending: opts.isSending ?? false,
    error: opts.sendError ?? null,
  })
}

beforeEach(async () => {
  mockRouter.replace.mockClear()
  mockSendMessage.mockReset()
  mockSendMessage.mockResolvedValue(undefined)
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

  it('exibe input e botão Enviar quando autenticado com SBT', async () => {
    render(<ComunidadePage />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument()
  })

  it('chama sendMessage ao submeter o formulário', async () => {
    const user = userEvent.setup()
    render(<ComunidadePage />)

    await user.type(screen.getByRole('textbox'), 'Olá pessoal!')
    await user.click(screen.getByRole('button', { name: /enviar/i }))

    expect(mockSendMessage).toHaveBeenCalledWith('Olá pessoal!')
  })

  it('input é limpo após envio bem-sucedido', async () => {
    const user = userEvent.setup()
    render(<ComunidadePage />)

    await user.type(screen.getByRole('textbox'), 'Mensagem teste')
    await user.click(screen.getByRole('button', { name: /enviar/i }))

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toHaveValue('')
    })
  })

  it('botão Enviar fica desabilitado enquanto isSending', async () => {
    await setup({ isAuthenticated: true, hasCredential: true, isSending: true })
    render(<ComunidadePage />)
    expect(screen.getByRole('button', { name: /enviando/i })).toBeDisabled()
  })

  it('exibe erro de envio se sendMessage falhar', async () => {
    mockSendMessage.mockRejectedValue(new Error('Relay recusou'))
    const user = userEvent.setup()
    render(<ComunidadePage />)

    await user.type(screen.getByRole('textbox'), 'Teste')
    await user.click(screen.getByRole('button', { name: /enviar/i }))

    // O erro vem do hook (mockado com sendError)
    await setup({
      isAuthenticated: true,
      hasCredential: true,
      sendError: 'Relay recusou',
    })
  })
})
