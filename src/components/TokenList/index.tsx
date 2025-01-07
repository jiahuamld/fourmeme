'use client';

import { useEffect, useState } from 'react';

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
        setError(data.message || '获取数据失败');
      }
    } catch (error) {
      console.error('获取Token列表失败:', error);
      setError('获取数据时发生错误');
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
      console.error('URL解码失败:', error);
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">
          <p>错误: {error}</p>
          <button 
            onClick={fetchTokens}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Token 列表</h1>
      
      {/* 排序按钮 */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => handleSort('market_cap')}
          className={`px-4 py-2 rounded ${
            sortField === 'market_cap' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          按市值排序 {sortField === 'market_cap' && (sortOrder === 'desc' ? '↓' : '↑')}
        </button>
        <button
          onClick={() => handleSort('volume_24h')}
          className={`px-4 py-2 rounded ${
            sortField === 'volume_24h' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          按交易量排序 {sortField === 'volume_24h' && (sortOrder === 'desc' ? '↓' : '↑')}
        </button>
        <button
          onClick={() => handleSort('created_at')}
          className={`px-4 py-2 rounded ${
            sortField === 'created_at' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          按时间排序 {sortField === 'created_at' && (sortOrder === 'desc' ? '↓' : '↑')}
        </button>
      </div>

      {/* Token列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tokens.length === 0 ? (
          <div className="col-span-3 text-center text-gray-500">
            暂无数据
          </div>
        ) : (
          tokens.map((token) => (
            <div key={token.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <img
                    src={decodeImageUrl(token.token_img_url)}
                    alt={token.token_name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h2 className="text-xl font-bold">{token.token_name}</h2>
                    <p className="text-gray-500">{token.ticker_symbol}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600">{token.token_description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">市值</p>
                    <p className="font-bold">${formatNumber(token.market_cap)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">24h交易量</p>
                    <p className="font-bold">${formatNumber(token.volume_24h)}</p>
                  </div>
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

                <div className="flex justify-between items-center text-sm">
                  <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded">
                    {token.chain}
                  </span>
                  <div className="flex gap-2">
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
            </div>
          ))
        )}
      </div>
    </div>
  );
} 