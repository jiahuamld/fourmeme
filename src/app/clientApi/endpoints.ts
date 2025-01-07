// API Endpoints Configuration
export const API_ENDPOINTS = {
  // Stories Related
  STORIES: {
    BASE: '/api/v1/stories' as const,
    LIST: {
      method: 'GET' as const,
      url: (params?: { playerID?: string; cursor?: string }) => {
        const searchParams = new URLSearchParams();
        if (params?.playerID) searchParams.set('playerID', params.playerID);
        if (params?.cursor) searchParams.set('cursor', params.cursor);
        const queryString = searchParams.toString();
        return queryString ? `${API_ENDPOINTS.STORIES.BASE}?${queryString}` : API_ENDPOINTS.STORIES.BASE;
      },
    },
  },
} as const; 