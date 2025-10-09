import api from './api';

export interface FarmerStory {
  _id: string;
  farmer: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    location?: {
      county?: string;
      country?: string;
    };
  };
  title: string;
  challenge: string;
  solution: string;
  outcome?: string;
  category: string;
  tags: string[];
  media: Array<{
    type: 'image' | 'video';
    url: string;
    publicId: string;
    caption?: string;
  }>;
  likes: Array<{
    user: string;
    date: string;
  }>;
  comments: Array<{
    _id: string;
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      profilePicture?: string;
    };
    text: string;
    date: string;
  }>;
  views: number;
  isApproved: boolean;
  isFeatured: boolean;
  helpfulCount: number;
  markedHelpfulBy: string[];
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  commentCount: number;
}

export interface StoryFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  farmerId?: string;
  featured?: boolean;
  sort?: string;
}

export interface CreateStoryData {
  title: string;
  challenge: string;
  solution: string;
  outcome?: string;
  category: string;
  tags?: string[];
  media?: File[];
}

class FarmerStoryService {
  // Get all stories (feed)
  async getAllStories(filters: StoryFilters = {}) {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.farmerId) params.append('farmerId', filters.farmerId);
    if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
    if (filters.sort) params.append('sort', filters.sort);

    const response = await api.get(`/farmer-stories?${params.toString()}`);
    return response.data;
  }

  // Get single story
  async getStoryById(storyId: string) {
    const response = await api.get(`/farmer-stories/${storyId}`);
    return response.data;
  }

  // Create new story
  async createStory(storyData: CreateStoryData) {
    const formData = new FormData();
    
    formData.append('title', storyData.title);
    formData.append('challenge', storyData.challenge);
    formData.append('solution', storyData.solution);
    if (storyData.outcome) formData.append('outcome', storyData.outcome);
    formData.append('category', storyData.category);
    
    if (storyData.tags && storyData.tags.length > 0) {
      formData.append('tags', storyData.tags.join(','));
    }
    
    if (storyData.media && storyData.media.length > 0) {
      storyData.media.forEach((file) => {
        formData.append('media', file);
      });
    }

    const response = await api.post('/farmer-stories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Update story
  async updateStory(storyId: string, storyData: Partial<CreateStoryData>) {
    const response = await api.put(`/farmer-stories/${storyId}`, storyData);
    return response.data;
  }

  // Delete story
  async deleteStory(storyId: string) {
    const response = await api.delete(`/farmer-stories/${storyId}`);
    return response.data;
  }

  // Toggle like
  async toggleLike(storyId: string) {
    const response = await api.post(`/farmer-stories/${storyId}/like`);
    return response.data;
  }

  // Add comment
  async addComment(storyId: string, text: string) {
    const response = await api.post(`/farmer-stories/${storyId}/comments`, { text });
    return response.data;
  }

  // Delete comment
  async deleteComment(storyId: string, commentId: string) {
    const response = await api.delete(`/farmer-stories/${storyId}/comments/${commentId}`);
    return response.data;
  }

  // Mark as helpful
  async markHelpful(storyId: string) {
    const response = await api.post(`/farmer-stories/${storyId}/helpful`);
    return response.data;
  }
}

export const farmerStoryService = new FarmerStoryService();
