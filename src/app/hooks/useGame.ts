import useWebSocket from 'react-use-websocket';
import { useState, useEffect, useRef } from 'react';
import Parse from 'fast-json-parse';
import { MessageQueue } from '@/utils/MessageQueue';
import { useSetRecoilState } from 'recoil';
import { gameStateAtom } from '@/store/atoms';
import { Data } from 'phaser';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://backend.agiverse.io/ws?type=observer';
const LOCAL_WS_URL = 'ws://127.0.0.1:8080/ws?type=observer';

interface WSMessage {
  type: string;
  data?: any;
}

export function useGame() {
  const messageQueue = useRef(new MessageQueue());
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const setGameState = useSetRecoilState(gameStateAtom);
  const [isEnabled, setIsEnabled] = useState(false);

  const isLocal = typeof window !== 'undefined' && 
    new URLSearchParams(window.location.search).has('local');
  
  const wsUrl = isLocal ? LOCAL_WS_URL : WS_URL;

  const {
    sendMessage,
    lastMessage: wsLastMessage,
    readyState,
  } = useWebSocket(wsUrl, {
    onOpen: () => {
      console.log('WebSocket connection established');
    },
    onClose: () => {
      console.log('WebSocket connection closed');
    },
    onError: (error: Event) => {
      console.error('WebSocket error:', error);
    },
    shouldReconnect: (closeEvent: CloseEvent) => isEnabled,
    reconnectAttempts: 5,
    reconnectInterval: 3000,
    onMessage: (event: WebSocketEventMap['message']) => {

      try {
        const parsed = Parse(event.data);
        if (parsed.err) {
          console.error('JSON parsing error:', parsed.err);
          return;
        }
        const message = parsed.value;
        messageQueue.current.enqueue(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    }
  });

  const processQueue = async () => {
    while (true) {
      const nextMessage = await messageQueue.current.dequeue() as WSMessage;
      if (messageQueue.current.size() === 0) {
        setLastMessage(nextMessage);
        if (nextMessage?.type) {
          let processedData;
          switch (nextMessage.type) {
            case 'players':
              processedData = (nextMessage.data || []).map((player: any) => ({
                ...player,
              }));
              break;
            case 'map':
              const mapData = nextMessage.data?.data || nextMessage.data || {};
              const buildings = mapData.buildings || [];
              processedData = buildings.map((building: any) => ({
                ...building,
              }));
              nextMessage.type = 'buildings';
              break;
            default:
              processedData = nextMessage.data || nextMessage;
              break;
          }
          setGameState(prevState => ({
            ...prevState,
            [nextMessage.type]: processedData,
            ...(nextMessage.type === 'buildings' ? { map: nextMessage.data } : {})
          }));
        }
      }
    }
  };

  useEffect(() => {
    processQueue();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
  
        enableWebSocket();
      } else {
   
        disableWebSocket();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const enableWebSocket = () => {
    console.log('Enabling WebSocket connection...');
    setIsEnabled(true);
  };

  const disableWebSocket = () => {
    console.log('Disabling WebSocket connection...');
    setIsEnabled(false);
  };

  return {
    lastMessage,
    sendMessage,
    readyState,
    enableWebSocket,
    disableWebSocket,
    isEnabled
  };
} 