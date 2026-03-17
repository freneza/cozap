import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { SimplePool, finalizeEvent } from 'nostr-tools'
import { useSendMessage } from './useSendMessage.js'

vi.mock('nostr-tools', async (importOriginal) => {
  const actual = await importOriginal<typeof import('nostr-tools')>()
  return { ...actual, SimplePool: vi.fn(), finalizeEvent: vi.fn() }
})

const CHANNEL_ID = 'channel123'
const RELAY_URLS = ['wss://relay.test']
const PRIVKEY = new Uint8Array(32).fill(1)
const MOCK_EVENT = { id: 'ev1', kind: 42, content: 'oi', pubkey: 'pub1', created_at: 1, tags: [], sig: 'sig1' }

function makePool(publishResult: Promise<unknown> = Promise.resolve('ok')) {
  const pool = { publish: vi.fn().mockReturnValue([publishResult]), close: vi.fn() }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(SimplePool).mockImplementation(function (this: any) {
    return pool as unknown as SimplePool
  })
  return pool
}

beforeEach(() => {
  makePool()
  vi.mocked(finalizeEvent).mockReturnValue(MOCK_EVENT as ReturnType<typeof finalizeEvent>)
})

describe('useSendMessage', () => {
  it('chama finalizeEvent com kind 42 e channelId correto', async () => {
    const { result } = renderHook(() =>
      useSendMessage(CHANNEL_ID, RELAY_URLS, PRIVKEY),
    )

    await act(async () => {
      await result.current.sendMessage('Olá!')
    })

    expect(vi.mocked(finalizeEvent)).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 42,
        content: 'Olá!',
        tags: expect.arrayContaining([['e', CHANNEL_ID, '', 'root']]),
      }),
      PRIVKEY,
    )
  })

  it('error é null após publish com sucesso', async () => {
    const { result } = renderHook(() =>
      useSendMessage(CHANNEL_ID, RELAY_URLS, PRIVKEY),
    )

    await act(async () => {
      await result.current.sendMessage('Teste')
    })

    expect(result.current.error).toBeNull()
  })

  it('isSending é false após publish concluído', async () => {
    const { result } = renderHook(() =>
      useSendMessage(CHANNEL_ID, RELAY_URLS, PRIVKEY),
    )

    await act(async () => {
      await result.current.sendMessage('Teste')
    })

    expect(result.current.isSending).toBe(false)
  })

  it('error é preenchido se publish falhar', async () => {
    makePool(Promise.reject(new Error('Relay recusou')))

    const { result } = renderHook(() =>
      useSendMessage(CHANNEL_ID, RELAY_URLS, PRIVKEY),
    )

    await act(async () => {
      try {
        await result.current.sendMessage('Teste')
      } catch {
        // esperado
      }
    })

    expect(result.current.error).toBe('Relay recusou')
  })

  it('isSending é true durante o publish', async () => {
    let resolve!: () => void
    const pending = new Promise<string>((res) => {
      resolve = () => res('ok')
    })
    makePool(pending)

    const { result } = renderHook(() =>
      useSendMessage(CHANNEL_ID, RELAY_URLS, PRIVKEY),
    )

    let sendingDuringPublish = false
    act(() => {
      result.current.sendMessage('Teste').then(() => {
        sendingDuringPublish = false
      })
      sendingDuringPublish = result.current.isSending
    })

    resolve()
    await act(async () => {})
    expect(result.current.isSending).toBe(false)
  })
})
