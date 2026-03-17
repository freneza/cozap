'use client'

import { useState } from 'react'
import { createWalletClient, custom, parseAbi } from 'viem'
import { polygon } from 'viem/chains'
import { useWeb3Auth } from '@web3auth/modal-react-hooks'

const ABI = parseAbi([
  'function issueCredential(address to, bytes32 credentialHash) external returns (uint256)',
])

function getContractAddress(): `0x${string}` {
  const addr = process.env.NEXT_PUBLIC_ALUMNI_SBT_ADDRESS
  if (!addr) throw new Error('NEXT_PUBLIC_ALUMNI_SBT_ADDRESS não configurado')
  return addr as `0x${string}`
}

type UseAlumniSBTResult = {
  issueCredential(to: `0x${string}`, hash: `0x${string}`): Promise<`0x${string}`>
  isLoading: boolean
  error: string | null
}

export function useAlumniSBT(): UseAlumniSBTResult {
  const { provider } = useWeb3Auth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function issueCredential(to: `0x${string}`, hash: `0x${string}`): Promise<`0x${string}`> {
    if (!provider) throw new Error('Carteira não conectada')
    const CONTRACT_ADDRESS = getContractAddress()

    setIsLoading(true)
    setError(null)

    try {
      const walletClient = createWalletClient({
        chain: polygon,
        transport: custom(provider),
      })

      const [account] = await walletClient.getAddresses()
      if (!account) throw new Error('Nenhuma conta disponível')

      const txHash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'issueCredential',
        args: [to, hash],
        account,
      })

      return txHash
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao emitir credencial'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { issueCredential, isLoading, error }
}
