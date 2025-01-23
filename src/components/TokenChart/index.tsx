import { FC, useRef, useEffect } from 'react';

interface TokenChartProps {
  token: {
    name: string;
    chain: string;
    imageUrl: string;
    market_cap: number | null;
    volume_24h: number | null;
    contractAddress: string;
    deployer: string;
  };
  onCopyAddress: () => void;
}

const TokenChart: FC<TokenChartProps> = ({ token, onCopyAddress }) => {
  const geckoTerminalRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    return () => {
      if (geckoTerminalRef.current) {
        geckoTerminalRef.current.src = 'about:blank';
      }
    };
  }, []);

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
    const chainMap: { [key: string]: string } = {
      'bnb': 'bsc',

    };
    return chainMap[chain.toLowerCase()] || chain.toLowerCase();
  };

  return (
    <div className="overflow-hidden rounded-[32px] border border-white/10 backdrop-blur-md bg-[#0D111C]/80 h-[700px] flex flex-col">
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
                  onClick={onCopyAddress}
                  className="text-emerald-300 hover:text-emerald-200 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <div className="flex items-stretch bg-[#0F172A] border border-[#2DD4BF] rounded-[32px] overflow-hidden">
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
  );
};

export default TokenChart; 