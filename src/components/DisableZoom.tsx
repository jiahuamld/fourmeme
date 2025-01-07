'use client';

import { useEffect } from 'react';

export function DisableZoom() {
  useEffect(() => {
    const disableZoom = () => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '-' || event.key === '=')) {
          event.preventDefault();
        }
      };

      const handleWheel = (event: WheelEvent) => {
        if (event.ctrlKey) {
          event.preventDefault();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('wheel', handleWheel, { passive: false });

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('wheel', handleWheel);
      };
    };

    disableZoom();
  }, []);

  return null;
} 