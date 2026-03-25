'use client'

import { useState, useEffect } from 'react'
import { useWeb3Auth } from '@web3auth/modal-react-hooks'

type AuthMethod = 'embedded' | 'wallet' | null

type UseAuthResult = {
  address: `0x${string}` | undefined
  isAuthenticated: boolean
  authMethod: AuthMethod
  login: () => Promise<void>
  logout: () => Promise<void>
}

export function useAuth(): UseAuthResult {
  const { web3Auth, isConnected, provider, logout } = useWeb3Auth()
  const [address, setAddress] = useState<`0x${string}` | undefined>(undefined)

  useEffect(() => {
    if (!isConnected || !provider) {
      setAddress(undefined)
      return
    }

    provider
      .request<string[]>({ method: 'eth_accounts' })
      .then((accounts) => {
        setAddress(accounts?.[0] as `0x${string}` | undefined)
      })
      .catch(() => setAddress(undefined))
  }, [isConnected, provider])

  const adapterName = web3Auth?.connectedAdapterName ?? null
  const authMethod: AuthMethod = !isConnected
    ? null
    : adapterName === 'openlogin' || adapterName === 'auth'
      ? 'embedded'
      : 'wallet'

  async function login() {
    await web3Auth?.connect()
  }

  return {
    address,
    isAuthenticated: isConnected,
    authMethod,
    login,
    logout,
  }
}
