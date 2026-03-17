'use client'

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

  const address = isConnected
    ? (provider as { selectedAddress?: string } | null)?.selectedAddress as
        | `0x${string}`
        | undefined
    : undefined

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
