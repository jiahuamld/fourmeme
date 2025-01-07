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
        setError('获取Token详情时发生错误');
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
          <p>{error || '未找到Token信息'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Token 基本信息 */}
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
                className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full">
              {token.chain}
            </span>
          </div>
        </div>

        {/* Token 详细信息 */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{token.token_name}</h1>
            <p className="text-gray-500 text-xl mb-4">{token.ticker_symbol}</p>
            <p className="text-gray-700 whitespace-pre-wrap">{token.token_description}</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-500 mb-1">市值</p>
              <p className="text-2xl font-bold">${formatNumber(token.market_cap)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-500 mb-1">24h交易量</p>
              <p className="text-2xl font-bold">${formatNumber(token.volume_24h)}</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">合约地址</h2>
            <div className="bg-gray-50 p-4 rounded-lg break-all">
              <code>{token.address}</code>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">社交媒体</h2>
            <div className="flex gap-4">
              {token.website_url && (
                <a
                  href={token.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
                >
                  <span className="text-2xl">🌐</span>
                  <span>官网</span>
                </a>
              )}
              {token.twitter_url && (
                <a
                  href={token.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
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
                  className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
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
  );
};

export default TokenDetail; 