'use client';

import { useState, useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { gameStateAtom } from '@/store/atoms';
import dayjs from 'dayjs';
import { PanelContent } from './PanelContent';
import eventBus, { EVENTS } from '@/utils/eventBus.js';

interface ChatMessage {
  [key: string]: any;
}

export default function ChatHistory() {
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
  const autoLoadTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (autoLoadTimerRef.current) {
        clearInterval(autoLoadTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    autoLoadTimerRef.current = setInterval(() => {
      if (nextCursor && !loadingMore && hasMore) {
        handleLoadMore();
      }
    }, 1000);

    if (!hasMore || error) {
      if (autoLoadTimerRef.current) {
        clearInterval(autoLoadTimerRef.current);
      }
    }

    return () => {
      if (autoLoadTimerRef.current) {
        clearInterval(autoLoadTimerRef.current);
      }
    };
  }, [nextCursor, loadingMore, hasMore, error]);

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
  }, []);

  const fetchMessages = async (cursor?: string) => {
    setError(null);
    try {
      const url = new URL('https://backend.agiverse.io/api/v1/chat-messages', window.location.origin);
      const params = new URLSearchParams();
      
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
      <div key={messageKey} className="mb-2 border-b border-gray-300 pb-2">
        <div className="flex justify-between text-sm mb-1">
          <div>
            <span 
              className="text-blue-600 cursor-pointer hover:text-blue-700"
              onClick={() => eventBus.emit(EVENTS.SELECT_AND_SHOW_INFO_PLAYER, message.senderID)}
            >
              {getPlayerName(message.senderID)}
            </span>
            {message.recipientID && (
              <>
                <span className="text-gray-500 mx-2">→</span>
                <span 
                  className="text-blue-600 cursor-pointer hover:text-blue-700"
                  onClick={() => eventBus.emit(EVENTS.SELECT_AND_SHOW_INFO_PLAYER, message.recipientID)}
                >
                  {getPlayerName(message.recipientID)}
                </span>
              </>
            )}
          </div>
          <span className="text-gray-500">
            {dayjs(message.createdAt).format('MM-DD HH:mm')}
          </span>
        </div>
        <div className="text-gray-700">
          {message.content}
        </div>
      </div>
    );
  });

  return (
    <PanelContent
      loading={loading}
      error={error}
      isEmpty={!messages || messages.length === 0}
      emptyText="No chat history"
    >
      <div className="flex flex-col h-full bg-gray-100">
        <div className="flex-1 overflow-y-auto space-y-2 p-4">
          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full p-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
            >
              {loadingMore ? 'Loading...' : 'Load More'}
            </button>
          )}
          <div className={`space-y-2 ${isContentVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
            {messageList}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </PanelContent>
  );
} 