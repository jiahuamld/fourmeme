import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { bsc } from 'viem/chains'
import { type Chain } from 'viem'

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!

const metadata = {
  name: 'Launcher',
  description: 'Launcher Web3 App',
  url: 'https://launcher.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// 只使用 BSC 链
const chains: [Chain, ...Chain[]] = [bsc]  // BSC - 56

export const config = defaultWagmiConfig({ chains, projectId, metadata })

createWeb3Modal({ wagmiConfig: config, projectId }) 