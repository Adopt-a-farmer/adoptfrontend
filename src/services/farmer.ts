import { apiCall } from './api';
import type { 
  FarmerParams, 
  AdoptionParams, 
  PasswordChangeData, 
  WithdrawalData, 
  SearchFilters, 
  MediaUploadData, 
  MediaHeaders,
  Conversation 
} from '@/types/api';

export interface FarmUpdate {
  _id: string;
  title: string;
  content: string;
  images?: string[];
  videos?: string[];
  farmer: string;
  category: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  _id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface WithdrawalRequest {
  _id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  createdAt: string;
}

export interface FarmVisit {
  _id: string;
  adopter: {
    firstName: string;
    lastName: string;
    email: string;
  };
  scheduledDate: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface VisitStats {
  totalVisits: number;
  pendingVisits: number;
  completedVisits: number;
  monthlyVisits: number;
}

export interface FarmerAvailability {
  _id: string;
  farmer: string;
  availableDays: string[];
  timeSlots: Array<{
    start: string;
    end: string;
  }>;
  maxVisitsPerDay: number;
  isActive: boolean;
}

export interface FarmerExpert {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  email: string;
  specialization: string;
  mentorshipId: string;
  startDate: string;
  status: string;
  goals: Array<{
    title: string;
    description: string;
    status: string;
    targetDate: string;
  }>;
  completedGoals: number;
  totalGoals: number;
  conversationId: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

interface Location {
  county: string;
  subCounty: string;
  village?: string;
}

interface FarmSize {
  value: number;
  unit: string;
}

interface Media {
  profileImage?: {
    url: string;
  };
  farmImages?: Array<{
    url: string;
  }>;
}

interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
}

interface SocialMedia {
  facebook?: string;
  twitter?: string;
  instagram?: string;
}

interface FarmersResponse {
  data: {
    farmers: FarmerProfile[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

interface SearchParams {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  crops?: string;
  farmingType?: string;
  experience?: string;
  verified?: boolean;
  minFarmSize?: number;
  maxFarmSize?: number;
  sortBy?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface MediaFile {
  id: string;
  filename: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: number;
  uploaded_at: string;
}

export interface FarmerProfile {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  farmName: string;
  description: string;
  bio?: string;
  farmingType: string[];
  location: {
    county: string;
    subCounty: string;
    village?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  farmSize: {
    value: number;
    unit: string;
  };
  establishedYear?: number;
  cropTypes: string[];
  farmingExperience?: number;
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  media?: {
    profileImage?: {
      url: string;
    };
    farmImages?: Array<{
      url: string;
    }>;
  };
  farmImages?: string[];
  certifications?: Array<{
    name: string;
    issuedBy: string;
    issuedDate: string;
    expiryDate: string;
  }>;
  adoptionPackages?: Array<{
    type: string;
    title: string;
    description: string;
    price: number;
    duration: number;
    benefits: string[];
    deliverables: string[];
  }>;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDocuments?: string[];
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  adoptionStats?: {
    totalAdopters: number;
    currentAdoptions: number;
    totalFunding: number;
  };
  fundingGoal?: number;
  fundingRaised?: number;
  statistics?: {
    totalAdoptions: number;
    activeAdoptions: number;
    rating: number;
    completedProjects: number;
  };
  rating?: {
    average: number;
    count: number;
  };
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
  isAdopted?: boolean;
  isAdoptedByCurrentUser?: boolean;
  activeAdoptionsCount?: number;
}

export interface FarmerAnalytics {
  totalEarnings: number;
  monthlyEarnings: number;
  totalAdoptions: number;
  activeAdoptions: number;
  completedAdoptions: number;
  averageRating: number;
  totalReviews: number;
  upcomingVisits: number;
  pendingPayments: number;
  recentActivities: Array<{
    type: string;
    description: string;
    date: string;
  }>;
}

export const farmerService = {
  // Get all farmers with filters
  getFarmers: async (params?: SearchParams) => {
    console.log('[FARMER SERVICE] getFarmers called with params:', params);
    
    // Create a clean params object for URLSearchParams
    const cleanParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== false) {
          cleanParams[key] = String(value);
        }
      });
    }
    
    const queryString = Object.keys(cleanParams).length > 0 
      ? `?${new URLSearchParams(cleanParams).toString()}` 
      : '';
    console.log('[FARMER SERVICE] Query string:', queryString);
    
    try {
      const response = await apiCall('GET', `/farmers${queryString}`);
      console.log('[FARMER SERVICE] getFarmers response:', response);
      
      // Type assertion with proper interface
      const typedResponse = response as {
        success: boolean;
        data: {
          farmers: FarmerProfile[];
          total?: number;
          pagination?: {
            total: number;
            page: number;
            limit: number;
            pages: number;
          };
        };
      };
      
      console.log('[FARMER SERVICE] Number of farmers returned:', typedResponse?.data?.farmers?.length || 0);
      
      if (typedResponse?.data?.farmers) {
        console.log('[FARMER SERVICE] Farmers details:', typedResponse.data.farmers.map((f: FarmerProfile) => ({
          id: f._id,
          farmName: f.farmName,
          user: f.user,
          location: f.location
        })));
      }
      
      return typedResponse;
    } catch (error) {
      console.error('[FARMER SERVICE] getFarmers error:', error);
      throw error;
    }
  },

  // Get single farmer by ID
  getFarmer: async (farmerId: string) => {
    console.log('[FARMER SERVICE] getFarmer called with ID:', farmerId);
    
    try {
      const response = await apiCall(`GET`, `/farmers/${farmerId}`) as { data: unknown };
      console.log('[FARMER SERVICE] getFarmer response:', response);
      return response;
    } catch (error) {
      console.error('[FARMER SERVICE] getFarmer error:', error);
      throw error;
    }
  },

  // Create farmer profile
  createProfile: async (profileData: Partial<FarmerProfile>) => {
    return await apiCall('POST', '/farmers/profile', profileData);
  },
  
  // Update farmer profile
  updateProfile: async (profileData: Partial<FarmerProfile>) => {
    return await apiCall('PUT', '/farmers/profile', profileData);
  },

  // Partial update farmer profile (PATCH)
  patchProfile: async (profileData: Partial<FarmerProfile>) => {
    // Remove empty strings/null/undefined and empty nested objects
    const clean = (obj: unknown): unknown => {
      if (obj === null || obj === undefined) return undefined;
      if (Array.isArray(obj)) {
        const arr = obj.map(clean).filter((v) => v !== undefined);
        return arr;
      }
      if (typeof obj === 'object') {
        const out: Record<string, unknown> = {};
        Object.keys(obj).forEach((k) => {
          const v = clean((obj as Record<string, unknown>)[k]);
          if (v === undefined) return;
          if (typeof v === 'string' && v.trim() === '') return;
          out[k] = v;
        });
        // If object became empty, return undefined to drop it
        return Object.keys(out).length > 0 ? out : undefined;
      }
      if (typeof obj === 'string') {
        const t = obj.trim();
        return t === '' ? undefined : t;
      }
      return obj;
    };

    const cleaned = clean(profileData) ?? {};
    return await apiCall('PATCH', '/farmers/profile', cleaned);
  },
  
  // Get current farmer profile (for logged in farmer)
  getMyProfile: async () => {
    return await apiCall<{ success: boolean; data: { profile: FarmerProfile } }>('GET', '/farmers/me');
  },

  // Get farmer's adopters (current user)
  getFarmerAdopters: async () => {
    return await apiCall('GET', '/farmers/adopters');
  },

  // Get farmer's adoptions (by farmer ID)
  getFarmerAdoptions: async (farmerId: string, params?: { status?: string; page?: number; limit?: number }) => {
    const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return await apiCall('GET', `/farmers/${farmerId}/adoptions${queryString}`);
  },

  // Get farmer analytics
  getFarmerAnalytics: async (farmerId: string) => {
    return await apiCall<{ success: boolean; data: FarmerAnalytics }>('GET', `/farmers/${farmerId}/analytics`);
  },

  // Update adoption package
  updateAdoptionPackage: async (farmerId: string, packageData: Partial<FarmerProfile['adoptionPackages'][0]>) => {
    return await apiCall('PUT', `/farmers/${farmerId}/packages`, packageData);
  },

  // Get farmer's messages/conversations
  getFarmerMessages: async (farmerId: string) => {
    return await apiCall('GET', `/farmers/${farmerId}/messages`);
  },

  // Update verification status (Admin only)
  updateVerificationStatus: async (farmerId: string, status: 'pending' | 'verified' | 'rejected', notes?: string) => {
    return await apiCall('PUT', `/farmers/${farmerId}/verify`, { status, notes });
  },

    // Farm Updates Management
  async getFarmUpdates(params?: string): Promise<{ updates: FarmUpdate[], pagination: { page: number; limit: number; total: number; pages: number } }> {
    const queryString = params ? `?${params}` : '';
    const response = await apiCall<{ success: boolean; data: { updates: FarmUpdate[], pagination: { page: number; limit: number; total: number; pages: number } } }>('GET', `/farm-updates${queryString}`);
    return response.data;
  },

  async createFarmUpdate(updateData: Partial<FarmUpdate>): Promise<{ update: FarmUpdate }> {
    return apiCall('POST', '/farm-updates', updateData);
  },

  async updateFarmUpdate(id: string, data: Partial<FarmUpdate>): Promise<{ update: FarmUpdate }> {
    return apiCall('PUT', `/farm-updates/${id}`, data);
  },

  async deleteFarmUpdate(id: string): Promise<void> {
    return apiCall('DELETE', `/farm-updates/${id}`);
  },

  async toggleUpdatePin(id: string): Promise<{ update: FarmUpdate }> {
    return apiCall('PUT', `/farm-updates/${id}/pin`);
  },

  // Media Management
  async uploadMedia(formData: FormData): Promise<{ media: MediaFile }> {
    return apiCall('POST', '/farm-updates/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  async getMediaLibrary(): Promise<MediaFile[]> {
    const response = await apiCall<{ success: boolean; data: { media: MediaFile[] } }>('GET', '/farm-updates/media');
    return response.data.media;
  },

  async deleteMedia(id: string): Promise<void> {
    return apiCall('DELETE', `/farm-updates/media/${id}`);
  },

  // Visit Management
  getFarmingCategories: async () => {
    return await apiCall('GET', '/farmers/categories');
  },

  // Search farmers
  searchFarmers: async (query: string, filters?: SearchFilters) => {
    return await apiCall('GET', `/farmers/search?q=${encodeURIComponent(query)}`, { params: filters });
  },

  // Get featured farmers
  getFeaturedFarmers: async () => {
    return await apiCall('GET', '/farmers/featured');
  },

  // Farmer Dashboard Specific Endpoints
  async getDashboardData(): Promise<{ data: FarmerAnalytics }> {
    return apiCall('GET', '/farmers/dashboard');
  },

  async getReports(period?: string): Promise<{ reports: Record<string, unknown> }> {
    const query = period ? `?period=${period}` : '';
    return apiCall('GET', `/farmers/reports${query}`);
  },

  async getSettings(): Promise<{ settings: Record<string, unknown> }> {
    return apiCall('GET', '/farmers/settings');
  },

  async updateSettings(settings: Record<string, unknown>): Promise<{ settings: Record<string, unknown> }> {
    return apiCall('PUT', '/farmers/settings', settings);
  },

  async changePassword(passwordData: PasswordChangeData): Promise<{ success: boolean }> {
    return apiCall('PUT', '/farmers/change-password', passwordData);
  },

  // Wallet Management
  async getWalletBalance(): Promise<{ balance: number; currency: string }> {
    return apiCall('GET', '/farmers/wallet/balance');
  },

  async getWalletTransactions(params?: Record<string, string>): Promise<{ transactions: WalletTransaction[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiCall('GET', `/farmers/wallet/transactions${query}`);
  },

  async requestWithdrawal(withdrawalData: WithdrawalData): Promise<{ withdrawal: WithdrawalRequest }> {
    return apiCall('POST', '/wallet/withdraw', withdrawalData);
  },

  async getWithdrawalRequests(): Promise<{ withdrawals: WithdrawalRequest[] }> {
    return apiCall('GET', '/wallet/withdrawals');
  },

  // Visit Management
  async getFarmVisits(params?: Record<string, string>): Promise<{ visits: FarmVisit[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiCall('GET', `/farmers/visits${query}`);
  },

  async getVisitStats(): Promise<{ stats: VisitStats }> {
    return apiCall('GET', '/farmers/visits/stats');
  },

  async getAvailability(): Promise<{ availability: FarmerAvailability }> {
    return apiCall('GET', '/farmers/availability');
  },

  async setAvailability(availability: Partial<FarmerAvailability>): Promise<{ availability: FarmerAvailability }> {
    return apiCall('POST', '/farmers/availability', availability);
  },

  // Message Management
  async getConversations(): Promise<{ conversations: Conversation[] }> {
    return apiCall('GET', '/farmers/conversations');
  },

  async getUnreadMessageCount(): Promise<{ count: number }> {
    return apiCall('GET', '/farmers/messages/unread-count');
  },

  // Expert Management
  async getAssignedExperts(): Promise<{ data: { experts: FarmerExpert[] } }> {
    return apiCall('GET', '/farmers/experts');
  }
};