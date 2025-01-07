import React, { useState, useEffect, useRef } from 'react';
import eventBus, { EVENTS } from '@/utils/eventBus.js';
import { useGame } from '@/app/hooks/useGame';
import { useRecoilValue } from 'recoil';
import { gameStateAtom } from '@/store/atoms';
import localforage from 'localforage';

interface Message {
  content: string;
  sender: string;
  recipient: string;
  timestamp: string;
  senderPlayerID?: number;
}

interface ReceivedMessage {
  content: string;
  senderPlayerID: number;
  time: string;
  type?: string;
}

interface AgentChatProps {
  playerID?: string;
  isVisible?: boolean;
  keepAlive?: boolean;
}

const AgentChat: React.FC<AgentChatProps> = ({ 
  playerID, 
  isVisible = true, 
  keepAlive = false 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<string>(playerID || '');
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, lastMessage } = useGame();
  const gameState = useRecoilValue(gameStateAtom);

  const getPlayerById = (playerId: number) => {
    if (!gameState.players) return null;
    return gameState.players.find(p => Number(p.playerID) === playerId);
  };

  useEffect(() => {
    if (!isInitialized && (isVisible || keepAlive)) {
      const loadChatHistory = async () => {
        if (selectedRecipient) {
          try {
            const key = `chat_history_${selectedRecipient}`;
            const savedMessages = await localforage.getItem<Message[]>(key);
            if (savedMessages) {
              setMessages(savedMessages);
              scrollToBottom();
            }
          } catch (error) {
            console.error('Error loading chat history:', error);
          }
        }
      };

      loadChatHistory();
      setIsInitialized(true);
    }
  }, [isInitialized, isVisible, keepAlive, selectedRecipient]);

  const saveChatHistory = async (newMessages: Message[]) => {
    if (selectedRecipient) {
      try {
        const key = `chat_history_${selectedRecipient}`;
        await localforage.setItem(key, newMessages);
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
    }
  };

  useEffect(() => {
    if (keepAlive || isVisible) {
      if (lastMessage?.data) {
        const data = lastMessage.data as ReceivedMessage;
        
        if (data.content && data.senderPlayerID) {
          const sender = getPlayerById(data.senderPlayerID);
          const senderName = sender ? sender.name : `Player ${data.senderPlayerID}`;
          
          const newMessages = [...messages, {
            content: data.content,
            sender: senderName,
            recipient: 'You',
            timestamp: new Date(data.time).toLocaleTimeString(),
            senderPlayerID: data.senderPlayerID
          }];

          setMessages(newMessages);
          saveChatHistory(newMessages);
        }
      }
    }
  }, [lastMessage, gameState.players, keepAlive, isVisible]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollTop = 0;
      }
    }, 100);
  };

  useEffect(() => {
    console.log('isVisible', isVisible);
    scrollToBottom();
  }, [messages, isVisible]);



  const handleSendMessage = () => {
    const content = inputValue.trim();
    if (content === '') return;

    const chatMessage = {
      playerID: selectedRecipient ? parseInt(selectedRecipient) : null,
      content: content,
    };

    sendMessage(JSON.stringify(chatMessage));

    let recipientName = 'Everyone';
    if (selectedRecipient) {
      const recipientPlayer = gameState.players?.find(p => Number(p.playerID) === parseInt(selectedRecipient));
      recipientName = recipientPlayer ? recipientPlayer.name : `Player ${selectedRecipient}`;
    }

    const newMessages = [...messages, {
      content: content,
      sender: 'You',
      recipient: selectedRecipient ? `${recipientName} <${selectedRecipient}>` : 'Everyone',
      timestamp: new Date().toLocaleTimeString()
    }];

    setMessages(newMessages);
    saveChatHistory(newMessages);
    setInputValue('');
  };

  useEffect(() => {
    const handlePlayerSelected = (playerID: string | null) => {
      if (playerID !== null) {
        setSelectedRecipient(String(playerID));
      } else {
        setSelectedRecipient('');
      }
    };

    eventBus.on(EVENTS.PLAYER_SELECTED, handlePlayerSelected);
    return () => {
      eventBus.off(EVENTS.PLAYER_SELECTED, handlePlayerSelected);
    };
  }, []);

  useEffect(() => {
    if (playerID) {
      setSelectedRecipient(playerID);
    }
  }, [playerID]);

  if (!isVisible && !keepAlive) {
    return null;
  }

  return (
    <div className={`flex flex-col h-full relative ${!isVisible ? 'hidden' : ''}`} style={{ minHeight: '200px' }}>
      <div 
        className="overflow-y-auto pb-24 px-4 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400" 
        style={{ 
          height: 'calc(100% - 120px)',
          flexDirection: 'column-reverse',
          display: 'flex'
        }} 
        ref={messagesEndRef}>
        <div className="flex flex-col-reverse">
          <div className="flex-grow"></div>
          {[...messages].reverse().map((msg, index) => (
            <div
              key={index}
              className={`mb-3 p-3 rounded-lg ${
                msg.sender === 'You'
                  ? 'ml-auto bg-[#3b82f6]/10'
                  : 'mr-auto bg-[#374151]/30'
              } max-w-[80%]`}
            >
              <div className={`flex items-center mb-1 ${msg.sender === 'You' ? 'justify-end' : 'justify-start'} text-xs`}>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" 
                       style={{ backgroundColor: msg.sender === 'You' ? '#38bdf8' : '#facc15' }}></div>
                  <span style={{ color: msg.sender === 'You' ? '#38bdf8' : '#facc15' }}>
                    {msg.sender === 'You' ? `TO ${msg.recipient}` : `FROM ${msg.sender}`}
                  </span>
                  <span style={{ color: '#6b7280' }}>{msg.timestamp}</span>
                </div>
              </div>
              <p className={`break-words whitespace-pre-wrap mt-0.5 ${
                msg.sender === 'You' ? 'text-right' : 'text-left'
              }`} style={{ 
                color: '#d1d5db',
                wordWrap: 'break-word',
                textAlign: msg.sender === 'You' ? 'right' : 'left',
                width: '100%'
              }}>{msg.content}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-[#1a1b1e] p-4">
        <div className="mb-3">
          {selectedRecipient ? (
            <div className="flex items-center" >
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[#facc15] animate-pulse"></div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: '#facc15' }}>
                    Chatting with
                  </span>
                  <span className="text-[10px]" style={{ color: '#facc15' }}>
                    :: {gameState.players?.find(p => Number(p.playerID) === parseInt(selectedRecipient))?.name || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
            
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={selectedRecipient ? "Send private message..." : "Send broadcast message..."}
              className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-[#2a2b2e]"
            />
            <button
              onClick={handleSendMessage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:opacity-80 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="#38bdf8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3 21l18-9L3 3l3 9m0 0h12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentChat; 