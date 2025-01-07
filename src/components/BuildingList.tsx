import React, { memo, useState, useEffect } from 'react';
import { ThunderboltOutlined } from '@ant-design/icons';
import { useRecoilValue } from 'recoil';
import { gameStateAtom } from '@/store/atoms';
import eventBus, { EVENTS } from '@/utils/eventBus.js';

interface SmartAction {
  [key: string]: any;
}

interface Building {
  buildingID?: string;
  id?: string;
  name: string;
  smartActions?: {
    [key: string]: SmartAction;
  };
}

interface BuildingListProps {
  setRef?: (id: string, element: HTMLDivElement | null) => void;
}

interface GameState {
  buildings?: Building[];
}

const BuildingItem = memo(({ building, setRef, onBuildingClick }: {
  building: Building;
  setRef?: (id: string, element: HTMLDivElement | null) => void;
  onBuildingClick: (id: string) => void;
}) => {
  const buildingId = String(building.buildingID || building.id);
  const smartActionsCount = Object.keys(building.smartActions || {}).length;

  return (
    <div 
      key={buildingId}
      ref={element => setRef?.(buildingId, element)}
      className="flex items-center space-x-3 p-3 rounded-lg bg-gray-900/80 hover:bg-gray-700/60 cursor-pointer transition-colors"
      onClick={() => onBuildingClick(buildingId)}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-pink-500/20 text-pink-400">
        <ThunderboltOutlined className="text-xl" />
      </div>
      <div className="flex flex-col">
        <span className="text-pink-300 font-medium">{building.name}</span>
        <span className="text-xs text-pink-500/60">ID: {buildingId}</span>
        <div className="text-xs text-pink-300/60 mt-1">
          {smartActionsCount} Smart Actions
        </div>
      </div>
    </div>
  );
});

BuildingItem.displayName = 'BuildingItem';

export function BuildingList({ setRef }: BuildingListProps) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const gameState = useRecoilValue<GameState>(gameStateAtom);

  useEffect(() => {
    if (gameState.buildings && gameState.buildings.length > 0 && buildings.length === 0) {
      const buildingsWithSmartActions = gameState.buildings.filter(building => building.smartActions);
      setBuildings(buildingsWithSmartActions);
    }
  }, [gameState.buildings]);

  const handleBuildingClick = (buildingID: string) => {
    eventBus.emit(EVENTS.BUILDING_SELECTED, buildingID);
    eventBus.emit(EVENTS.SWITCH_TO_BUILDING_INFO);
  };

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold text-white">
        Smart Buildings ({buildings.length})
      </h3>
      <div className="space-y-2">
        {buildings.map(building => (
          <BuildingItem
            key={building.buildingID || building.id}
            building={building}
            setRef={setRef}
            onBuildingClick={handleBuildingClick}
          />
        ))}
      </div>
    </div>
  );
} 