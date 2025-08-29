import { apiCall } from './api';

export interface AdopterProfile {
  _id: string;
  user: string;
  interests: string[];
  location: {
    state: string;
    city: string;
  };
  occupation?: string;
  motivation: string;
  preferredCommunication: string[];
  budget: {
    min: number;
    max: number;
  };
  experience: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
}

export interface Adoption {
  _id: string;
  adopter: string;
  farmer: {
    _id: string;
    farmName: string;
    user: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
  package: {
    type: string;
    title: string;
    price: number;
    duration: number;
  };
  status: 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
  feedback?: {
    rating: number;
    comment: string;
    images?: string[];
  };
  createdAt: string;
}

export interface AdopterAnalytics {
  totalAdoptions: number;
  activeAdoptions: number;
  completedAdoptions: number;
  totalSpent: number;
  monthlySpending: number;
  favoriteCategories: string[];
  upcomingVisits: number;
  unreadMessages: number;
  recentActivities: Array<{
    type: string;
    description: string;
    date: string;
  }>;
}

// Mentoring Types
export interface MentoringFarmer {
  _id: string;
  farmer: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    email: string;
    farmerProfile?: {
      farmName: string;
      location: string;
      farmingType: string;
      cropTypes: string[];
      verificationStatus: string;
    };
  };
  specialization: string;
  status: 'active' | 'pending' | 'paused' | 'completed';
  startDate: string;
  goals: string[];
  progressNotes: string;
  lastMessage?: {
    _id: string;
    content: string;
    createdAt: string;
    sender: {
      firstName: string;
      lastName: string;
    };
  };
  unreadCount: number;
  totalSessions: number;
  nextSession?: {
    _id: string;
    scheduledDate: string;
    duration: number;
    status: string;
  };
  createdAt: string;
}

export interface MentoringConversation {
  conversationId: string;
  farmer: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  mentorship: {
    _id: string;
    specialization: string;
    status: string;
  };
  lastMessage?: {
    _id: string;
    content: string;
    createdAt: string;
    sender: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
  unreadCount: number;
  updatedAt: string;
}

export interface CreateMentorshipData {
  farmerId: string;
  specialization: string;
  goals?: string[];
  sessionFrequency?: string;
  paymentTerms?: {
    type: 'free' | 'paid';
    amount?: number;
    frequency?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const adopterService = {
  // Get adopter dashboard data
  getDashboard: async () => {
    return await apiCall<{ success: boolean; data: AdopterAnalytics }>('GET', '/adopters/dashboard');
  },

  // Get adopter's adoptions
  getAdoptions: async (params?: { status?: string; page?: number; limit?: number }) => {
    const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return await apiCall('GET', `/adopters/adoptions${queryString}`);
  },

  // Create or update adopter profile
  createOrUpdateProfile: async (profileData: Partial<AdopterProfile>) => {
    return await apiCall('POST', '/adopters/profile', profileData);
  },

  // Adopt a farmer
  adoptFarmer: async (farmerId: string, adoptionData: {
    packageType: string;
    duration: number;
    message?: string;
  }) => {
    return await apiCall('POST', `/farmers/${farmerId}/adopt`, adoptionData);
  },

  // Update adoption
  updateAdoption: async (adoptionId: string, updateData: Partial<Adoption>) => {
    return await apiCall('PUT', `/adopters/adoptions/${adoptionId}`, updateData);
  },

  // Add feedback to adoption
  addFeedback: async (adoptionId: string, feedback: {
    rating: number;
    comment: string;
    images?: string[];
  }) => {
    return await apiCall('POST', `/adopters/adoptions/${adoptionId}/feedback`, feedback);
  },

  // Get recommended farmers
  getRecommendedFarmers: async () => {
    return await apiCall('GET', '/adopters/recommendations');
  },

  // Get adoption history
  getAdoptionHistory: async (params?: { page?: number; limit?: number }) => {
    const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return await apiCall('GET', `/adopters/history${queryString}`);
  },

  // Get adopter's favorite farmers
  getFavoriteFarmers: async () => {
    return await apiCall('GET', '/adopters/favorites');
  },

  // Add farmer to favorites
  addToFavorites: async (farmerId: string) => {
    return await apiCall('POST', `/adopters/favorites/${farmerId}`);
  },

  // Remove farmer from favorites
  removeFromFavorites: async (farmerId: string) => {
    return await apiCall('DELETE', `/adopters/favorites/${farmerId}`);
  },

  // Get adopter statistics
  getStatistics: async () => {
    return await apiCall('GET', '/adopters/statistics');
  },

  // Cancel adoption
  cancelAdoption: async (adoptionId: string, reason?: string) => {
    return await apiCall('POST', `/adopters/adoptions/${adoptionId}/cancel`, { reason });
  },

  // Mentoring functionality
  // Get farmers that adopter is mentoring
  getMentoringFarmers: async (page = 1, limit = 10): Promise<PaginatedResponse<MentoringFarmer>> => {
    const response = await apiCall<{ mentorships: MentoringFarmer[]; pagination: { page: number; limit: number; total: number; pages: number } }>(
      'GET',
      `/adopters/mentoring?page=${page}&limit=${limit}`
    );
    return {
      data: response.mentorships,
      pagination: response.pagination
    };
  },

  // Get mentoring conversations
  getMentoringConversations: async (page = 1, limit = 20): Promise<PaginatedResponse<MentoringConversation>> => {
    const response = await apiCall<{ conversations: MentoringConversation[]; pagination: { page: number; limit: number; total: number; pages: number } }>(
      'GET',
      `/adopters/mentoring/conversations?page=${page}&limit=${limit}`
    );
    return {
      data: response.conversations,
      pagination: response.pagination
    };
  },

  // Create new mentorship
  createMentorship: async (data: CreateMentorshipData): Promise<{ mentorship: MentoringFarmer }> => {
    return await apiCall<{ mentorship: MentoringFarmer }>(
      'POST',
      '/adopters/mentoring',
      data
    );
  },
};