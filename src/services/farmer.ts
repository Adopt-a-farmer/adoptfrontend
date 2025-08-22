import { apiCall } from './api';

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
  user: string;
  farmName: string;
  bio: string;
  farmingType: string[];
  location: {
    state: string;
    city: string;
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  farmSize: {
    value: number;
    unit: string;
  };
  establishedYear: number;
  contactInfo: {
    phone: string;
    whatsapp?: string;
    email?: string;
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  farmImages: string[];
  certifications: string[];
  adoptionPackages: Array<{
    type: string;
    title: string;
    description: string;
    price: number;
    duration: number;
    benefits: string[];
    deliverables: string[];
  }>;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDocuments: string[];
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  statistics: {
    totalAdoptions: number;
    activeAdoptions: number;
    rating: number;
    completedProjects: number;
  };
  createdAt: string;
  updatedAt: string;
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
  getFarmers: async (params?: {
    page?: number;
    limit?: number;
    farmingType?: string;
    location?: string;
    verified?: boolean;
    search?: string;
  }) => {
    console.log('[FARMER SERVICE] getFarmers called with params:', params);
    
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    console.log('[FARMER SERVICE] Query string:', queryString);
    
    try {
      const response = await apiCall('GET', `/farmers${queryString}`) as any;
      console.log('[FARMER SERVICE] getFarmers response:', response);
      console.log('[FARMER SERVICE] Number of farmers returned:', response?.data?.farmers?.length || 0);
      
      if (response?.data?.farmers) {
        console.log('[FARMER SERVICE] Farmers details:', response.data.farmers.map((f: any) => ({
          id: f._id,
          farmName: f.farmName,
          user: f.user,
          location: f.location
        })));
      }
      
      return response;
    } catch (error) {
      console.error('[FARMER SERVICE] getFarmers error:', error);
      throw error;
    }
  },

  // Get single farmer by ID
  getFarmer: async (farmerId: string) => {
    console.log('[FARMER SERVICE] getFarmer called with ID:', farmerId);
    
    try {
      const response = await apiCall(`GET`, `/farmers/${farmerId}`) as any;
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
    const clean = (obj: any): any => {
      if (obj === null || obj === undefined) return undefined;
      if (Array.isArray(obj)) {
        const arr = obj.map(clean).filter((v) => v !== undefined);
        return arr;
      }
      if (typeof obj === 'object') {
        const out: any = {};
        Object.keys(obj).forEach((k) => {
          const v = clean((obj as any)[k]);
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
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return await apiCall('GET', `/farmers/${farmerId}/adoptions${queryString}`);
  },

  // Get farmer analytics
  getFarmerAnalytics: async (farmerId: string) => {
    return await apiCall<{ success: boolean; data: FarmerAnalytics }>('GET', `/farmers/${farmerId}/analytics`);
  },

  // Update adoption package
  updateAdoptionPackage: async (farmerId: string, packageData: any) => {
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
  async getFarmUpdates(params?: string): Promise<{ updates: any[], pagination: any }> {
    const queryString = params ? `?${params}` : '';
    return apiCall('GET', `/farm-updates${queryString}`);
  },

  async createFarmUpdate(updateData: any): Promise<any> {
    return apiCall('POST', '/farm-updates', updateData);
  },

  async updateFarmUpdate(id: string, data: any): Promise<any> {
    return apiCall('PUT', `/farm-updates/${id}`, data);
  },

  async deleteFarmUpdate(id: string): Promise<void> {
    return apiCall('DELETE', `/farm-updates/${id}`);
  },

  async toggleUpdatePin(id: string): Promise<any> {
    return apiCall('PUT', `/farm-updates/${id}/pin`);
  },

  // Media Management
  async uploadMedia(formData: FormData): Promise<any> {
    return apiCall('POST', '/farm-updates/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  async getMediaLibrary(): Promise<MediaFile[]> {
    return apiCall('GET', '/farm-updates/media');
  },

  async deleteMedia(id: string): Promise<void> {
    return apiCall('DELETE', `/farm-updates/media/${id}`);
  },

  // Visit Management
  getFarmingCategories: async () => {
    return await apiCall('GET', '/farmers/categories');
  },

  // Search farmers
  searchFarmers: async (query: string, filters?: any) => {
    return await apiCall('GET', `/farmers/search?q=${encodeURIComponent(query)}`, { params: filters });
  },

  // Get featured farmers
  getFeaturedFarmers: async () => {
    return await apiCall('GET', '/farmers/featured');
  },
};