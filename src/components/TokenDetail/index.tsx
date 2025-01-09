'use client';

import { FC, useEffect, useState, useRef } from 'react';
import Image from 'next/image';

interface TokenDetailProps {
  address: string;
}

interface TokenData {
  id: string;
  name: string;
  symbol: string;
  deployer: string;
  userId: string;
  imageUrl: string;
  messageId: string;
  platform: string;
  contractAddress: string;
  chain: string;
  pair: string | null;
  market_cap: number | null;
  volume_24h: number | null;
  twitter_url: string | null;
  created_at: string;
  updated_at: string;
}

const TokenDetail: FC<TokenDetailProps> = ({ address }) => {
  const [token, setToken] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const geckoTerminalRef = useRef<HTMLIFrameElement>(null);
  const pancakeSwapRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    return () => {
      // 清理 iframe
      if (geckoTerminalRef.current) {
        geckoTerminalRef.current.src = 'about:blank';
      }
      if (pancakeSwapRef.current) {
        pancakeSwapRef.current.src = 'about:blank';
      }
    };
  }, []);

  const handleCopyAddress = async () => {
    if (token?.contractAddress) {
      try {
        await navigator.clipboard.writeText(token.contractAddress);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  useEffect(() => {
    const fetchTokenDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tokens/${address}`);
        const data = await response.json();
        
        if (data.code === 0) {
          setToken(data.data);
        } else {
          setError(data.message || '获取Token详情失败');
        }
      } catch (error) {
        setError('获取Token详情时发生错误');
      } finally {
        setLoading(false);
      }
    };

    fetchTokenDetail();
  }, [address]);

  const formatNumber = (num: number) => {
    if (num >= 1e9) {
      return `${(num / 1e9).toFixed(2)}B`;
    }
    if (num >= 1e6) {
      return `${(num / 1e6).toFixed(2)}M`;
    }
    if (num >= 1e3) {
      return `${(num / 1e3).toFixed(2)}K`;
    }
    return num.toFixed(2);
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col w-full">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/Launcher/bg.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.15
          }}
        />
        <div className="relative z-10 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl p-6 w-full max-w-7xl mx-auto my-8 flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="relative min-h-screen flex flex-col w-full">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/Launcher/bg.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.15
          }}
        />
        <div className="relative z-10 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl p-6 w-full max-w-7xl mx-auto my-8 flex-1 flex justify-center items-center">
          <div className="text-red-500">
            <p>{error || 'Token not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col w-full">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/Launcher/bg.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.15
        }}
      />
      
      {/* Content Area */}
      <div className="relative z-10 w-full flex-1 px-2">
        {/* Token Info Section */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 mb-2">
          <div className="px-4 py-4">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Token Basic Info */}
              <div className="w-full md:w-48 shrink-0">
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                  <img
                    src={token.imageUrl}
                    alt={token.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Token Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-1 text-white">{token.name}</h1>
                    <div className="flex items-center gap-3">
                      <p className="text-gray-400 text-lg">{token.symbol}</p>
                      <span className="backdrop-blur-xl bg-white/10 border border-white/10 text-purple-200 px-3 py-0.5 rounded-2xl text-sm">
                        {token.chain}
                      </span>
                    </div>
                  </div>
                  {token.twitter_url && (
                    <a
                      href={token.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-300 hover:text-blue-200"
                    >
                      <span className="text-2xl">𝕏</span>
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="backdrop-blur-xl bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-2xl">
                    <p className="text-gray-400 text-sm">Market Cap</p>
                    <p className="text-xl font-bold text-white">${formatNumber(token.market_cap || 0)}</p>
                  </div>
                  <div className="backdrop-blur-xl bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-2xl">
                    <p className="text-gray-400 text-sm">24h Volume</p>
                    <p className="text-xl font-bold text-white">${formatNumber(token.volume_24h || 0)}</p>
                  </div>
                  <div className="backdrop-blur-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl col-span-2 md:col-span-1">
                    <p className="text-gray-400 text-sm mb-1">Contract Address</p>
                    <div className="flex items-center gap-2">
                      <code className="text-gray-300 text-sm truncate">{token.contractAddress}</code>
                      <button
                        onClick={handleCopyAddress}
                        className="text-emerald-300 hover:text-emerald-200 transition-colors duration-200"
                      >
                        {copySuccess ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-gray-300 text-sm whitespace-pre-wrap">{token.messageId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* iframes section */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {/* Left iframe - GeckoTerminal */}
          <div className="overflow-hidden h-[800px] md:col-span-5 rounded-2xl border border-white/10 backdrop-blur-md bg-white/5">
            <iframe
              ref={geckoTerminalRef}
              src={`https://www.geckoterminal.com/${token.chain}/pools/${token.contractAddress}?embed=1&info=0&swaps=0&grayscale=0&light_chart=0`}
              className="w-full h-full"
              frameBorder="0"
              allow="clipboard-write"
            />
          </div>
          
          {/* Right iframe - PancakeSwap */}
          <div className="overflow-hidden h-[800px] md:col-span-2 rounded-2xl border border-white/10 backdrop-blur-md bg-white/5">
            <iframe
              ref={pancakeSwapRef}
              src="https://pancakeswap.finance/"
              className="w-full h-full"
              style={{
                transform: 'scale(0.7)',
                transformOrigin: '0 0',
                width: '142.86%',
                height: '142.86%',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
              frameBorder="0"
              allow="clipboard-write"
              scrolling="no"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenDetail; 