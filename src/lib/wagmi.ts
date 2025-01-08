import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { mainnet, bsc } from 'wagmi/chains'
import { WagmiConfig } from 'wagmi'

// 1. 获取projectId
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ''

// 2. 创建wagmi配置
const metadata = {
  name: 'FourMeme',
  description: 'FourMeme Web3 Platform',
  url: 'https://fourmeme.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [mainnet, bsc] as const

export const config = defaultWagmiConfig({ chains, projectId, metadata })

// 3. 创建modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  defaultChain: bsc,
  themeMode: 'dark'
})