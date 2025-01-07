import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { gameStateAtom } from '@/store/atoms';
import eventBus, { EVENTS } from '@/utils/eventBus.js';

type ScoreFields = 'balance' | 'income' | 'knowledgePoints' | 'connections';

interface LeaderboardItem {
  playerID: number;
  name?: string;
  balance?: number;
  income?: number;
  knowledgePoints?: number;
  connections?: number;
}

interface LeaderboardButton {
  type: 'wealth' | 'income' | 'knowledge' | 'social';
  icon: React.ReactNode;
  label: string;
  color: string;
  scoreField: ScoreFields;
  formatScore: (value: number) => string;
}

export function LeaderboardButtons() {
  const [activeType, setActiveType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LeaderboardItem[]>([]);
  const gameState = useRecoilValue(gameStateAtom);

  const getPlayerName = (id: number) => {
    const player = gameState.players?.find(p => 
      String(p.playerID || p.id) === String(id)
    );
    const name = player?.name || `Player ${id}`;
    return `${name} <${id}>`;
  };

  const formatNumber = (value: number) => {
    return value.toString();
  };

  const buttons: LeaderboardButton[] = [
    {
      type: 'wealth',
      icon: <span className="text-3xl">🏆</span>,
      label: 'Wealth',
      color: 'text-yellow-500 hover:text-yellow-600',
      scoreField: 'balance',
      formatScore: (value) => `$${formatNumber(value)}`,
    },
    {
      type: 'income',
      icon: <span className="text-3xl">💰</span>,
      label: 'Income',
      color: 'text-green-500 hover:text-green-600',
      scoreField: 'income',
      formatScore: (value) => `$${formatNumber(value)} in the last 24 hours`,
    },
    {
      type: 'knowledge',
      icon: <span className="text-3xl">📚</span>,
      label: 'Knowledge',
      color: 'text-blue-500 hover:text-blue-600',
      scoreField: 'knowledgePoints',
      formatScore: (value) => `${formatNumber(value)} knowledge points`,
    },
    {
      type: 'social',
      icon: <span className="text-3xl">👥</span>,
      label: 'Social',
      color: 'text-purple-500 hover:text-purple-600',
      scoreField: 'connections',
      formatScore: (value) => `${value} connections in the last 7 days`,
    },
  ];

  const fetchLeaderboard = async (type: string) => {
    if (type === activeType) {
      setActiveType(null);
      setData([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://backend.agiverse.io/api/v1/leaderboard/${type}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      const data = await response.json();
      setData(data);
      setActiveType(type);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActiveButton = () => buttons.find(b => b.type === activeType);

  const getRankBadge = (index: number) => {
    const baseStyle = "w-12 h-12 flex items-center justify-center rounded-xl font-bold text-2xl relative";
    
    if (index === 0) {
      return (
        <div className={`${baseStyle} bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 text-white shadow-[0_0_15px_rgba(234,179,8,0.3)]`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)] rounded-xl" />
          <span className="drop-shadow-md">1</span>
        </div>
      );
    }
    if (index === 1) {
      return (
        <div className={`${baseStyle} bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 text-white shadow-[0_0_15px_rgba(148,163,184,0.3)]`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.2),transparent)] rounded-xl" />
          <span className="drop-shadow-md">2</span>
        </div>
      );
    }
    if (index === 2) {
      return (
        <div className={`${baseStyle} bg-gradient-to-br from-orange-300 via-orange-400 to-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.3)]`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.2),transparent)] rounded-xl" />
          <span className="drop-shadow-md">3</span>
        </div>
      );
    }
    return (
      <div className="w-8 h-8 flex items-center justify-center text-gray-400 font-medium text-sm">
        {index + 1}
      </div>
    );
  };

  const getRankStyle = (index: number) => {
    const baseStyle = "flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group relative";
    
    if (index === 0) {
      return `${baseStyle} bg-gradient-to-r from-yellow-50 to-transparent border border-yellow-200/30 shadow-lg`;
    }
    if (index === 1) {
      return `${baseStyle} bg-gradient-to-r from-slate-50 to-transparent border border-slate-200/30 shadow-md`;
    }
    if (index === 2) {
      return `${baseStyle} bg-gradient-to-r from-orange-50 to-transparent border border-orange-200/30 shadow-md`;
    }
    return `${baseStyle} hover:bg-gray-50/80`;
  };

  return (
    <div className="fixed top-20 right-4 z-50 flex items-start gap-6">
      {/* Leaderboard Panel */}
      {activeType && (
        <div className="w-[480px] bg-black/50 backdrop-blur-md rounded-2xl shadow-lg max-h-[85vh] overflow-y-auto border border-gray-100/20">
          <div className="sticky top-0 bg-black/50 backdrop-blur-md p-6 border-b border-gray-100/20">
            <div className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10">
                {getActiveButton()?.icon}
              </div>
              <span className="bg-gradient-to-br from-white via-white to-purple-200 bg-clip-text text-transparent">
                {getActiveButton()?.label} Leaderboard
              </span>
            </div>
          </div>
          
          <div className="p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                <span className="text-purple-500 font-medium animate-pulse">Loading leaderboard...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {data.map((item, index) => {
                  const activeButton = getActiveButton();
                  if (!activeButton) return null;
                  const scoreValue = item[activeButton.scoreField];
                  if (typeof scoreValue === 'undefined') return null;

                  return (
                    <div 
                      key={item.playerID} 
                      className={`${getRankStyle(index)} cursor-pointer`}
                      onClick={() => {
                        eventBus.emit(EVENTS.SELECT_AND_SHOW_INFO_PLAYER, item.playerID);
                      }}
                    >
                      {getRankBadge(index)}
                      <div className="flex-1">
                        <div className={`font-semibold ${
                          index === 0 
                            ? 'text-yellow-500' 
                            : index === 1 
                              ? 'text-slate-400'
                              : index === 2 
                                ? 'text-orange-400'
                                : 'text-white'
                        }`}>
                          {getPlayerName(item.playerID)}
                        </div>
                        <div className={`text-sm ${index < 3 ? 'text-gray-900' : activeButton.color}`}>
                          {activeButton.formatScore(scoreValue)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

    
      <div className="flex flex-col gap-3">
        {buttons.map((button) => (
          <button
            key={button.type}
            onClick={() => fetchLeaderboard(button.type)}
            className={`
              flex flex-col items-center
              p-3
              rounded-xl
              w-20
              h-20
              border
              transition-all
              relative
              overflow-hidden
              text-white
              ${activeType === button.type 
                ? `
                  bg-black/50
                  backdrop-blur-md
                  border-purple-300
                  shadow-lg
                  after:absolute
                  after:bottom-0
                  after:left-0
                  after:w-full
                  after:h-full
                  after:bg-gradient-to-t
                  after:from-purple-200/20
                  after:via-purple-100/10
                  after:to-transparent
                  after:backdrop-blur-[1px]
                ` 
                : `
                  bg-black/50
                  backdrop-blur-md
                  border-gray-100/20
                  hover:border-purple-200
                  after:absolute
                  after:bottom-0
                  after:left-0
                  after:w-full
                  after:h-1/2
                  after:bg-gradient-to-t
                  after:from-purple-50/10
                  after:to-transparent
                `
              }
            `}
          >
            <span className="text-xs font-medium z-10">
              {button.label}
            </span>
            <div className="absolute bottom-0 right-0 w-12 h-12 flex items-center justify-center z-10">
              {button.icon}
            </div>

    
            {activeType === button.type && (
              <div className="absolute -left-1 w-1 h-8 bg-gradient-to-b from-purple-400 to-purple-500 rounded-full shadow-sm" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
} 