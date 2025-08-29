import { apiCall } from './api';
import type { KnowledgeParams, CalendarParams, ArticleData, CommentData, CalendarEntryData, SearchFilters } from '@/types/api';

export interface KnowledgeArticle {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
  };
  featuredImage?: string;
  images: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: number;
  status: 'draft' | 'published' | 'archived';
  isExpert: boolean;
  likes: Array<{
    user: string;
    date: string;
  }>;
  likesCount?: number;
  views: number;
  comments: Array<{
    user: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    content: string;
    date: string;
    replies?: Array<{
      user: {
        firstName: string;
        lastName: string;
        avatar?: string;
      };
      content: string;
      date: string;
    }>;
  }>;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FarmingCalendar {
  _id: string;
  title: string;
  description: string;
  category: 'planting' | 'fertilization' | 'irrigation' | 'pest_control' | 'harvesting' | 'soil_preparation' | 'pruning' | 'vaccination' | 'breeding' | 'market_preparation';
  timing: {
    month: number;
    week?: number;
    dayRange?: {
      start: number;
      end: number;
    };
  };
  region: string;
  season: string;
  cropType?: string[];
  livestockType?: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  instructions: {
    whatToDo?: string;
    howToDo?: string;
    tools?: string[];
    materials?: string[];
    tips?: string[];
  };
  expertAdvice?: Array<{
    author: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    content: string;
    videoUrl?: string;
  }>;
  estimatedDuration?: string;
  estimatedCost?: {
    min: number;
    max: number;
    currency: string;
  };
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface FarmingVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  category: string;
  duration: string;
  channel: string;
  publishedAt: string;
}

export const knowledgeService = {
  // Get all articles
  getArticles: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    difficulty?: string;
    sort?: 'latest' | 'popular' | 'views';
  }) => {
    const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return await apiCall<{
      success: boolean;
      data: {
        articles: KnowledgeArticle[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      };
    }>('GET', `/knowledge/articles${queryString}`);
  },

  // Get single article
  getArticle: async (articleId: string) => {
    return await apiCall<{
      success: boolean;
      data: { article: KnowledgeArticle };
    }>('GET', `/knowledge/articles/${articleId}`);
  },

  // Create article (Expert/Admin only)
  createArticle: async (articleData: ArticleData) => {
    return await apiCall('POST', '/knowledge/articles', articleData);
  },

  // Update article
  updateArticle: async (articleId: string, articleData: Partial<KnowledgeArticle>) => {
    return await apiCall('PUT', `/knowledge/articles/${articleId}`, articleData);
  },

  // Delete article
  deleteArticle: async (articleId: string) => {
    return await apiCall('DELETE', `/knowledge/articles/${articleId}`);
  },

  // Like/Unlike article
  toggleLike: async (articleId: string) => {
    return await apiCall<{
      success: boolean;
      data: { liked: boolean; likesCount: number };
    }>('POST', `/knowledge/articles/${articleId}/like`);
  },

  // Add comment to article
  addComment: async (articleId: string, content: string) => {
    return await apiCall('POST', `/knowledge/articles/${articleId}/comments`, { content });
  },

  // Get farming calendar
  getCalendar: async (params?: {
    region?: string;
    month?: number;
    category?: string;
    crop?: string;
    livestock?: string;
  }) => {
    const queryString = params ? `?${new URLSearchParams(Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined) acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>)).toString()}` : '';
    return await apiCall<{
      success: boolean;
      data: {
        calendar: FarmingCalendar[];
        calendarByMonth: Record<number, FarmingCalendar[]>;
      };
    }>('GET', `/knowledge/calendar${queryString}`);
  },

  // Create calendar entry (Expert/Admin only)
  createCalendarEntry: async (entryData: CalendarEntryData) => {
    return await apiCall('POST', '/knowledge/calendar', entryData);
  },

  // Update calendar entry
  updateCalendarEntry: async (entryId: string, entryData: Partial<FarmingCalendar>) => {
    return await apiCall('PUT', `/knowledge/calendar/${entryId}`, entryData);
  },

  // Delete calendar entry
  deleteCalendarEntry: async (entryId: string) => {
    return await apiCall('DELETE', `/knowledge/calendar/${entryId}`);
  },

  // Get article categories
  getCategories: async () => {
    return await apiCall('GET', '/knowledge/categories');
  },

  // Search articles
  searchArticles: async (query: string, filters?: SearchFilters) => {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, String(filters[key]));
      });
    }
    
    return await apiCall('GET', `/knowledge/search?${params.toString()}`);
  },

  // Get featured articles
  getFeaturedArticles: async () => {
    return await apiCall('GET', '/knowledge/featured');
  },

  // Get trending articles
  getTrendingArticles: async () => {
    return await apiCall('GET', '/knowledge/trending');
  },

  // Get user's saved articles
  getSavedArticles: async () => {
    return await apiCall('GET', '/knowledge/saved');
  },

  // Save article
  saveArticle: async (articleId: string) => {
    return await apiCall('POST', `/knowledge/articles/${articleId}/save`);
  },

  // Unsave article
  unsaveArticle: async (articleId: string) => {
    return await apiCall('DELETE', `/knowledge/articles/${articleId}/save`);
  },

  // Get farming videos
  getFarmingVideos: async (params?: {
    category?: string;
    search?: string;
  }) => {
    const queryString = params ? `?${new URLSearchParams(Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined) acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>)).toString()}` : '';
    return await apiCall<{
      success: boolean;
      data: {
        videos: FarmingVideo[];
      };
    }>('GET', `/knowledge/videos${queryString}`);
  },
};