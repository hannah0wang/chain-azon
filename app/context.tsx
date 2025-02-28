'use client'
import { Web3OnboardProvider, init } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'

const INFURA_KEY = process.env.NEXT_PUBLIC_INFURA_API_KEY
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
const ethereumSepolia = {
  id: 11155111,
  token: 'ETH',
  label: 'Sepolia',
  rpcUrl: 'https://rpc.sepolia.org/'
}



const chains = [ethereumSepolia]
const wallets = [injectedModule()]

const web3Onboard = init({
  wallets,
  chains,
  appMetadata: {
    name: 'Web3-Onboard Demo',
    icon: '<svg>My App Icon</svg>',
    description: 'A demo of Web3-Onboard.'
  }
})

function Context({ children }: { children: React.ReactNode } ) {
  return (
    <Web3OnboardProvider web3Onboard={web3Onboard}>
      {children}
    </Web3OnboardProvider>
  )
}

export default Context