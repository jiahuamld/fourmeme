'use client';

// components/WalletConnectModal.tsx
import React, { useState, ReactElement, useEffect } from 'react';
import { Modal, Button, message } from 'antd';
import Image from 'next/image';
import { createWalletClient, custom, WalletClient, Chain } from 'viem';
import { bsc } from 'viem/chains';
import binanceIcon from '@/assets/Launcher/Wallet/binance.png';
import metamaskIcon from '@/assets/Launcher/Wallet/metamask.png';
import { QRCodeSVG } from 'qrcode.react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useConnect, useDisconnect, useBalance, usePublicClient } from 'wagmi';

const getChain = (chainId: number): Chain | undefined => {
  return chainId === 56 ? bsc : undefined;
};

type WalletConnectModalProps = {
  open: boolean;
  onClose: () => void;
};

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ open, onClose }): ReactElement => {
  const { open: openWeb3Modal } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient();
  const { data: balance } = useBalance({
    address: address,
  });
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<{ address: string; type: "metamask" | "okx" | "binance" | "walletconnect" | null }>({
    address: '',
    type: null
  });

  // 统一处理打开 WalletConnect
  const handleOpenWalletConnect = async () => {
    onClose();
    await openWeb3Modal();
  };

  useEffect(() => {
    if (isConnected && address) {
      setConnectedWallet({
        address,
        type: 'walletconnect'
      });
      
      // 打印连接信息
      console.log('=== 钱包连接信息 ===');
      console.log('钱包地址:', address);
      console.log('连接状态:', isConnected ? '已连接' : '未连接');
      console.log('当前网络:', publicClient && {
        id: publicClient.chain.id,
        name: publicClient.chain.name
      });
      console.log('账户余额:', {
        value: balance?.value,
        formatted: balance?.formatted,
        symbol: balance?.symbol
      });
      console.log('==================');
      
      onClose();
    }
  }, [isConnected, address, publicClient, balance, onClose]);

  const disconnectCurrentWallet = () => {
    setWalletClient(null);
    setConnectedWallet({ address: '', type: null });
    disconnect();
  };

  const handleConnectBinance = async () => {
    try {
      if (connectedWallet.type) {
        disconnectCurrentWallet();
      }

      const binanceWallet = (window as any).BinanceChain;
      
      // 如果没有安装币安钱包，使用WalletConnect
      if (!binanceWallet) {
        await handleOpenWalletConnect();
        return;
      }

      const targetChain = bsc; // BSC mainnet

      const client = createWalletClient({
        chain: targetChain,
        transport: custom(binanceWallet),
      });

      const [address] = await client.requestAddresses();
      setWalletClient(client);
      if (address) {
        setConnectedWallet({ address, type: 'binance' });
        // 打印币安钱包连接信息
        console.log('=== 币安钱包连接信息 ===');
        console.log('钱包地址:', address);
        console.log('连接状态: 已连接');
        console.log('当前网络:', {
          id: bsc.id,
          name: bsc.name
        });
        console.log('==================');
        message.success(`Binance Wallet Connected: ${address}`);
        onClose();
      } else {
        throw new Error('Failed to get wallet address');
      }
    } catch (error: any) {
      // 如果用户拒绝连接，则使用 WalletConnect
      if (error.message.includes('rejected') || error.message.includes('User rejected')) {
        await handleOpenWalletConnect();
        return;
      }
      message.error(error.message || 'Failed to connect Binance Wallet');
    }
  };

  const handleConnectMetaMask = async () => {
    try {
      if (connectedWallet.type) {
        disconnectCurrentWallet();
      }

      const ethereum = (window as any).ethereum;
      
      // 严格检查是否真的是 MetaMask
      if (!ethereum?.isMetaMask) {
        await handleOpenWalletConnect();
        return;
      }

      const client = createWalletClient({
        chain: bsc,
        transport: custom(ethereum)
      });

      const [address] = await client.requestAddresses();
      setWalletClient(client);
      
      if (address) {
        setConnectedWallet({ address, type: 'metamask' });
        console.log('=== MetaMask 连接信息 ===');
        console.log('钱包地址:', address);
        console.log('连接状态: 已连接');
        console.log('当前网络:', {
          id: bsc.id,
          name: bsc.name
        });
        console.log('==================');
        message.success(`MetaMask Connected: ${address}`);
        onClose();
      } else {
        throw new Error('Failed to get wallet address');
      }
    } catch (error: any) {
      // 如果用户拒绝连接，则使用 WalletConnect
      if (error.message.includes('rejected') || error.message.includes('User rejected')) {
        await handleOpenWalletConnect();
        return;
      }
      message.error(error.message || 'Failed to connect MetaMask');
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center px-4">
          <span className="text-xl font-semibold text-[#4FBA88]">Connect Wallet</span>
        </div>
      }
      open={open}
      onCancel={() => {
        disconnectCurrentWallet();
        onClose();
      }}
      footer={null}
      width={800}
      centered
      className="wallet-connect-modal"
      styles={{
        content: {
          background: 'linear-gradient(180deg, rgba(13, 12, 15, 0.98) 0%, rgba(13, 12, 15, 0.95) 30%, rgba(67, 27, 133, 0.95) 80%, rgba(88, 35, 173, 0.92) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(88, 35, 173, 0.25), 0 0 2px rgba(139, 92, 246, 0.3)',
          backdropFilter: 'blur(10px)',
        },
        header: {
          background: 'transparent',
          padding: '16px 0',
        },
        mask: {
          background: 'rgba(13, 12, 15, 0.75)',
          backdropFilter: 'blur(4px)',
        },
      }}
    >
      <div className="flex p-4">
        <div className="flex-1 pr-8">
          <p className="text-gray-400 mb-4">
            First, connect one of the following wallets. Please securely store your private keys or mnemonic phrases and never share them with anyone.
          </p>
          <div className="space-y-3">
            <div 
              onClick={handleConnectBinance}
              className="flex items-center p-3 hover:bg-[#1A1527] border border-purple-900/20 rounded-xl cursor-pointer transition-all duration-300 bg-[#1A1527]/30 backdrop-blur-sm hover:border-purple-900/40"
            >
              <div className="w-12 h-12 flex-shrink-0">
                <Image 
                  src={binanceIcon}
                  alt="Binance" 
                  width={48} 
                  height={48} 
                  className="rounded-xl"
                />
              </div>
              <div className="ml-3 flex-grow">
                <div className="font-medium text-white">Binance Wallet</div>
                <div className="text-sm text-purple-300/60">Binance Official Wallet</div>
              </div>
            </div>
            <div 
              onClick={handleConnectMetaMask}
              className="flex items-center p-3 hover:bg-[#1A1527] border border-purple-900/20 rounded-xl cursor-pointer transition-all duration-300 bg-[#1A1527]/30 backdrop-blur-sm hover:border-purple-900/40"
            >
              <div className="w-12 h-12 flex-shrink-0">
                <Image 
                  src={metamaskIcon}
                  alt="MetaMask" 
                  width={48} 
                  height={48} 
                  className="rounded-xl"
                />
              </div>
              <div className="ml-3 flex-grow">
                <div className="font-medium text-white">MetaMask</div>
                <div className="text-sm text-purple-300/60">Most Popular Web3 Wallet</div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-72 flex flex-col p-8 bg-[#1A1527]/80 border border-purple-900/20 rounded-2xl backdrop-blur-sm">
          <div className="text-purple-300/60 text-sm mb-2">Web3 Wallet</div>
          <div className="text-xl text-white font-medium mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">No Wallet?</div>
          <div className="text-purple-200/60 text-sm mb-8">
            A Web3 wallet is not just a tool for managing your digital assets, but also your passport to the Web3 world.
          </div>
          <div className="flex-grow" />
          <Button 
            type="link"
            className="flex items-center text-purple-400 hover:text-purple-300 transition-colors text-sm"
            onClick={() => window.open('https://metamask.io/download/', '_blank')}
          >
            Learn How to Connect
            <span className="ml-1">↗</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default WalletConnectModal;
