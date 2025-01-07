import { useState, useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { gameStateAtom } from '@/store/atoms';
import dayjs from 'dayjs';
import { PanelContent } from './PanelContent';
import eventBus, { EVENTS } from '@/utils/eventBus.js';
interface ChatMessage {
  [key: string]: any;
}

interface PlayerChatHistoryProps {
  playerID: string;
}

export function PlayerChatHistory({ playerID }: PlayerChatHistoryProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const gameState = useRecoilValue(gameStateAtom);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
  };

  useEffect(() => {
    if (!loadingMore && isInitialLoad && messages.length > 0) {
      scrollToBottom();
      setTimeout(() => {
        setIsContentVisible(true);
      }, 50);
    }
  }, [messages, loadingMore, isInitialLoad]);

  useEffect(() => {
    setIsContentVisible(false);
    setLoading(true);
    setLoadingMore(false);
    setError(null);
    setNextCursor(null);
    setHasMore(true);
    setIsInitialLoad(true);
    fetchMessages();
  }, [playerID]);

  const fetchMessages = async (cursor?: string) => {
    setError(null);
    try {
      const url = new URL('https://backend.agiverse.io/api/v1/chat-messages', window.location.origin);
      const params = new URLSearchParams();
      
      if (playerID) {
        params.set('playerID', playerID);
      }
      if (cursor) {
        params.set('cursor', cursor);
      }
      
      if (params.toString()) {
        url.search = params.toString();
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (cursor) {
        setMessages(prev => [...data.messages, ...prev]);
      } else {
        setMessages(data.messages || []);
        setIsInitialLoad(true);
      }
      
      setNextCursor(data.nextCursor || null);
      setHasMore(!!data.nextCursor);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch chat history');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (nextCursor && !loadingMore) {
      setLoadingMore(true);
      setIsInitialLoad(false);
      fetchMessages(nextCursor);
    }
  };

  const getPlayerName = (id: number | string) => {
    const player = gameState.players?.find(p => 
      String(p.playerID || p.id) === String(id)
    );
    const name = player?.name || `Player ${id}`;
    return `${name} <${id}>`;
  };

  const messageList = messages.map((message) => {
    const messageKey = `${message.senderID}-${message.recipientID}-${message.createdAt}`;
    return (
      <div key={messageKey} className="flex flex-col mb-4 last:mb-0">
        <div className="bg-black/40 backdrop-blur-md rounded-xl shadow-sm border border-gray-500/20">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-500/20">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300/80 ring-4 ring-gray-300/20"></div>
                <div>
                  <span className="text-sm text-sky-300 font-medium hover:text-sky-200 cursor-pointer transition-colors"
                    onClick={() => eventBus.emit(EVENTS.SELECT_AND_SHOW_INFO_PLAYER, message.senderID)}>
                    {getPlayerName(message.senderID)}
                  </span>
                  {message.recipientID && (
                    <>
                      <span className="text-gray-500 mx-2">⟶</span>
                      <span className="text-sm text-sky-300 font-medium hover:text-sky-200 cursor-pointer transition-colors"
                        onClick={() => eventBus.emit(EVENTS.SELECT_AND_SHOW_INFO_PLAYER, message.recipientID)}>
                        {getPlayerName(message.recipientID)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">
                {dayjs(message.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </span>
            </div>
          </div>
          <div className="px-5 py-3.5 text-gray-300 leading-relaxed">
            {message.content}
          </div>
        </div>
      </div>
    );
  });

  return (
    <PanelContent
      loading={loading}
      error={error}
      isEmpty={!messages || messages.length === 0}
      emptyText="No chat history available"
    >
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex flex-col gap-4 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-0">
          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className={`w-full py-2.5 px-4 rounded-xl backdrop-blur-sm border border-gray-500/30
                ${loadingMore 
                  ? 'bg-black/30 text-gray-500 cursor-not-allowed' 
                  : 'bg-black/30 hover:bg-black/40 text-gray-300 hover:border-gray-400/50'}`}
            >
              {loadingMore ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                'Load More'
              )}
            </button>
          )}
          <div className={`transition-opacity duration-200 space-y-4 ${isContentVisible ? 'opacity-100' : 'opacity-0'}`}>
            {messageList}
            <div ref={messagesEndRef} className="h-0" />
          </div>
        </div>
      </div>
    </PanelContent>
  );
} 