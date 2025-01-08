import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { mainnet, bsc } from 'wagmi/chains'
import { WagmiConfig } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'

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

// 添加币安钱包连接器
const binanceConnector = injected({
  shimDisconnect: true,
})

// 添加 WalletConnect 连接器作为备选
const walletConnectConnector = walletConnect({ 
  projectId,
  metadata,
})

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  connectors: [
    binanceConnector,
    walletConnectConnector,
  ],
})

// 3. 创建modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  defaultChain: bsc,
  themeMode: 'dark',
  includeWalletIds: ['c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96'], // Binance Wallet ID
  excludeWalletIds: [], // 不排除任何钱包
  tokens: {
    56: {
      address: '0x0000000000000000000000000000000000000000',
      image: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
    },
  },
})