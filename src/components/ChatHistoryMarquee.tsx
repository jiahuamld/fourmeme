import { cn } from "@/lib/utils";
import Marquee from "@/components/ui/marquee";
import { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { gameStateAtom } from '@/store/atoms';
import dayjs from 'dayjs';

interface ChatMessage {
  senderID: string | number;
  recipientID?: string | number;
  content: string;
  createdAt: string;
}

// 定义一个通用的 Player 类型
type Player = {
  playerID?: string | number;
  id?: string | number;
  name: string;
};

// 使用 Partial 使所有属性可选
type GameStateType = {
  players: Player[];
};

const ChatCard = ({
  message,
  gameState
}: {
  message: ChatMessage;
  gameState: GameStateType;
}) => {
  const getPlayerName = (id: number | string) => {
    const player = gameState.players?.find(p => 
      String(p.playerID || p.id) === String(id)
    );
    return player?.name || `Player ${id}`;
  };

  return (
    <figure
      className={cn(
        "relative w-[400px] h-[110px] cursor-pointer overflow-hidden rounded-xl p-3 mx-4",
        "bg-black/40 backdrop-blur-md border border-gray-500/20",
        "hover:bg-black/50 transition-colors duration-200",
        "flex flex-col"
      )}
    >
      <div className="flex flex-row items-center justify-between gap-2 mb-2 shrink-0">
        <div className="flex flex-row items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-800/50 ring-2 ring-purple-500/20 flex items-center justify-center overflow-hidden">
            <img 
              className="w-full h-full object-cover" 
              alt="" 
              src={`https://avatar.vercel.sh/${getPlayerName(message.senderID).toLowerCase().replace(/\s+/g, '')}`} 
            />
          </div>
          <div className="flex flex-col">
            <figcaption className="text-xs font-medium text-sky-300">
              {getPlayerName(message.senderID)}
            </figcaption>
            <p className="text-[10px] font-medium text-gray-400">
              {dayjs(message.createdAt).format('MM-DD HH:mm')}
            </p>
          </div>
        </div>
        {message.recipientID && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-400">Send to</span>
            <span className="text-xs text-sky-300">{getPlayerName(message.recipientID)}</span>
          </div>
        )}
      </div>
      <blockquote className="text-xs text-gray-300/90 break-all whitespace-pre-wrap overflow-y-auto custom-scrollbar flex-1 line-clamp-3">
        {message.content}
      </blockquote>
    </figure>
  );
};

export const ChatHistoryMarquee: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const gameState = useRecoilValue(gameStateAtom);

  useEffect(() => {
    const fetchMessages = async () => {
      setError(null);
      try {
        const url = new URL('https://backend.agiverse.io/api/v1/chat-messages', window.location.origin);
        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Error fetching chat history:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch chat history');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  if (loading) {
    return <div className="h-[270px] flex items-center justify-center text-gray-400">Loading...</div>;
  }

  if (error) {
    return <div className="h-[270px] flex items-center justify-center text-red-400">Error: {error}</div>;
  }

  if (!messages.length) {
    return <div className="h-[270px] flex items-center justify-center text-gray-400">No messages yet</div>;
  }

  const firstRow = messages.slice(0, Math.ceil(messages.length / 2));
  const secondRow = messages.slice(Math.ceil(messages.length / 2));

  return (
    <div className="relative flex h-[270px] w-full flex-col items-center justify-center overflow-hidden rounded-lg">
      <Marquee pauseOnHover className="[--duration:480s] h-[135px]">
        {firstRow.map((message) => (
          <ChatCard 
            key={`${message.senderID}-${message.recipientID}-${message.createdAt}`} 
            message={message}
            gameState={gameState as unknown as GameStateType}
          />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:480s] h-[135px]">
        {secondRow.map((message) => (
          <ChatCard 
            key={`${message.senderID}-${message.recipientID}-${message.createdAt}`} 
            message={message}
            gameState={gameState as unknown as GameStateType}
          />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[420px] bg-gradient-to-r from-[#111054]/85 via-[#111054]/85 to-transparent backdrop-blur-[2px] [mask-image:linear-gradient(to_right,black,transparent)]"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[420px] bg-gradient-to-l from-[#111054]/85 via-[#111054]/85 to-transparent backdrop-blur-[2px] [mask-image:linear-gradient(to_left,black,transparent)]"></div>
    </div>
  );
}; 