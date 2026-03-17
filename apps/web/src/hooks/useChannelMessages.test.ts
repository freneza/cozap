import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { SimplePool } from 'nostr-tools'
import { useChannelMessages } from './useChannelMessages.js'

vi.mock('nostr-tools', async (importOriginal) => {
  const actual = await importOriginal<typeof import('nostr-tools')>()
  return { ...actual, SimplePool: vi.fn() }
})

type OneEventCb = (event: unknown) => void

function makePool() {
  const sub = { close: vi.fn() }
  const pool = {
    subscribeMany: vi.fn().mockReturnValue(sub),
    close: vi.fn(),
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(SimplePool).mockImplementation(function (this: any) {
    return pool as unknown as SimplePool
  })
  return { pool, sub }
}

// Captura o callback onevent do subscribeMany e permite dispará-lo nos testes
function makePoolWithEventCapture() {
  let capturedOnEvent: OneEventCb | undefined
  const sub = { close: vi.fn() }
  const pool = {
    subscribeMany: vi.fn().mockImplementation(
      (_relays: string[], _filters: unknown, handlers: { onevent: OneEventCb }) => {
        capturedOnEvent = handlers.onevent
        return sub
      },
    ),
    close: vi.fn(),
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(SimplePool).mockImplementation(function (this: any) {
    return pool as unknown as SimplePool
  })
  return {
    pool,
    sub,
    triggerEvent: (event: unknown) => capturedOnEvent?.(event),
  }
}

const CHANNEL_ID = 'channel123'
const RELAY_URLS = ['wss://relay.test']

const makeEvent = (overrides = {}) => ({
  id: 'event1',
  pubkey: 'pubkey1',
  kind: 42,
  content: 'Olá, comunidade!',
  created_at: 1700000001,
  tags: [['e', CHANNEL_ID, '', 'root']],
  ...overrides,
})

beforeEach(() => {
  makePool()
})

describe('useChannelMessages', () => {
  it('retorna array vazio de mensagens inicialmente', () => {
    const { result } = renderHook(() =>
      useChannelMessages(CHANNEL_ID, RELAY_URLS),
    )
    expect(result.current.messages).toEqual([])
  })

  it('isConnected é true após subscribeMany ser chamado', () => {
    const { result } = renderHook(() =>
      useChannelMessages(CHANNEL_ID, RELAY_URLS),
    )
    expect(result.current.isConnected).toBe(true)
  })

  it('adiciona mensagem ao estado quando onevent é disparado', async () => {
    const { triggerEvent } = makePoolWithEventCapture()

    const { result } = renderHook(() =>
      useChannelMessages(CHANNEL_ID, RELAY_URLS),
    )

    act(() => {
      triggerEvent(makeEvent())
    })

    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].content).toBe('Olá, comunidade!')
  })

  it('mensagens são ordenadas por createdAt crescente', async () => {
    const { triggerEvent } = makePoolWithEventCapture()

    const { result } = renderHook(() =>
      useChannelMessages(CHANNEL_ID, RELAY_URLS),
    )

    act(() => {
      triggerEvent(makeEvent({ id: 'e2', created_at: 1700000002, content: 'Segunda' }))
      triggerEvent(makeEvent({ id: 'e1', created_at: 1700000001, content: 'Primeira' }))
    })

    expect(result.current.messages[0].content).toBe('Primeira')
    expect(result.current.messages[1].content).toBe('Segunda')
  })

  it('chama subscribeMany com filtro kind 42 e channelId correto', () => {
    const { pool } = makePoolWithEventCapture()

    renderHook(() => useChannelMessages(CHANNEL_ID, RELAY_URLS))

    expect(pool.subscribeMany).toHaveBeenCalledWith(
      RELAY_URLS,
      expect.arrayContaining([
        expect.objectContaining({
          kinds: [42],
          '#e': [CHANNEL_ID],
        }),
      ]),
      expect.objectContaining({ onevent: expect.any(Function) }),
    )
  })

  it('mapeia evento Nostr para ChannelMessage corretamente', () => {
    const { triggerEvent } = makePoolWithEventCapture()

    const { result } = renderHook(() =>
      useChannelMessages(CHANNEL_ID, RELAY_URLS),
    )

    act(() => {
      triggerEvent(
        makeEvent({
          id: 'eventX',
          pubkey: 'pubkeyX',
          content: 'Mensagem teste',
          created_at: 1700001000,
        }),
      )
    })

    const msg = result.current.messages[0]
    expect(msg.id).toBe('eventX')
    expect(msg.authorPubkey).toBe('pubkeyX')
    expect(msg.channelId).toBe(CHANNEL_ID)
    expect(msg.content).toBe('Mensagem teste')
    expect(msg.createdAt).toBe(1700001000)
  })
})
