import React from 'react';
import { generateDynamicHTML, playerFieldDisplayNames } from '../map/mapgame/utils/PlayerInfoFormatter';

interface PlayerInfoPanelProps {
  playerData: Record<string, any>;
  colorType?: 'sky' | 'pink';
}

const PlayerInfoPanel: React.FC<PlayerInfoPanelProps> = ({ playerData, colorType = 'sky' }) => {
  const createMarkup = () => {
    return { __html: generateDynamicHTML(playerData, playerFieldDisplayNames) };
  };

  return (
    <div className="h-[700px] overflow-y-auto">
      <div 
        className={`[&_.details]:mb-2.5 
                   [&_summary]:cursor-pointer [&_summary]:py-2 [&_summary]:font-semibold [&_summary]:text-gray-300 [&_summary:hover]:bg-gray-800/50
                   [&_ul]:list-none [&_ul]:pl-5 [&_ul]:my-2
                   [&_li]:my-1 [&_li]:text-gray-300
                   [&_p]:my-2 [&_p]:leading-relaxed [&_p]:text-gray-200
                   [&_strong]:mr-2 [&_strong]:font-semibold
                   [&_details]:open:bg-gray-800/50 [&_details]:open:rounded-lg [&_details]:open:p-2
                   ${colorType === 'pink' ? '[&_strong]:text-pink-300' : '[&_strong]:text-sky-300'}
                   p-5`}
        dangerouslySetInnerHTML={createMarkup()} 
      />
    </div>
  );
};

export default PlayerInfoPanel; 