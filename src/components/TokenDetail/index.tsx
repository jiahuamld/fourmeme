'use client';

import { FC, useEffect, useState } from 'react';
import Image from 'next/image';

interface TokenDetailProps {
  address: string;
}

interface TokenData {
  id: number;
  token_img_url: string;
  token_name: string;
  ticker_symbol: string;
  token_description: string;
  raised_token: string;
  market_cap: string;
  volume_24h: string;
  website_url: string;
  twitter_url: string;
  telegram_url: string;
  tags: string[];
  chain: string;
  address: string;
  created_at: string;
  updated_at: string;
}

const TokenDetail: FC<TokenDetailProps> = ({ address }) => {
  const [token, setToken] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyAddress = async () => {
    if (token?.address) {
      try {
        await navigator.clipboard.writeText(token.address);
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
        const response = await fetch(`/api/token?address=${address}`);
        const data = await response.json();
        
        if (data.success) {
          setToken(data.data);
        } else {
          setError(data.message || '获取Token详情失败');
        }
      } catch (error) {
        setError('Error occurred while fetching token details');
      } finally {
        setLoading(false);
      }
    };

    fetchTokenDetail();
  }, [address]);

  const formatNumber = (num: string) => {
    const value = parseFloat(num);
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(2)}B`;
    }
    if (value >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M`;
    }
    if (value >= 1e3) {
      return `${(value / 1e3).toFixed(2)}K`;
    }
    return value.toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="min-h-[400px] flex justify-center items-center">
        <div className="text-red-500">
          <p>{error || 'Token not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
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
      <div className="relative z-10 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl p-6 mx-auto max-w-7xl my-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Token Basic Info */}
          <div className="w-full md:w-1/3">
            <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
              <img
                src={token.token_img_url}
                alt={token.token_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {token.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 backdrop-blur-md bg-white/5 border border-white/10 text-blue-200 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 mb-4">
              <span className="backdrop-blur-md bg-white/5 border border-white/10 text-purple-200 px-3 py-1 rounded-full">
                {token.chain}
              </span>
            </div>
          </div>

          {/* Token Details */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2 text-white">{token.token_name}</h1>
              <p className="text-gray-400 text-xl mb-4">{token.ticker_symbol}</p>
              <p className="text-gray-300 whitespace-pre-wrap">{token.token_description}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="backdrop-blur-md bg-white/5 border border-white/10 p-4 rounded-lg">
                <p className="text-gray-400 mb-1">Market Cap</p>
                <p className="text-2xl font-bold text-white">${formatNumber(token.market_cap)}</p>
              </div>
              <div className="backdrop-blur-md bg-white/5 border border-white/10 p-4 rounded-lg">
                <p className="text-gray-400 mb-1">24h Volume</p>
                <p className="text-2xl font-bold text-white">${formatNumber(token.volume_24h)}</p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4 text-white">Contract Address</h2>
              <div className="backdrop-blur-md bg-white/5 border border-white/10 p-4 rounded-lg break-all text-gray-300 relative group">
                <code>{token.address}</code>
                <button
                  onClick={handleCopyAddress}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-300 hover:text-blue-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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

            <div>
              <h2 className="text-xl font-bold mb-4 text-white">Social Media</h2>
              <div className="flex gap-4">
                {token.website_url && (
                  <a
                    href={token.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-300 hover:text-blue-200"
                  >
                    <span className="text-2xl">🌐</span>
                    <span>Website</span>
                  </a>
                )}
                {token.twitter_url && (
                  <a
                    href={token.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-300 hover:text-blue-200"
                  >
                    <span className="text-2xl">𝕏</span>
                    <span>Twitter</span>
                  </a>
                )}
                {token.telegram_url && (
                  <a
                    href={token.telegram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-300 hover:text-blue-200"
                  >
                    <span className="text-2xl">📱</span>
                    <span>Telegram</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenDetail; 