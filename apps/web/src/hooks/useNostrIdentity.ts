'use client'

import { useMemo } from 'react'
import { generateSecretKey, getPublicKey } from 'nostr-tools'

const STORAGE_KEY = 'nostr_privkey'

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function loadOrCreateKeypair(): { pubkey: string; privkey: Uint8Array } {
  let stored: string | null = null
  try {
    stored = localStorage.getItem(STORAGE_KEY)
  } catch {
    // localStorage indisponível (SSR)
  }

  if (stored && stored.length === 64) {
    const privkey = hexToBytes(stored)
    return { pubkey: getPublicKey(privkey), privkey }
  }

  const privkey = generateSecretKey()
  const pubkey = getPublicKey(privkey)

  try {
    localStorage.setItem(STORAGE_KEY, bytesToHex(privkey))
  } catch {
    // silencioso
  }

  return { pubkey, privkey }
}

type UseNostrIdentityResult = {
  pubkey: string
  privkey: Uint8Array
}

export function useNostrIdentity(): UseNostrIdentityResult {
  return useMemo(() => loadOrCreateKeypair(), [])
}
