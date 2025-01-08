'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Token {
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
            <div key={token.id} className="relative w-[180px] group">
              <Link href={`/token/${token.contractAddress}`} className="block bg-gray-800/40 backdrop-blur-md rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-700/50 hover:border-gray-500">
                <div className="relative aspect-square bg-gray-900/50">
                  <img
                    src={decodeImageUrl(token.imageUrl)}
                    alt={token.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent h-12"></div>
                </div>
                <div className="p-2 bg-gray-800/60 backdrop-blur-md border-t border-gray-700/50">
                  <div className="mb-1.5">
                    <p className="text-[8px] text-emerald-300 font-medium truncate mb-0.5">Created by: {token.deployer.slice(0, 8)}...{token.deployer.slice(-6)}</p>
                    <h2 className="text-sm font-bold truncate text-gray-100 tracking-wide">
                      {token.name} <span className="text-[10px] text-gray-300">({token.symbol})</span>
                    </h2>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[9px] text-gray-400 uppercase tracking-wider font-medium">Market Cap</p>
                      <p className="font-bold text-xs text-gray-200">${formatNumber(token.market_cap?.toString() || '0')}</p>
                    </div>
                  </div>
                </div>
              </Link>
              {token.twitter_url && (
                <a
                  href={token.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2 right-2 bg-gray-800/70 backdrop-blur-xl p-1.5 rounded-full hover:bg-gray-700/80 transition-all duration-300 border border-gray-600/50 hover:border-gray-500/70 shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white" className="opacity-90">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 