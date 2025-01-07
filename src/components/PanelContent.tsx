import React from 'react';

interface PanelContentProps {
  loading: boolean;
  error: string | null;
  emptyText?: string;
  isEmpty?: boolean;
  children: React.ReactNode;
}

export function PanelContent({
  loading,
  error,
  emptyText = 'No content available',
  isEmpty = false,
  children
}: PanelContentProps) {
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-500">
          <p>Error: {error}</p>
        </div>
      );
    }

    if (isEmpty) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <p>{emptyText}</p>
        </div>
      );
    }

    return children;
  };

  return (
    <div className="flex flex-col space-y-4 overflow-y-auto">
      {renderContent()}
    </div>
  );
} 