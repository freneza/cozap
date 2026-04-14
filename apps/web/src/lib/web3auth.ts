import { WEB3AUTH_NETWORK } from '@web3auth/base'
import type { IAdapter } from '@web3auth/base'
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider'
import { Web3AuthOptions } from '@web3auth/modal'
import { Web3AuthContextConfig } from '@web3auth/modal-react-hooks'
import { MetamaskAdapter } from '@web3auth/metamask-adapter'

const chainConfig = {
  chainNamespace: 'eip155' as const,
  chainId: '0x13882', // Polygon Amoy (80002)
  rpcTarget: 'https://rpc-amoy.polygon.technology',
  displayName: 'Polygon Amoy Testnet',
  blockExplorerUrl: 'https://amoy.polygonscan.com',
  ticker: 'POL',
  tickerName: 'POL',
}

const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } })

const web3AuthOptions: Web3AuthOptions = {
  clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID ?? '',
  web3AuthNetwork:
    process.env.NODE_ENV === 'production'
      ? WEB3AUTH_NETWORK.SAPPHIRE_MAINNET
      : WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider,
}

const metamaskAdapter = new MetamaskAdapter({
  clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID ?? '',
  web3AuthNetwork:
    process.env.NODE_ENV === 'production'
      ? WEB3AUTH_NETWORK.SAPPHIRE_MAINNET
      : WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
})

export const web3AuthConfig: Web3AuthContextConfig = {
  web3AuthOptions,
  adapters: [metamaskAdapter as unknown as IAdapter<unknown>],
}
