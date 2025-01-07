import { atom, selectorFamily } from 'recoil';

interface Player {
  [key: string]: any;
}

interface Building {
  id: string;
  buildingID: string;
  name: string;
  location: string;
  position: string;
  description: string;
}

interface GameState {
  players: Player[];
  buildings: Building[];
  chat: any[];
  map: any;
}

export const gameStateAtom = atom<GameState>({
  key: 'gameState',
  default: {
    players: [],
    buildings: [],
    chat: [],
    map: null,
  },
});

export const selectedItemAtom = atom<{
  type: 'player' | 'building' | null;
  id: string | null;
}>({
  key: 'selectedItem',
  default: {
    type: null,
    id: null,
  },
});

export const searchQueryAtom = atom<string>({
  key: 'searchQuery',
  default: '',
});

export const lastSearchAtom = atom<{
  type: 'player' | 'building' | null;
  query: string;
  timestamp: number;
}>({
  key: 'lastSearch',
  default: {
    type: null,
    query: '',
    timestamp: 0,
  },
});

export const getPlayerNameSelector = selectorFamily({
  key: 'getPlayerName',
  get: (id: string | number) => ({ get }) => {
    const gameState = get(gameStateAtom);
    const stringId = String(id);
    
    const player = gameState.players?.find(p => 
      String(p.playerID || p.id) === stringId
    );

    return player?.name || `Player ${id}`;
  },
});

export const getBuildingPlayersSelector = selectorFamily({
  key: 'getBuildingPlayers',
  get: (buildingId: string | null) => ({ get }) => {
    const gameState = get(gameStateAtom);
    // console.log('getBuildingPlayersSelector:', {
    //   buildingId,
    //   players: gameState.players,
    //   filtered: gameState.players.filter(player => 
    //     String(player.buildingID) === String(buildingId)
    //   )
    // });
    
    if (!buildingId || !gameState.players) return [];
    
    return gameState.players.filter(player => 
      String(player.buildingID) === String(buildingId)
    );
  },
}); 