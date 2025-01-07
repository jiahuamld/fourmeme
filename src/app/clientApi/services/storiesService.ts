import axiosInstance, { get } from '../axiosInstance';
import { API_ENDPOINTS } from '../endpoints';

export interface Story {
  id: string;
  text: string;
  imageURL?: string;
  createdAt: string;
  playerID: string | number;
}

export interface StoriesResponse {
  stories: Story[];
  nextCursor?: string;
}

function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

export const storiesService = {
  // Get stories list
  getStories: async (params?: { playerID?: string; cursor?: string }): Promise<StoriesResponse> => {
    try {
      const data = await get<StoriesResponse>(API_ENDPOINTS.STORIES.LIST.url(params));

      // Check URL validity
      if (data.stories && Array.isArray(data.stories)) {
        for (let story of data.stories) {
          if (story.imageURL && !isValidUrl(story.imageURL)) {
            story.imageURL = undefined;
          }
        }
      }

      return data;
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw error;
    }
  },
}; 