import { apiCall } from './api';

export interface ExpertProfile {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  stats: {
    totalArticles: number;
    totalViews: number;
    totalLikes: number;
  };
}

export interface ExpertMentorship {
  _id: string;
  expert: string;
  farmer: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    email: string;
    farmerProfile?: {
      farmName: string;
      location: {
        county: string;
        subCounty: string;
      };
      farmingType: string[];
      cropTypes: string[];
    };
  };
  specialization: string;
  status: 'active' | 'completed' | 'paused' | 'terminated';
  startDate: string;
  endDate?: string;
  goals: Array<{
    title: string;
    description: string;
    targetDate: string;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  }>;
  progress: {
    totalSessions: number;
    completedGoals: number;
    overallRating: number;
  };
}

export interface InvestorFarmerRelationship {
  farmer: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    farmerProfile: {
      farmName: string;
      location: {
        county: string;
        subCounty: string;
      };
      farmingType: string[];
      verificationStatus: string;
    };
  };
  investors: Array<{
    adopter: {
      _id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
      email: string;
    };
    adoption: {
      _id: string;
      adoptionType: string;
      startDate: string;
      endDate: string;
      status: string;
    };
  }>;
  totalInvestment: number;
}

export interface ExpertConversation {
  conversationId: string;
  farmer: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
    farmerProfile?: {
      farmName: string;
      location: {
        county: string;
        subCounty: string;
      };
    };
  };
  lastMessage: {
    _id: string;
    content: {
      text: string;
    };
    sender: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  };
  unreadCount: number;
}

export interface ExpertFarmVisit {
  _id: string;
  adopter: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    email: string;
  };
  farmer: {
    _id: string;
    user: {
      firstName: string;
      lastName: string;
      avatar?: string;
      email: string;
    };
    farmName: string;
    location: {
      county: string;
      subCounty: string;
    };
  };
  scheduledDate: string;
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled';
  purpose: string;
  notes?: string;
  feedback?: {
    rating: number;
    comment: string;
  };
}

export interface Pagination {
  current: number;
  pages: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ArticleData {
  title: string;
  content: string;
  category: string;
  tags?: string[];
  status: 'draft' | 'published';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface PaymentTerms {
  isPayable: boolean;
  ratePerSession?: number;
  currency?: string;
  paymentStatus?: 'pending' | 'partial' | 'paid' | 'overdue';
}

export interface CommunicationPreferences {
  preferredMethods?: string[];
  language?: string;
  frequency?: 'weekly' | 'bi_weekly' | 'monthly' | 'as_needed';
}

export interface ExpertDashboardStats {
  stats: {
    articles: {
      total: number;
      published: number;
      drafts: number;
    };
    mentorships: {
      total: number;
      active: number;
      completed: number;
    };
    engagement: {
      totalViews: number;
      totalLikes: number;
      calendarEntries: number;
      unreadMessages: number;
    };
    platform: {
      totalFarmers: number;
      totalAdopters: number;
      totalInvestorFarmerPairs: number;
    };
  };
  recentActivity: {
    articles: Array<{
      _id: string;
      title: string;
      status: string;
      views: number;
      likesCount: number;
      createdAt: string;
    }>;
    mentorships: ExpertMentorship[];
    upcomingVisits: ExpertFarmVisit[];
  };
}

export const expertService = {
  // Get expert dashboard data
  getDashboard: async (): Promise<ExpertDashboardStats> => {
    const response = await apiCall<{ success: boolean; data: ExpertDashboardStats }>('GET', '/experts/dashboard');
    return response.data;
  },

  // Get expert profile
  getProfile: async (): Promise<ExpertProfile> => {
    const response = await apiCall<{ success: boolean; data: { expert: ExpertProfile } }>('GET', '/experts/profile');
    return response.data.expert;
  },

  // Update expert profile
  updateProfile: async (profileData: Partial<ExpertProfile>): Promise<ExpertProfile> => {
    const response = await apiCall<{ success: boolean; data: { expert: ExpertProfile } }>('PUT', '/experts/profile', profileData);
    return response.data.expert;
  },

  // Get expert's articles
  getArticles: async (params?: { page?: number; limit?: number; status?: string; category?: string; sort?: string }) => {
    const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return await apiCall('GET', `/experts/articles${queryString}`);
  },

  // Update expert article
  updateArticle: async (articleId: string, articleData: ArticleData) => {
    return await apiCall('PUT', `/experts/articles/${articleId}`, articleData);
  },

  // Delete expert article
  deleteArticle: async (articleId: string) => {
    return await apiCall('DELETE', `/experts/articles/${articleId}`);
  },

  // Get expert's mentorships
  getMentorships: async (params?: { page?: number; limit?: number; status?: string; specialization?: string }) => {
    const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    const response = await apiCall<{ 
      success: boolean; 
      data: { 
        mentorships: ExpertMentorship[]; 
        pagination: Pagination; 
      } 
    }>('GET', `/experts/mentorships${queryString}`);
    return response.data;
  },

  // Create new mentorship
  createMentorship: async (mentorshipData: {
    farmerId: string;
    specialization: string;
    goals?: Array<{
      title: string;
      description: string;
      targetDate: string;
    }>;
    paymentTerms?: PaymentTerms;
    communicationPreferences?: CommunicationPreferences;
  }) => {
    const response = await apiCall<{ 
      success: boolean; 
      data: { mentorship: ExpertMentorship } 
    }>('POST', '/experts/mentorships', mentorshipData);
    return response.data.mentorship;
  },

  // Get investor-farmer relationships
  getInvestorFarmerRelationships: async (params?: { page?: number; limit?: number }) => {
    const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    const response = await apiCall<{ 
      success: boolean; 
      data: { 
        relationships: InvestorFarmerRelationship[]; 
        pagination: Pagination; 
      } 
    }>('GET', `/experts/investors-farmers${queryString}`);
    return response.data;
  },

  // Get expert conversations
  getConversations: async () => {
    const response = await apiCall<{ 
      success: boolean; 
      data: { conversations: ExpertConversation[] } 
    }>('GET', '/experts/conversations');
    return response.data.conversations;
  },

  // Get expert farm visits
  getFarmVisits: async (params?: { page?: number; limit?: number; status?: string; date?: string }) => {
    const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    const response = await apiCall<{ 
      success: boolean; 
      data: { 
        visits: ExpertFarmVisit[]; 
        pagination: Pagination; 
      } 
    }>('GET', `/experts/visits${queryString}`);
    return response.data;
  }
};