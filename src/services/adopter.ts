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

export const adopterService = {
  // Get adopter dashboard data
  getDashboard: async () => {
    return await apiCall<{ success: boolean; data: AdopterAnalytics }>('GET', '/adopters/dashboard');
  },

  // Get adopter's adoptions
  getAdoptions: async (params?: { status?: string; page?: number; limit?: number }) => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
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
  updateAdoption: async (adoptionId: string, updateData: any) => {
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
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
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
};