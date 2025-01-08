'use client';

// components/WalletConnectModal.tsx
import React, { useState, ReactElement } from 'react';
import { Modal, Button, message } from 'antd';
import Image from 'next/image';
import { createWalletClient, custom, WalletClient, Chain } from 'viem';
import * as chains from 'viem/chains';
import binanceIcon from '@/assets/Launcher/Wallet/binance.png';

const getChain = (chainId: number): Chain | undefined => {
  return Object.values(chains).find((v: any) => v.id === chainId);
};

type WalletConnectModalProps = {
  open: boolean;
  onClose: () => void;
};

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ open, onClose }): ReactElement => {
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<{ address: string; type: "metamask" | "okx" | "binance" | null }>({
    address: '',
    type: null
  });

  // 断开当前连接
  const disconnectCurrentWallet = () => {
    setWalletClient(null);
    setConnectedWallet({ address: '', type: null });
  };

  // 连接币安钱包
  const handleConnectBinance = async () => {
    try {
      // 如果已经有连接的钱包，先断开
      if (connectedWallet.type) {
        disconnectCurrentWallet();
      }

      const binanceWallet = (window as any).BinanceChain;
      if (!binanceWallet) {
        throw new Error('Binance Wallet is not installed');
      }

      const targetChain = getChain(1); // Ethereum 主网
      const chainIdHex = '0x1'; // 固定使用以太坊主网的chainId

      try {
        await binanceWallet.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await binanceWallet.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: chainIdHex,
                chainName: targetChain?.name,
                nativeCurrency: targetChain?.nativeCurrency,
                rpcUrls: [targetChain?.rpcUrls.default.http[0]],
                blockExplorerUrls: [targetChain?.blockExplorers?.default.url],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }

      const client = createWalletClient({
        chain: targetChain!,
        transport: custom(binanceWallet),
      });

      const [address] = await client.requestAddresses();
      setWalletClient(client);
      if (address) {
        setConnectedWallet({ address, type: 'binance' });
        message.success(`Binance Wallet Connected: ${address}`);
        onClose();
      } else {
        throw new Error('Failed to get wallet address');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to connect Binance Wallet');
    }
  };

  // 连接 MetaMask
  const handleConnectMetaMask = async () => {
    try {
      // 如果已经有连接的钱包，先断开
      if (connectedWallet.type) {
        disconnectCurrentWallet();
      }

      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const targetChain = getChain(1); // Ethereum 主网
      const chainIdHex = '0x1'; // 固定使用以太坊主网的chainId

      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: chainIdHex,
                chainName: targetChain?.name,
                nativeCurrency: targetChain?.nativeCurrency,
                rpcUrls: [targetChain?.rpcUrls.default.http[0]],
                blockExplorerUrls: [targetChain?.blockExplorers?.default.url],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }

      const client = createWalletClient({
        chain: targetChain!,
        transport: custom(ethereum),
      });

      const [address] = await client.requestAddresses();
      setWalletClient(client);
      if (address) {
        setConnectedWallet({ address, type: 'metamask' });
        message.success(`MetaMask Connected: ${address}`);
        onClose();
      } else {
        throw new Error('Failed to get wallet address');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to connect MetaMask');
    }
  };

  // 连接 OKX
  const handleConnectOKX = async () => {
    try {
      // 如果已经有连接的钱包，先断开
      if (connectedWallet.type) {
        disconnectCurrentWallet();
      }

      const okxWallet = (window as any).okxwallet;
      if (!okxWallet) {
        throw new Error('OKX Wallet is not installed');
      }

      // 检查支持的链类型，这里假设支持 EVM 链
      const targetChain = getChain(1); // Ethereum 主网
      const chainIdHex = '0x1'; // 固定使用以太坊主网的chainId

      try {
        await okxWallet.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await okxWallet.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: chainIdHex,
                chainName: targetChain?.name,
                nativeCurrency: targetChain?.nativeCurrency,
                rpcUrls: [targetChain?.rpcUrls.default.http[0]],
                blockExplorerUrls: [targetChain?.blockExplorers?.default.url],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }

      const client = createWalletClient({
        chain: targetChain!,
        transport: custom(okxWallet),
      });

      const [address] = await client.requestAddresses();
      setWalletClient(client);
      if (address) {
        setConnectedWallet({ address, type: 'okx' });
        message.success(`OKX Wallet Connected: ${address}`);
        onClose();
      } else {
        throw new Error('Failed to get wallet address');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to connect OKX Wallet');
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2 px-4 pt-4">
          <span className="text-xl font-semibold text-[#4FBA88]">Connect Wallet</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      className="wallet-connect-modal"
      styles={{
        content: {
          background: '#000000',
        },
        mask: {
          background: 'rgba(0, 0, 0, 0.7)',
        },
        header: {
          background: '#000000',
          borderBottom: 'none',
          padding: '0',
        }
      }}
    >
      <div className="flex p-4">
        {/* 左侧钱包列表 */}
        <div className="flex-1 pr-8">
          <p className="text-gray-400 mb-4">
            First, connect one of the following wallets. Please securely store your private keys or mnemonic phrases and never share them with anyone.
          </p>
          <div className="space-y-3">
            <div 
              onClick={handleConnectBinance}
              className="flex items-center p-3 hover:bg-[#1f1f1f] rounded-xl cursor-pointer transition-all"
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
                <div className="text-sm text-gray-400">Binance Official Wallet</div>
              </div>
            </div>


            
            <div 
              onClick={handleConnectMetaMask}
              className="flex items-center p-3 hover:bg-[#1f1f1f] rounded-xl cursor-pointer transition-all"
            >
              <div className="w-12 h-12 flex-shrink-0">
                <Image 
                  src="https://pbs.twimg.com/profile_images/1514275943300284417/2Ubgzfgg_400x400.jpg" 
                  alt="MetaMask" 
                  width={48} 
                  height={48} 
                  className="rounded-xl"
                />
              </div>
              <div className="ml-3 flex-grow">
                <div className="font-medium text-white">MetaMask</div>
                <div className="text-sm text-gray-400">Most Popular Crypto Wallet</div>
              </div>
            </div>

            <div 
              onClick={handleConnectOKX}
              className="flex items-center p-3 hover:bg-[#1f1f1f] rounded-xl cursor-pointer transition-all"
            >
              <div className="w-12 h-12 flex-shrink-0">
                <Image 
                  src="https://pbs.twimg.com/profile_images/1873911184954712065/nUfQZKah_400x400.jpg" 
                  alt="OKX" 
                  width={48} 
                  height={48} 
                  className="rounded-xl"
                />
              </div>
              <div className="ml-3 flex-grow">
                <div className="font-medium text-white">OKX Wallet</div>
                <div className="text-sm text-gray-400">Official OKX Wallet</div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧提示区域 */}
        <div className="w-72 flex flex-col p-8 bg-[#1C1C1C] rounded-2xl">
          <div className="text-white/60 text-sm mb-2">Web3 Wallet</div>
          <div className="text-xl text-white font-medium mb-6">No Wallet ?</div>
          <div className="text-white/60 text-sm mb-8">
            A Web3 wallet is not just a tool for managing your digital assets, but also your passport to the Web3 world.
          </div>
          <div className="flex-grow" />
          <Button 
            type="link"
            className="flex items-center text-blue-400 hover:text-blue-300 transition-colors text-sm"
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
