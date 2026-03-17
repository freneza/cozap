import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import * as nostrTools from 'nostr-tools'
import { useNostrIdentity } from './useNostrIdentity.js'

vi.mock('nostr-tools', async (importOriginal) => {
  const actual = await importOriginal<typeof import('nostr-tools')>()
  return { ...actual, generateSecretKey: vi.fn(), getPublicKey: vi.fn() }
})

const MOCK_PRIVKEY_A = new Uint8Array(32).fill(1)
const MOCK_PRIVKEY_B = new Uint8Array(32).fill(2)
const MOCK_PUBKEY_A = 'pubkey_aaaaaa'
const MOCK_PUBKEY_B = 'pubkey_bbbbbb'

beforeEach(() => {
  localStorage.clear()
  vi.mocked(nostrTools.generateSecretKey).mockReturnValue(MOCK_PRIVKEY_A)
  vi.mocked(nostrTools.getPublicKey).mockImplementation((pk) =>
    pk === MOCK_PRIVKEY_A || (pk instanceof Uint8Array && pk[0] === 1)
      ? MOCK_PUBKEY_A
      : MOCK_PUBKEY_B,
  )
})

describe('useNostrIdentity', () => {
  it('retorna pubkey e privkey na primeira chamada', () => {
    const { result } = renderHook(() => useNostrIdentity())
    expect(result.current.pubkey).toBe(MOCK_PUBKEY_A)
    expect(result.current.privkey).toEqual(MOCK_PRIVKEY_A)
  })

  it('reutiliza o mesmo keypair em chamadas subsequentes', () => {
    // Segunda chamada geraria um keypair diferente se não houvesse persistência
    vi.mocked(nostrTools.generateSecretKey)
      .mockReturnValueOnce(MOCK_PRIVKEY_A)
      .mockReturnValueOnce(MOCK_PRIVKEY_B)

    const { result: r1 } = renderHook(() => useNostrIdentity())
    const { result: r2 } = renderHook(() => useNostrIdentity())

    // r2 deve reutilizar MOCK_PRIVKEY_A do localStorage, não gerar MOCK_PRIVKEY_B
    expect(r2.current.pubkey).toBe(r1.current.pubkey)
    expect(r2.current.privkey).toEqual(r1.current.privkey)
  })

  it('persiste o keypair no localStorage', () => {
    renderHook(() => useNostrIdentity())
    expect(localStorage.getItem('nostr_privkey')).toHaveLength(64)
  })

  it('pubkey deriva da privkey armazenada', () => {
    renderHook(() => useNostrIdentity())
    const stored = localStorage.getItem('nostr_privkey')!
    expect(stored).toBeTruthy()
    // Confirma que getPublicKey foi chamado com a privkey gerada
    expect(vi.mocked(nostrTools.getPublicKey)).toHaveBeenCalledWith(MOCK_PRIVKEY_A)
  })
})
