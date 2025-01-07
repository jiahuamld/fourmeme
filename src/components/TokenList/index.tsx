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

      {/* Token list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {tokens.length === 0 ? (
          <div className="col-span-4 text-center text-gray-500">
            No data available
          </div>
        ) : (
          tokens.map((token) => (
            <div key={token.id} className="bg-white rounded-lg shadow-lg overflow-hidden w-[240px] hover:shadow-xl transition-shadow">
              <Link href={`/token/${token.address}`} className="block">
                <div className="relative aspect-square">
                  <img
                    src={decodeImageUrl(token.token_img_url)}
                    alt={token.token_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent h-12"></div>
                </div>
                <div className="p-2">
                  <div className="mb-2">
                    <h2 className="text-base font-bold truncate">{token.token_name}</h2>
                    <p className="text-gray-500 text-xs">{token.ticker_symbol}</p>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-xs text-gray-600 line-clamp-2">{token.token_description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <p className="text-xs text-gray-500">Market Cap</p>
                      <p className="font-bold text-xs">${formatNumber(token.market_cap)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">24h Volume</p>
                      <p className="font-bold text-xs">${formatNumber(token.volume_24h)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {token.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full text-[10px]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-[10px]">
                    <span className="bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">
                      {token.chain}
                    </span>
                    <div className="flex gap-1.5">
                      {token.website_url && (
                        <a
                          href={token.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          🌐
                        </a>
                      )}
                      {token.twitter_url && (
                        <a
                          href={token.twitter_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          𝕏
                        </a>
                      )}
                      {token.telegram_url && (
                        <a
                          href={token.telegram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
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