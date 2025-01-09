'use client';

import { FC, useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Tweet } from 'react-tweet';

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
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/api/tokens/${address}`);
        const data = await response.json();
        
        if (data.code === 0) {
          setToken(data.data);
        } else {
          setError(data.message || '获取Token详情失败');
        }
      } catch (error) {
        setError('获取Token详情时发生错误');
        console.error('Error fetching token:', error);
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

  const getChainName = (chain: string) => {
    return chain.toLowerCase() === 'bnb' ? 'bsc' : chain.toLowerCase();
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
        {/* iframes section */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-2">
          {/* Left side - Chart */}
          <div className="md:col-span-5 flex flex-col">
            {/* Chart Container */}
            <div className="overflow-hidden rounded-2xl border border-white/10 backdrop-blur-md bg-[#0D111C]/80 h-[700px] flex flex-col">
              {/* Token Info Bar */}
              <div className="p-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-4">
                  <img
                    src={token.imageUrl}
                    alt={token.name}
                    className="w-10 h-10 rounded-full border border-white/10"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-lg font-bold text-[#2DD4BF]">{token.name} / {token.chain}</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">Market Cap</span>
                        <p className="text-white text-sm font-medium">${formatNumber(token.market_cap || 0)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">Virtual Liquidity</span>
                        <p className="text-white text-sm font-medium">${formatNumber(token.volume_24h || 0)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">Volume</span>
                        <p className="text-white text-sm font-medium">${formatNumber(token.volume_24h || 0)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">CA</span>
                        <code className="text-gray-300 text-sm truncate max-w-[120px]">{token.contractAddress}</code>
                        <button
                          onClick={handleCopyAddress}
                          className="text-emerald-300 hover:text-emerald-200 transition-colors duration-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        <div className="flex items-stretch bg-[#0F172A] border border-[#2DD4BF] rounded-lg overflow-hidden">
                          <div className="w-8 bg-[#2DD4BF] flex items-center justify-center">
                            <svg className="w-4 h-4 text-[#0F172A]" viewBox="0 0 24 24" fill="currentColor">
                              <path fillRule="evenodd" clipRule="evenodd" d="M12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4ZM6 8C6 4.68629 8.68629 2 12 2C15.3137 2 18 4.68629 18 8C18 11.3137 15.3137 14 12 14C8.68629 14 6 11.3137 6 8Z"/>
                              <path fillRule="evenodd" clipRule="evenodd" d="M12 14C8.13401 14 5 17.134 5 21C5 21.5523 4.55228 22 4 22C3.44772 22 3 21.5523 3 21C3 16.0294 7.02944 12 12 12C16.9706 12 21 16.0294 21 21C21 21.5523 20.5523 22 20 22C19.4477 22 19 21.5523 19 21C19 17.134 15.866 14 12 14Z"/>
                            </svg>
                          </div>
                          <code className="text-[#2DD4BF] text-sm font-medium px-3">
                            {token.deployer?.slice(0, 6)}...{token.deployer?.slice(-5)}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chart iframe */}
              <div className="flex-1">
                <iframe
                  ref={geckoTerminalRef}
                  src={`https://www.geckoterminal.com/${getChainName(token.chain)}/pools/${token.contractAddress}?embed=1&info=0&swaps=0&grayscale=0&light_chart=0`}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="clipboard-write"
                />
              </div>
            </div>
          </div>
          
          {/* Right iframe - PancakeSwap */}
          <div className="overflow-hidden h-[700px] md:col-span-2 rounded-2xl border border-white/10 backdrop-blur-md bg-white/5">
            <iframe
              ref={pancakeSwapRef}
              src="https://pancakeswap.finance/"
              className="w-full h-full"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
              frameBorder="0"
              allow="clipboard-write"
              scrolling="no"
            />
          </div>
        </div>

        {/* Second Row: Tweet and Token Info */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {/* Left side - Tweet */}
          <div className="md:col-span-5">
            {token.userId && token.messageId ? (
              <div className="w-full overflow-hidden dark">
                <Tweet id={token.messageId} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p className="text-gray-400 text-lg">No tweet available</p>
              </div>
            )}
          </div>

          {/* Right side - Token Info */}
          <div className="backdrop-blur-xl bg-[#0D111C]/80 border border-white/10 rounded-[32px] p-8 md:col-span-2">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 mb-6">
                <img
                  src={token.imageUrl}
                  alt={token.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">{token.name}</h1>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl text-gray-400">{token.symbol}</span>
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                <span className="backdrop-blur-xl bg-white/5 border border-white/10 text-purple-200 px-3 py-1 rounded-full text-sm">
                  {token.chain}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 px-6 py-4 rounded-2xl">
                <p className="text-gray-400 text-sm mb-1">Market Cap</p>
                <p className="text-2xl font-bold text-white">${formatNumber(token.market_cap || 0)}</p>
              </div>
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 px-6 py-4 rounded-2xl">
                <p className="text-gray-400 text-sm mb-1">24h Volume</p>
                <p className="text-2xl font-bold text-white">${formatNumber(token.volume_24h || 0)}</p>
              </div>
            </div>

            <div className="mt-4 backdrop-blur-xl bg-white/5 border border-white/10 px-6 py-4 rounded-2xl">
              <div className="flex flex-col">
                <p className="text-gray-400 text-sm mb-1">Contract Address</p>
                <div className="flex items-center gap-2">
                  <code className="text-gray-300 text-sm truncate flex-1">{token.contractAddress}</code>
                  <button
                    onClick={handleCopyAddress}
                    className="shrink-0 text-emerald-300 hover:text-emerald-200 transition-colors duration-200 backdrop-blur-xl bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl"
                  >
                    {copySuccess ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenDetail; 