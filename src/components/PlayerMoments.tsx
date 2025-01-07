import { useState, useEffect, ReactNode } from 'react';
import { PanelContent } from './PanelContent';
import dayjs from 'dayjs';
import { useRecoilValue } from 'recoil';
import { gameStateAtom } from '@/store/atoms';
import eventBus, { EVENTS } from '@/utils/eventBus.js';
import { createPortal } from 'react-dom';
import { storiesService, Story } from '@/app/clientApi/services/storiesService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface PlayerMomentsProps {
  playerId?: string;
}

const components: Components = {
  a: ({ href, children, ...props }: any) => {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center px-2 py-0.5 mx-1 text-xs bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 hover:text-sky-200 rounded-full transition-colors duration-200 backdrop-blur-sm border border-sky-400/30"
        {...props}
      >
        {children}
      </a>
    );
  },
  img: () => null,
  p: ({ children, ...props }: any) => (
    <p className="mb-2 last:mb-0" {...props}>{children}</p>
  ),
  h1: ({ children, ...props }: any) => (
    <h1 className="text-xl font-bold mb-2 text-gray-200" {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 className="text-lg font-bold mb-2 text-gray-200" {...props}>{children}</h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 className="text-base font-bold mb-2 text-gray-200" {...props}>{children}</h3>
  ),
  ul: ({ children, ...props }: any) => (
    <ul className="list-disc list-inside mb-2" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol className="list-decimal list-inside mb-2" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }: any) => (
    <li className="mb-1 last:mb-0" {...props}>{children}</li>
  ),
  code: ({ inline, className, children, ...props }: any) => 
    inline ? (
      <code className="px-1.5 py-0.5 bg-gray-700/50 rounded text-gray-200" {...props}>{children}</code>
    ) : (
      <code className="block p-3 bg-gray-700/50 rounded-lg text-gray-200 overflow-x-auto" {...props}>{children}</code>
    ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote className="border-l-4 border-gray-500/50 pl-3 my-2 text-gray-400 italic" {...props}>
      {children}
    </blockquote>
  ),
  hr: (props: any) => (
    <hr className="my-4 border-gray-600" {...props} />
  ),
};

export function PlayerMoments({ playerId }: PlayerMomentsProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const gameState = useRecoilValue(gameStateAtom);

  const fetchStories = async (cursor?: string) => {
    try {
      const data = await storiesService.getStories({
        playerID: playerId,
        cursor: cursor,
      });
      
      if (cursor) {
        setStories(prev => [...prev, ...data.stories]);
      } else {
        setStories(data.stories);
      }
      
      setNextCursor(data.nextCursor || null);
      setHasMore(data.stories.length > 0 && !!data.nextCursor);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch stories');
    } finally {
      setInitialLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setInitialLoading(true);
    setLoadingMore(false);
    setError(null);
    setNextCursor(null);
    setHasMore(true);
    fetchStories();
  }, [playerId]);

  const getPlayerName = (id: number | string) => {
    const player = gameState.players?.find(p => 
      String(p.playerID || p.id) === String(id)
    );
    const name = player?.name || `Player ${id}`;
    return `${name} <${id}>`;
  };

  const handleLoadMore = () => {
    if (nextCursor && !loadingMore) {
      setLoadingMore(true);
      fetchStories(nextCursor);
    }
  };

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const storiesList = stories.map((story, index) => (
    <div key={`${story.playerID}-${story.createdAt}-${index}`}>
      <div className="flex flex-col">
        <div className="p-4 flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-sky-500/20 backdrop-blur-md border-2 border-sky-300/30 flex items-center justify-center shadow-lg shadow-sky-500/10">
              <span className="text-xl font-semibold text-sky-300">@</span>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span 
                className="text-sm font-medium text-sky-300 cursor-pointer hover:text-sky-200"
                onClick={() => eventBus.emit(EVENTS.SELECT_AND_SHOW_INFO_PLAYER, story.playerID)}
              >
                {getPlayerName(story.playerID)}
              </span>
              <span className="text-xs text-gray-400">
                {dayjs(story.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </span>
            </div>

            <div className="text-gray-300 whitespace-pre-wrap mb-3 markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={components}
              >
                {story.text}
              </ReactMarkdown>
            </div>
            
            {story.imageURL && story.imageURL.trim() !== '' && (
              <div className="relative w-full aspect-auto mb-3">
                <img
                  src={story.imageURL}
                  alt="Story image"
                  loading="lazy"
                  className="rounded-2xl w-full h-auto cursor-pointer transform transition-all duration-300 hover:scale-[1.02]"
                  style={{ maxHeight: '600px', objectFit: 'contain' }}
                  onClick={() => {
                    if (story.imageURL) {
                      setPreviewImage(story.imageURL);
                    }
                  }}
                  onError={() => {
                    if (story.imageURL) {
                      story.imageURL = undefined;
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ));

  return (
    <PanelContent
      loading={initialLoading}
      error={error}
      isEmpty={!stories || stories.length === 0}
      emptyText="No stories available"
    >
      <div className="flex flex-col space-y-4">
        {storiesList}
        {hasMore && (
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className={`w-full py-2 px-4 rounded-lg transition-colors duration-200 
              ${loadingMore 
                ? 'bg-black/30 text-gray-400 cursor-not-allowed backdrop-blur-md border border-gray-100/20' 
                : 'bg-black/30 hover:bg-black/40 text-gray-300 backdrop-blur-md border border-gray-100/20 hover:border-gray-100/40'}`}
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
      </div>

      {previewImage && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center bg-gray-900/70 backdrop-blur-md"
          onClick={() => setPreviewImage(null)}
          style={{ 
            margin: 0, 
            padding: 0,
            zIndex: 999999999
          }}
        >
          <div 
            className="fixed inset-0 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 flex space-x-4" style={{ zIndex: 999999999 }}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(previewImage, '_blank');
                }}
                className="px-4 py-2 text-sm text-white bg-purple-600/30 hover:bg-purple-600/50 rounded-full backdrop-blur-md transition-all duration-300 border border-purple-400/50"
              >
                Open in New Window
              </button>
              <button 
                onClick={() => setPreviewImage(null)}
                className="px-4 py-2 text-sm text-white bg-red-600/30 hover:bg-red-600/50 rounded-full backdrop-blur-md transition-all duration-300 border border-red-400/50"
              >
                Close
              </button>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden flex max-w-[98vw] min-w-[90vw]">
              <div className="flex-1 min-w-0 flex items-center justify-center p-0">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-auto object-contain p-0"
                  style={{ maxHeight: '90vh' }}
                />
              </div>
              <div className="w-[400px] border-l border-white/10 overflow-y-auto">
                <div className="p-6">
                  <div className="flex flex-col space-y-4 text-white">
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-lg font-medium text-purple-300 cursor-pointer hover:text-purple-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          eventBus.emit(EVENTS.SELECT_AND_SHOW_INFO_PLAYER, stories.find(s => s.imageURL === previewImage)?.playerID);
                        }}
                      >
                        {getPlayerName(stories.find(s => s.imageURL === previewImage)?.playerID || '')}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-400">
                      {dayjs(stories.find(s => s.imageURL === previewImage)?.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                    </div>
                    
                    <div 
                      className="text-base text-gray-200 whitespace-pre-wrap mt-4 relative group cursor-pointer hover:bg-white/5 p-2 rounded transition-all duration-200 markdown-body"
                      onClick={() => {
                        const text = stories.find(s => s.imageURL === previewImage)?.text;
                        if (text) handleCopyText(text);
                      }}
                    >
                      <div className="absolute right-2 -top-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span className="text-xs text-gray-400 bg-black/30 px-2 py-1 rounded backdrop-blur-sm">Click to Copy</span>
                      </div>
                      {showCopySuccess && (
                        <div className="absolute right-2 -top-7 bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs backdrop-blur-sm">
                          Copied!
                        </div>
                      )}
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={components}
                      >
                        {stories.find(s => s.imageURL === previewImage)?.text || ''}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </PanelContent>
  );
} 

const styles = `
@keyframes modalShow {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-modalShow {
  animation: modalShow 0.3s ease-out forwards;
}
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
} 