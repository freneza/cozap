'use client'

import { Web3AuthProvider } from '@web3auth/modal-react-hooks'
import { web3AuthConfig } from '../lib/web3auth'

export function Providers({ children }: { children: React.ReactNode }) {
  return <Web3AuthProvider config={web3AuthConfig}>{children}</Web3AuthProvider>
}
