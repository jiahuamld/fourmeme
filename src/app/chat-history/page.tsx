import React from 'react';
import ChatHistory from '~/components/ChatHistory';

export default function ChatHistoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        <ChatHistory />
      </div>
    </div>
  );
} 