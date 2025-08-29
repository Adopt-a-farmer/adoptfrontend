import { apiCall } from './api';

export interface AdoptionRequest {
  farmerId: string;
  adoptionType?: string;
  adoptionDetails?: {
    monthlyContribution: number;
    currency: string;
    message?: string;
  };
  paymentPlan?: {
    type: string;
    amount: number;
    currency: string;
  };
}

export interface Adoption {
  _id: string;
  farmer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  adopter: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  monthlyContribution: number;
  currency: string;
  status: 'pending' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  totalContributed: number;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdoptionStats {
  totalAdoptions: number;
  activeAdoptions: number;
  totalContributed: number;
  currency: string;
}

export const adoptionService = {
  // Create a new adoption
  async createAdoption(data: { farmerId: string; monthlyContribution: number; currency: string; message?: string }): Promise<{ success: boolean; data?: Adoption; message?: string }> {
    try {
      const adoptionData = {
        farmerId: data.farmerId,
        adoptionType: 'monthly_support',
        adoptionDetails: {
          monthlyContribution: data.monthlyContribution,
          currency: data.currency,
          message: data.message
        },
        paymentPlan: {
          type: 'monthly',
          amount: data.monthlyContribution,
          currency: data.currency
        }
      };
      return await apiCall('POST', '/adopters/adopt-farmer', adoptionData);
    } catch (error: unknown) {
      console.error('Failed to create adoption:', error);
      const err = error as { response?: { status?: number } };
      if (err?.response?.status === 404) {
        return {
          success: false,
          message: 'Adoption service is currently unavailable. Please try again later.'
        };
      }
      throw error;
    }
  },

  // Get all my adoptions
  async getMyAdoptions(): Promise<{ success: boolean; data: Adoption[] }> {
    try {
      return await apiCall('GET', '/adopters/adopted-farmers');
    } catch (error) {
      console.error('Failed to fetch adoptions:', error);
      return { success: false, data: [] };
    }
  },

  // Get adoption by ID
  async getAdoption(adoptionId: string): Promise<{ success: boolean; data: Adoption }> {
    try {
      return await apiCall('GET', `/adopters/adoptions/${adoptionId}`);
    } catch (error) {
      console.error('Failed to fetch adoption:', error);
      throw error;
    }
  },

  // Update adoption (pause/resume/contribute)
  async updateAdoption(adoptionId: string, updates: Partial<AdoptionRequest>): Promise<{ success: boolean; data: Adoption }> {
    try {
      return await apiCall('PUT', `/adopters/adoptions/${adoptionId}`, updates);
    } catch (error) {
      console.error('Failed to update adoption:', error);
      throw error;
    }
  },

  // Cancel adoption
  async cancelAdoption(adoptionId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    try {
      return await apiCall('DELETE', `/adopters/adoptions/${adoptionId}`, { reason });
    } catch (error) {
      console.error('Failed to cancel adoption:', error);
      throw error;
    }
  },

  // Get adoption statistics
  async getAdoptionStats(): Promise<{ success: boolean; data: AdoptionStats }> {
    try {
      return await apiCall('GET', '/adopters/adoptions/stats');
    } catch (error) {
      console.error('Failed to fetch adoption stats:', error);
      return {
        success: false,
        data: {
          totalAdoptions: 0,
          activeAdoptions: 0,
          totalContributed: 0,
          currency: 'KES'
        }
      };
    }
  },

  // Check if farmer is adopted by current user
  async isAdopted(farmerId: string): Promise<boolean> {
    try {
      const response = await apiCall('GET', `/adopters/adoptions/check/${farmerId}`) as { data?: { isAdopted?: boolean } };
      return response.data?.isAdopted || false;
    } catch (error) {
      console.error('Failed to check adoption status:', error);
      return false;
    }
  }
};

export default adoptionService;