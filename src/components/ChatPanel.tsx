import { MessageOutlined, CloseOutlined } from '@ant-design/icons';
import { ReactNode } from 'react';

interface ChatPanelProps {
  onClose: () => void;
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
}

export function ChatPanel({ 
  onClose, 
  title = "Chat History", 
  icon = <MessageOutlined className="text-xl text-white" />,
  children 
}: ChatPanelProps) {
  return (
    <div className="fixed right-4 top-20 w-[500px] h-[760px] bg-black/60 backdrop-blur-md rounded-xl shadow-2xl border border-gray-100/20 overflow-hidden z-40">
      <div className="h-14 bg-black/50 backdrop-blur-md px-4 flex items-center justify-between border-b border-gray-100/20">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-white font-bold">{title}</span>
        </div>
        <button 
          onClick={onClose}
          className="text-white hover:text-purple-200 transition-colors"
        >
          <CloseOutlined className="text-xl" />
        </button>
      </div>
      
      <div className="p-4 h-[calc(100%-3.5rem)] overflow-auto custom-scrollbar">
        {children}
      </div>
    </div>
  );
} 