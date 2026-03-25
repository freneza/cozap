'use client'

import { useState, useEffect } from 'react'
import { createPublicClient, http, parseAbi } from 'viem'
import { polygonAmoy } from 'viem/chains'

const ABI = parseAbi(['function hasCredential(address account) view returns (bool)'])

type UseHasCredentialResult = {
  hasCredential: boolean | null
  isLoading: boolean
}

export function useHasCredential(
  address: `0x${string}` | undefined,
): UseHasCredentialResult {
  const [hasCredential, setHasCredential] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!address) return

    const contractAddress = process.env.NEXT_PUBLIC_ALUMNI_SBT_ADDRESS
    if (!contractAddress) return

    const client = createPublicClient({
      chain: polygonAmoy,
      transport: http(
        process.env.NEXT_PUBLIC_AMOY_RPC_URL ?? 'https://rpc-amoy.polygon.technology',
      ),
    })

    setIsLoading(true)

    client
      .readContract({
        address: contractAddress as `0x${string}`,
        abi: ABI,
        functionName: 'hasCredential',
        args: [address],
      })
      .then((result) => {
        setHasCredential(result)
      })
      .catch(() => {
        setHasCredential(false)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [address])

  return { hasCredential, isLoading }
}
