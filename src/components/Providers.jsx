'use client'

import React, { ReactNode, useEffect, useState } from 'react'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { WagmiProvider } from 'wagmi'
import { defineChain } from 'viem'
import { sepolia } from 'viem/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get a project ID from https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'b9ece87e120b27c5b29b1cebcc177b94'

// 2. Create wagmiConfig
const metadata = {
  name: 'EduChain Admin',
  description: 'Admin portal for the EduChain application',
  url: 'https://web3modal.com', // origin domain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Define your private chain
const privateChain = defineChain({
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

const chains = [privateChain, sepolia]
export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true, // Enable SSR support for Wagmi
})

export function Providers({ children }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Initialize Web3Modal only on the client
    createWeb3Modal({
      wagmiConfig,
      projectId,
      enableAnalytics: true,
      enableOnramp: true,
      enableSocials: false
    })
    setMounted(true)
  }, [])

  // Avoid hydration mismatch by waiting for mount
  if (!mounted) return <div className="min-h-screen bg-slate-50" />

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
