'use client'

import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { defineChain } from 'viem'
import { sepolia } from 'viem/chains'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'b9ece87e120b27c5b29b1cebcc177b94'

const metadata = {
  name: 'EduChain Admin',
  description: 'Admin portal for the EduChain application',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

export const privateChain = defineChain({
  id: 31337,
  name: 'Hardhat Localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
  },
})

export const chains = [privateChain, sepolia]

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
})
