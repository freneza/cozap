import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWeb3Auth } from '@web3auth/modal-react-hooks'
import { createWalletClient } from 'viem'
import { useAlumniSBT } from './useAlumniSBT.js'

vi.mock('@web3auth/modal-react-hooks', () => ({
  useWeb3Auth: vi.fn(),
}))

vi.mock('viem', async (importOriginal) => {
  const actual = await importOriginal<typeof import('viem')>()
  return { ...actual, createWalletClient: vi.fn() }
})

const mockTxHash = '0xdeadbeef' as `0x${string}`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockProvider = { request: vi.fn() } as any

function mockWalletClient(writeContract: ReturnType<typeof vi.fn>) {
  vi.mocked(createWalletClient).mockReturnValue({
    getAddresses: vi.fn().mockResolvedValue(['0xAdmin1234' as `0x${string}`]),
    writeContract,
  } as unknown as ReturnType<typeof createWalletClient>)
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_ALUMNI_SBT_ADDRESS = '0xContract1234'
  vi.mocked(useWeb3Auth).mockReturnValue({
    provider: mockProvider,
    isConnected: true,
    isInitialized: true,
    isInitializing: false,
    initError: null,
    isConnecting: false,
    connectError: null,
    userInfo: null,
    isMFAEnabled: false,
    status: null,
    web3Auth: null,
    connect: vi.fn(),
    enableMFA: vi.fn(),
    manageMFA: vi.fn(),
    logout: vi.fn(),
    addAndSwitchChain: vi.fn(),
    addPlugin: vi.fn(),
    getPlugin: vi.fn(),
    authenticateUser: vi.fn(),
    addChain: vi.fn(),
    switchChain: vi.fn(),
  } as unknown as ReturnType<typeof useWeb3Auth>)
  mockWalletClient(vi.fn().mockResolvedValue(mockTxHash))
})

describe('useAlumniSBT', () => {
  it('inicia com isLoading false e error null', () => {
    const { result } = renderHook(() => useAlumniSBT())
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('issueCredential chama writeContract com args corretos e retorna txHash', async () => {
    const mockWrite = vi.fn().mockResolvedValue(mockTxHash)
    mockWalletClient(mockWrite)

    const { result } = renderHook(() => useAlumniSBT())
    let txHash: `0x${string}` | undefined

    await act(async () => {
      txHash = await result.current.issueCredential(
        '0xAlumni1234' as `0x${string}`,
        '0xHash1234' as `0x${string}`,
      )
    })

    expect(txHash).toBe(mockTxHash)
    expect(mockWrite).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: 'issueCredential',
        args: ['0xAlumni1234', '0xHash1234'],
      }),
    )
  })

  it('isLoading é false após conclusão da transação', async () => {
    const { result } = renderHook(() => useAlumniSBT())

    await act(async () => {
      await result.current.issueCredential(
        '0xAlumni1234' as `0x${string}`,
        '0xHash1234' as `0x${string}`,
      )
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('error é preenchido se a transação falhar', async () => {
    mockWalletClient(vi.fn().mockRejectedValue(new Error('Sem saldo para gas')))

    const { result } = renderHook(() => useAlumniSBT())

    await act(async () => {
      try {
        await result.current.issueCredential(
          '0xAlumni1234' as `0x${string}`,
          '0xHash1234' as `0x${string}`,
        )
      } catch {
        // esperado
      }
    })

    expect(result.current.error).toBe('Sem saldo para gas')
  })
})
