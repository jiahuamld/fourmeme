'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Token {
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

export function TokenList() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTokens();
  }, [sortField, sortOrder]);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching tokens...'); // 调试日志
      const response = await fetch(`/api/tokens?sort=${sortField}&order=${sortOrder}`);
      const data = await response.json();
      console.log('Response:', data); // 调试日志
      
      if (data.success) {
        setTokens(data.data);
      } else {
        setError(data.message || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Failed to fetch token list:', error);
      setError('An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

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

  const decodeImageUrl = (url: string) => {
    try {
      return decodeURI(url);
    } catch (error) {
      console.error('URL decoding failed:', error);
      return url;
    }
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Sort buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => handleSort('market_cap')}
            className={`px-4 py-2 rounded flex items-center gap-1 ${
              sortField === 'market_cap' ? 'text-blue-500 font-bold' : 'text-gray-600'
            }`}
          >
            <span>Market Cap</span>
            {sortField === 'market_cap' && <span>{sortOrder === 'desc' ? '↓' : '↑'}</span>}
          </button>
          <button
            onClick={() => handleSort('volume_24h')}
            className={`px-4 py-2 rounded flex items-center gap-1 ${
              sortField === 'volume_24h' ? 'text-blue-500 font-bold' : 'text-gray-600'
            }`}
          >
            <span>Volume</span>
            {sortField === 'volume_24h' && <span>{sortOrder === 'desc' ? '↓' : '↑'}</span>}
          </button>
          <button
            onClick={() => handleSort('created_at')}
            className={`px-4 py-2 rounded flex items-center gap-1 ${
              sortField === 'created_at' ? 'text-blue-500 font-bold' : 'text-gray-600'
            }`}
          >
            <span>Time</span>
            {sortField === 'created_at' && <span>{sortOrder === 'desc' ? '↓' : '↑'}</span>}
          </button>
        </div>

        {/* Loading state */}
        <div className="min-h-[200px] flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Sort buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => handleSort('market_cap')}
            className={`px-4 py-2 rounded flex items-center gap-1 ${
              sortField === 'market_cap' ? 'text-blue-500 font-bold' : 'text-gray-600'
            }`}
          >
            <span>Market Cap</span>
            {sortField === 'market_cap' && <span>{sortOrder === 'desc' ? '↓' : '↑'}</span>}
          </button>
          <button
            onClick={() => handleSort('volume_24h')}
            className={`px-4 py-2 rounded flex items-center gap-1 ${
              sortField === 'volume_24h' ? 'text-blue-500 font-bold' : 'text-gray-600'
            }`}
          >
            <span>Volume</span>
            {sortField === 'volume_24h' && <span>{sortOrder === 'desc' ? '↓' : '↑'}</span>}
          </button>
          <button
            onClick={() => handleSort('created_at')}
            className={`px-4 py-2 rounded flex items-center gap-1 ${
              sortField === 'created_at' ? 'text-blue-500 font-bold' : 'text-gray-600'
            }`}
          >
            <span>Time</span>
            {sortField === 'created_at' && <span>{sortOrder === 'desc' ? '↓' : '↑'}</span>}
          </button>
        </div>

        {/* Error state */}
        <div className="min-h-[200px] flex justify-center items-center">
          <div className="text-red-500">
            <p>Error: {error}</p>
            <button 
              onClick={fetchTokens}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 py-8">
      {/* Sort buttons */}
      <div className="flex gap-4 mb-6 px-1">
        <button
          onClick={() => handleSort('market_cap')}
          className={`px-4 py-2 rounded flex items-center gap-1 ${
            sortField === 'market_cap' ? 'text-blue-500 font-bold' : 'text-gray-600'
          }`}
        >
          <span>Market Cap</span>
          {sortField === 'market_cap' && <span>{sortOrder === 'desc' ? '↓' : '↑'}</span>}
        </button>
        <button
          onClick={() => handleSort('volume_24h')}
          className={`px-4 py-2 rounded flex items-center gap-1 ${
            sortField === 'volume_24h' ? 'text-blue-500 font-bold' : 'text-gray-600'
          }`}
        >
          <span>Volume</span>
          {sortField === 'volume_24h' && <span>{sortOrder === 'desc' ? '↓' : '↑'}</span>}
        </button>
        <button
          onClick={() => handleSort('created_at')}
          className={`px-4 py-2 rounded flex items-center gap-1 ${
            sortField === 'created_at' ? 'text-blue-500 font-bold' : 'text-gray-600'
          }`}
        >
          <span>Time</span>
          {sortField === 'created_at' && <span>{sortOrder === 'desc' ? '↓' : '↑'}</span>}
        </button>
      </div>

      {/* Token list */}
      <div className="flex flex-wrap gap-2">
        {tokens.length === 0 ? (
          <div className="w-full text-center text-gray-500">
            No data available
          </div>
        ) : (
          tokens.map((token) => (
            <div key={token.id} className="bg-black rounded-lg shadow-lg overflow-hidden w-[180px] hover:shadow-xl transition-shadow">
              <Link href={`/token/${token.address}`} className="block">
                <div className="relative aspect-square bg-black">
                  <img
                    src={decodeImageUrl(token.token_img_url)}
                    alt={token.token_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-6"></div>
                </div>
                <div className="p-1 bg-black">
                  <div className="mb-1">
                    <p className="text-[8px] text-emerald-400 font-medium truncate mb-0.5">Created by: {token.address.slice(0, 8)}...{token.address.slice(-6)}</p>
                    <h2 className="text-sm font-bold truncate text-white tracking-wide">
                      {token.token_name} <span className="text-[10px]">({token.ticker_symbol})</span>
                    </h2>
                  </div>
                  
                  <div className="mb-1.5">
                    <p className="text-[9px] text-gray-300/80 line-clamp-2 leading-relaxed">{token.token_description}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[9px] text-gray-400 uppercase tracking-wider font-medium">Market Cap</p>
                      <p className="font-bold text-xs text-gray-400">${formatNumber(token.market_cap)}</p>
                    </div>
                    <div className="flex gap-1.5">
                      {token.website_url && (
                        <a
                          href={token.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white transition-colors text-xs"
                        >
                          🌐
                        </a>
                      )}
                      {token.twitter_url && (
                        <a
                          href={token.twitter_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white transition-colors text-xs"
                        >
                          𝕏
                        </a>
                      )}
                      {token.telegram_url && (
                        <a
                          href={token.telegram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white transition-colors text-xs"
                        >
                          📱
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 