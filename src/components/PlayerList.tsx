import React, { memo, useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { gameStateAtom } from '@/store/atoms';
import eventBus, { EVENTS } from '@/utils/eventBus.js';

interface Player {
  id: string;
  playerID?: string;
  name: string;
}

interface PlayerListProps {
  setRef?: (id: string, element: HTMLDivElement | null) => void;
}

interface GameState {
  players?: Player[];
}

const PlayerItem = memo(({ player, setRef, onPlayerClick }: { 
  player: Player; 
  setRef?: (id: string, element: HTMLDivElement | null) => void;
  onPlayerClick: (id: string) => void;
}) => {
  const playerId = String(player.playerID || player.id);
  
  return (
    <div 
      key={playerId}
      ref={element => setRef?.(playerId, element)}
      className="flex items-center space-x-3 p-3 rounded-lg bg-gray-900/80 hover:bg-gray-700/60 cursor-pointer transition-colors"
      onClick={() => onPlayerClick(playerId)}
    >
      <div className="w-10 h-10 rounded-full bg-gray-800/50 ring-2 ring-purple-500/20 flex items-center justify-center overflow-hidden">
        <img 
          className="w-full h-full object-cover" 
          alt="" 
          src={`https://avatar.vercel.sh/${player.name.toLowerCase().replace(/\s+/g, '')}`} 
        />
      </div>
      <div className="flex flex-col">
        <span className="text-sky-300 font-medium">{player.name}</span>
        <span className="text-xs text-sky-500/60">ID: {playerId}</span>
      </div>
    </div>
  );
});

PlayerItem.displayName = 'PlayerItem';

export function PlayerList({ setRef }: PlayerListProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const gameState = useRecoilValue<GameState>(gameStateAtom);

  useEffect(() => {
    if (gameState.players && gameState.players.length > 0 && players.length === 0) {
        console.log('setPlayers');
        
      setPlayers(gameState.players);
    }
  }, [gameState.players]);

  const handlePlayerClick = (playerID: string) => {
    eventBus.emit(EVENTS.PLAYER_SELECTED, playerID);
  };

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold text-white">
        Agents ({players.length})
      </h3>
      <div className="space-y-2">
        {players.map(player => (
          <PlayerItem 
            key={player.playerID || player.id}
            player={player}
            setRef={setRef}
            onPlayerClick={handlePlayerClick}
          />
        ))}
      </div>
    </div>
  );
} 