import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import * as dotenv from 'dotenv'

dotenv.config()

const deployerKey = process.env.DEPLOYER_PRIVATE_KEY

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.27',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    amoy: {
      url: 'https://rpc-amoy.polygon.technology',
      chainId: 80002,
      accounts: deployerKey ? [deployerKey] : [],
    },
  },
}

export default config
