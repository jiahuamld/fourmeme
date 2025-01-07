"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Menu, X } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { Layout, Input, Select } from 'antd';
import { 
  SearchOutlined, 
  UserOutlined, 
  HomeOutlined, 
  MenuOutlined, 
  CloseOutlined, 
  EnvironmentOutlined,
  MessageOutlined,
  PictureOutlined,
  RobotOutlined,
  InfoCircleOutlined,
  UsergroupAddOutlined,
  ThunderboltOutlined,
  HistoryOutlined,
  TrophyOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useRecoilState, useRecoilValue } from 'recoil';
import { gameStateAtom, selectedItemAtom, searchQueryAtom, lastSearchAtom, getBuildingPlayersSelector } from '@/store/atoms';
import logo from "@/assets/logo.png";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { PlayerMoments } from './PlayerMoments';
import { PlayerChatHistory } from './PlayerChatHistory';
import eventBus, { EVENTS } from '@/utils/eventBus.js';
import AgentChat from '@/map/mapgame/scenes/GameScene/components/AgentChat';
import PlayerInfoPanel from './PlayerInfoPanel';
import { LeaderboardPanel } from './LeaderboardPanel';
import { useSearchParams } from 'next/navigation';
import { TransactionSummary } from './TransactionSummary';
import { useGame } from "@/app/hooks/useGame";

dayjs.extend(relativeTime);

const { Sider, Content } = Layout;

interface SearchResult {
  type: 'player' | 'building';
  id: string;
  name: string;
  data: any;
}

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
}

interface Player {
  id: string;
  playerID?: string;
  name: string;
  location: string;
  description: string;
  [key: string]: any;
}

interface DetailedPlayer extends Player {
  [key: string]: any;
}

interface Building {
  id: string;
  buildingID?: string;
  name: string;
  smartActions?: {
    [key: string]: {
      payload?: string;
      payment?: string;
    };
  };
  entrance?: {
    x: number;
    y: number;
  };
}

interface DetailedBuilding extends Building {
  location: string;
  description: string;
  [key: string]: any;
}

type DetailedItem = DetailedPlayer | DetailedBuilding;

export function MapUI() {
  const { lastMessage, enableWebSocket, isEnabled } = useGame();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState('player-info');
  const [chatActive, setChatActive] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [showSearch, setShowSearch] = useState(true);
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useRecoilState(searchQueryAtom);
  const [lastSearch, setLastSearch] = useRecoilState(lastSearchAtom);
  const [selectedItem, setSelectedItem] = useRecoilState(selectedItemAtom);
  const [gameState, setGameState] = useRecoilState(gameStateAtom);

  useEffect(() => {
    const playerID = searchParams.get('playerID');
    if (playerID) {
      handlePlayerSelection(playerID);
    }
  }, [gameState.players]);

  const currentBuildingPlayers = useRecoilValue(getBuildingPlayersSelector(selectedItem?.id));

  useEffect(() => {
    const handleGamePlayerSelected = (playerID: string | null) => {
      if (playerID === null) {
        setSelectedItem({ type: null, id: null });
        setSearchQuery('');
      } else {
        const player = gameState.players?.find(p => String(p.playerID) === String(playerID));
        if (player) {
          setSelectedItem({
            type: 'player',
            id: String(playerID)
          });
          setActiveTab('player-info');
        }
      }
    };

    const handleGameBuildingSelected = (buildingID: string | null) => {
      if (buildingID === null) {
        setSelectedItem({ type: null, id: null });
        setSearchQuery('');
      } else {
        const building = gameState.buildings?.find(b => String(b.buildingID || b.id) === String(buildingID));
        if (building) {
          setSelectedItem({
            type: 'building',
            id: String(buildingID)
          });
        }
      }
    };

    const handleSwitchToBuildingInfo = () => {
      setActiveTab('building-info');
    };

    eventBus.on(EVENTS.PLAYER_SELECTED, handleGamePlayerSelected);
    eventBus.on(EVENTS.BUILDING_SELECTED, handleGameBuildingSelected);
    eventBus.on(EVENTS.SWITCH_TO_BUILDING_INFO, handleSwitchToBuildingInfo);
    
    return () => {
      eventBus.off(EVENTS.PLAYER_SELECTED, handleGamePlayerSelected);
      eventBus.off(EVENTS.BUILDING_SELECTED, handleGameBuildingSelected);
      eventBus.off(EVENTS.SWITCH_TO_BUILDING_INFO, handleSwitchToBuildingInfo);
    };
  }, [gameState.players, gameState.buildings]);

  useEffect(() => {
    const handleGameStateUpdate = (event: { type: string; data: any }) => {
      if (event.type === 'PLAYER_BUILDING_CHANGED') {
        setGameState(prevState => ({
          ...prevState,
          players: event.data.players
        }));
      }
    };

    eventBus.on(EVENTS.GAME_STATE_UPDATED, handleGameStateUpdate);
    return () => {
      eventBus.off(EVENTS.GAME_STATE_UPDATED, handleGameStateUpdate);
    };
  }, [setGameState]);

  const playerMenuItems: MenuItem[] = [
    { key: 'player-info', icon: <InfoCircleOutlined className="text-lg" />, label: 'Info' },
    { key: 'player-moments', icon: <PictureOutlined className="text-lg" />, label: 'Stories' },
    { key: 'player-chat-history', icon: <MessageOutlined className="text-lg" />, label: 'Chat History' },
    { key: 'player-chat-agent', icon: <RobotOutlined className="text-lg" />, label: 'Chat with Agent' },
    { key: 'transaction-summary', icon: <ThunderboltOutlined className="text-lg" />, label: 'Transactions' },
  ];

  const buildingMenuItems: MenuItem[] = [
    { 
      key: 'building-info',
      icon: <InfoCircleOutlined className="text-lg" />, 
      label: 'info'
    },
    { 
      key: 'building-players', 
      icon: <UsergroupAddOutlined className="text-lg" />, 
      label: 'Players in Building' 
    },
  ];

  const selectedBuilding = selectedItem.type === 'building' && gameState.buildings?.find(b => 
    String(b.buildingID || b.id) === selectedItem.id
  );
  
  if (selectedBuilding && selectedBuilding.smartActions) {
    buildingMenuItems.push({ 
      key: 'building-actions', 
      icon: <ThunderboltOutlined className="text-lg" />, 
      label: 'Smart Actions' 
    });
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getSearchResults = (): SearchResult[] => {
    if (!searchQuery) return [];

    const results: SearchResult[] = [];
    const query = searchQuery.toLowerCase();

    if (Array.isArray(gameState.players)) {
      gameState.players.forEach(player => {
        const playerId = String(player.playerID || player.id);
        const playerName = player.name.toLowerCase();
        const playerIdMatch = playerId.toLowerCase().includes(query);
        const playerNameMatch = playerName.includes(query);
        
        if (playerIdMatch || playerNameMatch) {
          results.push({
            type: 'player',
            id: playerId,
            name: player.name,
            data: player,
          });
        }
      });
    }

    if (Array.isArray(gameState.buildings)) {
      gameState.buildings.forEach(building => {
        const buildingId = String(building.buildingID || building.id);
        const buildingName = building.name.toLowerCase();
        const buildingIdMatch = buildingId.toLowerCase().includes(query);
        const buildingNameMatch = buildingName.includes(query);
        
        if (buildingIdMatch || buildingNameMatch) {
          results.push({
            type: 'building',
            id: buildingId,
            name: building.name,
            data: building,
          });
        }
      });
    }

    return results;
  };

  const handlePlayerSelection = useCallback((playerID: string | number) => {
    const numericPlayerID = Number(playerID);

    eventBus.emit(EVENTS.PLAYER_SELECTED, numericPlayerID);
    setActiveTab('player-info');
    const player = gameState.players?.find(p => String(p.playerID || p.id) === String(numericPlayerID));
    if (player) {
      setSelectedItem({
        type: 'player',
        id: String(numericPlayerID)
      });
    }
  }, [gameState.players, setActiveTab, setSelectedItem]);

  useEffect(() => {
    eventBus.on(EVENTS.SELECT_AND_SHOW_INFO_PLAYER, handlePlayerSelection);
    
    return () => {
      eventBus.off(EVENTS.SELECT_AND_SHOW_INFO_PLAYER, handlePlayerSelection);
    };
  }, [gameState.players]);

  const handleSelect = (item: SearchResult) => {
    console.log('Selected building data:', item);

    if (!item.id) {
      console.error('Selected item missing ID:', item);
      return;
    }

    setSelectedItem({
      type: item.type,
      id: item.id,
    });

    if (item.type === 'player') {
      handlePlayerSelection(item.data.playerID);
      setActiveTab('player-info');
    } else if (item.type === 'building') {
      const buildingID = Number(item.id);
      eventBus.emit(EVENTS.BUILDING_SELECTED, buildingID);
      setActiveTab('building-info');
    }
    setSearchFocused(false);
  };

  const getSelectedItemDetails = (): DetailedItem | null => {
    if (!selectedItem.id || !selectedItem.type) {
      return null;
    }

    if (selectedItem.type === 'player' && Array.isArray(gameState.players)) {
      const player = gameState.players.find(p => 
        String(p.playerID || p.id) === selectedItem.id
      );
      if (player) {
        return {
          id: String(player.id),
          playerID: String(player.playerID),
          name: player.name,
          location: player.location || '',
          description: player.description || '',
          ...player
        };
      }
    } else if (selectedItem.type === 'building' && Array.isArray(gameState.buildings)) {
      return gameState.buildings.find(b => 
        String(b.buildingID || b.id) === selectedItem.id
      ) || null;
    }

    return null;
  };

  const selectedDetails = getSelectedItemDetails();

  const getSelectedBuildingData = (): Building | undefined => {
    if (selectedItem.type !== 'building' || !selectedItem.id) return undefined;
    return gameState.buildings?.find(b => 
      String(b.buildingID || b.id) === selectedItem.id
    );
  };

  useEffect(() => {
    if (activeTab === 'player-chat-agent') {
      setChatActive(true);
    }
  }, [activeTab]);

  const renderDetailPanel = () => {
    if (!selectedDetails) return null;

    return (
      <>
        <div className={`flex-1 overflow-y-auto space-y-4 ${activeTab !== 'player-chat-agent' ? 'pb-6' : ''}`}>
          <div className={`${activeTab === 'player-info' ? '' : 'hidden'}`}>
            {selectedItem.type === 'player' && (
              <PlayerInfoPanel 
                playerData={gameState.players?.find(p => 
                  String(p.playerID || p.id) === selectedItem.id
                ) || null} 
                colorType="sky" 
              />
            )}
          </div>

          <div className={`${activeTab === 'player-chat-history' ? '' : 'hidden'}`}>
            {selectedItem.type === 'player' && selectedItem.id && (
              <PlayerChatHistory playerID={selectedItem.id} />
            )}
          </div>

          <div className={`${activeTab === 'player-moments' ? '' : 'hidden'}`}>
            {selectedItem.type === 'player' && selectedItem.id && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Stories</h3>
                <PlayerMoments playerId={selectedItem.id} />
              </div>
            )}
          </div>

          <div className={`${activeTab === 'transaction-summary' ? '' : 'hidden'}`}>
            {selectedItem.type === 'player' && selectedItem.id && (
              <TransactionSummary playerID={selectedItem.id} />
            )}
          </div>

          <div className={`${activeTab === 'building-info' ? '' : 'hidden'}`}>
            {selectedItem.type === 'building' && (
              <PlayerInfoPanel 
                playerData={getSelectedBuildingData() || null} 
                colorType="pink" 
              />
            )}
          </div>

          <div className={`${activeTab === 'building-players' ? '' : 'hidden'}`}>
            {selectedItem.type === 'building' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Players in Building
                </h3>
                {Array.isArray(currentBuildingPlayers) && currentBuildingPlayers.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-gray-300">
                      {currentBuildingPlayers.length} player(s) inside
                    </div>
                    <div className="space-y-2">
                      {currentBuildingPlayers.map(player => (
                        <div 
                          key={player.playerID || player.id}
                          className="flex items-center space-x-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer"
                          onClick={() => handlePlayerSelection(player.playerID || player.id)}
                        >
                          <UserOutlined className="text-gray-400" />
                          <span className="text-gray-300">{player.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">No players in this building</div>
                )}
              </div>
            )}
          </div>

          <div className={`${activeTab === 'building-actions' ? '' : 'hidden'}`}>
            {selectedItem.type === 'building' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Available Actions
                </h3>
                <div className="space-y-3">
                  {Object.entries(getSelectedBuildingData()?.smartActions || {}).map(([key, value]) => (
                    <div 
                      key={key}
                      className="group relative p-4 rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 hover:from-gray-700/80 hover:to-gray-800/90 border border-pink-500/10 hover:border-pink-500/30 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-pink-500/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                          <ThunderboltOutlined className="text-xl text-pink-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-pink-300 text-base group-hover:text-pink-200 transition-colors">
                            {key}
                          </div>
                          <div className="text-gray-400 text-sm mt-1 group-hover:text-gray-300 transition-colors">
                            {Object.entries(value).map(([field, content]) => (
                              <div key={field} className="mb-1">
                                <span className="text-pink-400/70">{field}: </span>
                                <span className="text-gray-300">
                                  {typeof content === 'object' ? JSON.stringify(content) : String(content)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={`h-full ${activeTab === 'player-chat-agent' ? '' : 'hidden'}`}>
          <AgentChat 
            playerID={selectedItem.type === 'player' && selectedItem.id ? selectedItem.id : undefined}
            keepAlive={true}
          />
        </div>
      </>
    );
  };

  const renderMenuItem = (item: MenuItem) => (
    <div 
      className={`flex flex-col items-center justify-center p-2 mx-1 my-1 rounded-2xl transition-all duration-300 cursor-pointer group
        ${activeTab === item.key ? '' : 'hover:bg-white/5'}`}
      onClick={() => setActiveTab(item.key)}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 transition-all duration-300
        ${activeTab === item.key 
          ? (selectedItem.type === 'building'
            ? 'bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 text-white scale-110 shadow-lg shadow-pink-500/30 ring-2 ring-pink-400/30'
            : 'bg-gradient-to-br from-sky-500 via-sky-600 to-sky-700 text-white scale-110 shadow-lg shadow-sky-500/30 ring-2 ring-sky-400/30')
          : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-gray-300 group-hover:scale-105'}`}
      >
        {item.icon}
      </div>
      <span className={`text-xs transition-colors duration-300
        ${activeTab === item.key 
          ? (selectedItem.type === 'building'
            ? 'text-pink-400 font-medium'
            : 'text-sky-400 font-medium')
          : 'text-gray-500 group-hover:text-gray-400'}`}>
        {item.label}
      </span>
    </div>
  );

  const handleSearch = (value: string) => {
    const trimmedValue = value.trim();
    setSearchQuery(value);
    setSearchFocused(true);
    if (trimmedValue) {
      setLastSearch({
        type: null,
        query: value,
        timestamp: Date.now(),
      });
    } else if (value === '') {
      eventBus.emit(EVENTS.PLAYER_SELECTED, null);
    }
  };

  const useLastSearch = () => {
    if (lastSearch.query) {
      setSearchQuery(lastSearch.query);
    }
  };

  return (
    <div 
      className="w-full bg-gray-800/60" 
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <LeaderboardPanel />
      
      <Sider theme="light" width={80} className="fixed left-0 h-screen overflow-auto shadow-lg z-30 bg-black">
        <div className="p-2">
          <Link href="/" className="flex items-center justify-center text-2xl font-bold text-purple-400 mb-6">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl animate-breath-slow"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.5),transparent_70%)] rounded-xl animate-pulse-slow"></div>
              <div className="absolute inset-0 bg-black/90 rounded-xl transform scale-[0.98]">
                <Image 
                  src={logo} 
                  alt="Logo" 
                  width={28}
                  height={28}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float-slow"
                />
              </div>
            </div>
          </Link>
          
          <div className="flex flex-col gap-1">
            {(selectedItem.type === 'building' ? buildingMenuItems : playerMenuItems).map((item) => (
              <div key={`menu-item-${item.key}`} onClick={() => setActiveTab(item.key)}>
                <div 
                  className={`flex flex-col items-center justify-center p-2 mx-1 my-1 rounded-2xl transition-all duration-300 cursor-pointer group
                    ${activeTab === item.key ? '' : 'hover:bg-white/5'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 transition-all duration-300
                    ${activeTab === item.key 
                      ? (selectedItem.type === 'building'
                        ? 'bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 text-white scale-110 shadow-lg shadow-pink-500/30 ring-2 ring-pink-400/30'
                        : 'bg-gradient-to-br from-sky-500 via-sky-600 to-sky-700 text-white scale-110 shadow-lg shadow-sky-500/30 ring-2 ring-sky-400/30')
                      : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-gray-300 group-hover:scale-105'}`}
                  >
                    {item.icon}
                  </div>
                  <span className={`text-xs transition-colors duration-300
                    ${activeTab === item.key 
                      ? (selectedItem.type === 'building'
                        ? 'text-pink-400 font-medium'
                        : 'text-sky-400 font-medium')
                      : 'text-gray-500 group-hover:text-gray-400'}`}>
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Sider>

      <div className="ml-[80px]">
        <div className="relative">
          <div ref={searchRef} className="fixed top-4 left-[100px] z-50" style={{ width: '480px', display: showSearch ? 'block' : 'none' }}>
            <div className={`relative bg-black/50 backdrop-blur-md rounded-3xl shadow-lg border border-white/10 transition-all duration-200 ${searchFocused ? 'rounded-b-none shadow-xl' : ''}`}>
              <div className={`flex items-center ${searchFocused ? 'rounded-t-3xl' : 'rounded-3xl'}`}>
                <div className="relative flex-1">
                  <Input
                    placeholder="Search player or building..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    className="w-full border-0 focus:shadow-none text-white bg-transparent px-4 h-12 text-base"
                    style={{ 
                      WebkitTextFillColor: 'rgba(255, 255, 255, 0.8)',
                    }}
                    variant="borderless"
                    suffix={
                      selectedItem.id ? (
                        <CloseOutlined 
                          className="text-white/70 hover:text-white cursor-pointer text-lg transition-colors" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem({ type: null, id: null });
                            setSearchQuery('');
                            eventBus.emit(EVENTS.PLAYER_SELECTED, null);
                          }}
                          title="Close Details"
                        />
                      ) : searchQuery ? (
                        <CloseOutlined 
                          className="text-white/70 hover:text-white cursor-pointer text-lg transition-colors" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchQuery('');
                            setSearchFocused(false);
                            eventBus.emit(EVENTS.PLAYER_SELECTED, null);
                          }}
                        />
                      ) : (
                        <SearchOutlined className="text-white/70 text-xl hover:text-white transition-colors" />
                      )
                    }
                  />
                </div>
              </div>

              {searchFocused && (
                <div className="absolute w-full bg-black/90 backdrop-blur-md border-t border-white/10 rounded-b-3xl shadow-xl max-h-[calc(100vh-200px)] overflow-y-auto">
                  {lastSearch.query && !searchQuery && (
                    <div
                      onClick={useLastSearch}
                      className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center gap-3 border-b border-white/10"
                    >
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                        <HistoryOutlined className="text-gray-300" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-medium text-gray-300">
                            Last search: {lastSearch.query}
                        </span>
                        <span className="text-xs text-gray-500">
                          {dayjs(lastSearch.timestamp).fromNow()}
                        </span>
                      </div>
                    </div>
                  )}

                  {searchQuery && getSearchResults().map((result) => (
                    <div
                      key={`search-result-${result.type}-${result.id}`}
                      onClick={() => handleSelect(result)}
                      className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center gap-3 border-b border-white/10 last:border-b-0"
                    >
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                        {result.type === 'player' ? (
                          <UserOutlined className="text-sky-300" />
                        ) : (
                          <HomeOutlined className="text-pink-300" />
                        )}
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className={`text-sm font-medium ${result.type === 'player' ? 'text-sky-300' : 'text-pink-300'}`}>
                          {result.name}
                        </span>
                        <span className={`text-xs ${result.type === 'player' ? 'text-sky-500/60' : 'text-pink-500/60'}`}>
                          {result.type === 'player' ? 'Player ID: ' : 'Building ID: '}
                          <span className={`${result.type === 'player' ? 'text-sky-300' : 'text-pink-300'}`}>
                            {result.id}
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedItem.id && selectedDetails && (
            <div className={`fixed top-0 left-[80px] h-screen ${activeTab === 'transaction-summary' ? 'w-[900px]' : 'w-[520px]'} bg-gray-800/60 backdrop-blur-md shadow-xl z-40 flex flex-col`}>
              <div className="flex items-center justify-between p-4 mx-6 mt-28 bg-black/40 backdrop-blur-sm rounded-xl shadow-lg border border-gray-500/20">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm relative group overflow-hidden
                    ${selectedItem.type === 'player' 
                      ? 'bg-sky-500/20' 
                      : 'bg-pink-500/20'}`}
                  >
                    {selectedItem.type === 'player' ? (
                      <div className="text-2xl font-bold text-sky-300 group-hover:scale-110 transition-transform flex items-center justify-center w-full h-full leading-none">@</div>
                    ) : (
                      <HomeOutlined className="text-pink-300 text-2xl group-hover:scale-110 transition-transform" />
                    )}
                    <div className={`absolute inset-0 rounded-xl group-hover:bg-opacity-20 transition-colors
                      ${selectedItem.type === 'player' 
                        ? 'bg-sky-400/10 group-hover:bg-sky-400/20' 
                        : 'bg-pink-400/10 group-hover:bg-pink-400/20'}`}
                    ></div>
                  </div>
                  <div>
                    <h3 className={`text-xl font-semibold
                      ${selectedItem.type === 'player' ? 'text-sky-300' : 'text-pink-300'}`}>
                      {selectedDetails.name}
                    </h3>
                    <span className={`text-sm
                      ${selectedItem.type === 'player' ? 'text-sky-500/60' : 'text-pink-500/60'}`}>
                      {selectedItem.type === 'player' ? 'Player ID: ' : 'Building ID: '}
                      <span className={`${selectedItem.type === 'player' ? 'text-sky-300' : 'text-pink-300'}`}>
                        {selectedItem.type === 'player' 
                          ? (selectedDetails.playerID || selectedDetails.id) 
                          : (selectedDetails.buildingID || selectedDetails.id)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col px-6 pt-6 min-h-0">
                {renderDetailPanel()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
