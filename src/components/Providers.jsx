'use client'

import React, { ReactNode, useEffect, useState } from 'react'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { WagmiProvider } from 'wagmi'
import { defineChain } from 'viem'
import { sepolia } from 'viem/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 0. Setup queryClient is now done inside the component

import { wagmiConfig, projectId } from '../lib/config'

export function Providers({ children }) {
  const [mounted, setMounted] = useState(false)
  const [queryClient] = useState(() => new QueryClient())

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
