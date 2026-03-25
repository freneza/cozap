import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createPublicClient } from 'viem'
import { useHasCredential } from './useHasCredential'

vi.mock('viem', async (importOriginal) => {
  const actual = await importOriginal<typeof import('viem')>()
  return { ...actual, createPublicClient: vi.fn() }
})

function mockPublicClient(readContract: ReturnType<typeof vi.fn>) {
  vi.mocked(createPublicClient).mockReturnValue({
    readContract,
  } as unknown as ReturnType<typeof createPublicClient>)
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_ALUMNI_SBT_ADDRESS = '0xContract1234'
})

describe('useHasCredential', () => {
  it('retorna null e isLoading false quando address é undefined', () => {
    const { result } = renderHook(() => useHasCredential(undefined))
    expect(result.current.hasCredential).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('retorna hasCredential true quando contrato retorna true', async () => {
    mockPublicClient(vi.fn().mockResolvedValue(true))

    const { result } = renderHook(() =>
      useHasCredential('0xAlumni1234' as `0x${string}`),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.hasCredential).toBe(true)
  })

  it('retorna hasCredential false quando contrato retorna false', async () => {
    mockPublicClient(vi.fn().mockResolvedValue(false))

    const { result } = renderHook(() =>
      useHasCredential('0xAlumni1234' as `0x${string}`),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.hasCredential).toBe(false)
  })

  it('isLoading é true enquanto a chamada está em andamento', async () => {
    let resolve!: (v: boolean) => void
    const pending = new Promise<boolean>((res) => {
      resolve = res
    })
    mockPublicClient(vi.fn().mockReturnValue(pending))

    const { result } = renderHook(() =>
      useHasCredential('0xAlumni1234' as `0x${string}`),
    )

    expect(result.current.isLoading).toBe(true)

    resolve(true)
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('retorna hasCredential false quando a chamada RPC falha', async () => {
    mockPublicClient(vi.fn().mockRejectedValue(new Error('network error')))

    const { result } = renderHook(() =>
      useHasCredential('0xAlumni1234' as `0x${string}`),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.hasCredential).toBe(false)
  })

  it('chama readContract com functionName hasCredential e address correto', async () => {
    const readContract = vi.fn().mockResolvedValue(true)
    mockPublicClient(readContract)

    const { result } = renderHook(() =>
      useHasCredential('0xAlumni1234' as `0x${string}`),
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(readContract).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: 'hasCredential',
        args: ['0xAlumni1234'],
      }),
    )
  })
})
