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

export interface PaymentResponse {
  success: boolean;
  data?: {
    authorization_url: string;
    reference: string;
    access_code: string;
  };
  message?: string;
}

export interface AdoptionResponse {
  success: boolean;
  data?: Adoption;
  message?: string;
}

export interface AdoptionCreateResponse {
  success: boolean;
  data?: Adoption;
  message?: string;
  paymentUrl?: string;
}

export const adoptionService = {
  // Create a new adoption
  async createAdoption(data: { farmerId: string; monthlyContribution: number; currency: string; message?: string }): Promise<AdoptionCreateResponse> {
    try {
      // First, create the adoption record
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

      console.log('Creating adoption with data:', adoptionData);
      
      const adoptionResponse = await apiCall('POST', '/adopters/adopt-farmer', adoptionData) as AdoptionResponse;
      
      if (!adoptionResponse.success) {
        return {
          success: false,
          message: adoptionResponse.message || 'Failed to create adoption.'
        };
      }

      // Then initialize payment with adoption ID
      const paymentData = {
        amount: data.monthlyContribution,
        currency: data.currency,
        paymentType: 'adoption',
        paymentMethod: 'card',
        description: `Monthly support for farmer adoption`,
        metadata: {
          farmerId: data.farmerId,
          adoptionId: adoptionResponse.data?._id,
          adoptionType: 'monthly_support',
          purpose: 'farmer_adoption'
        }
      };

      console.log('Initializing payment with data:', paymentData);

      const paymentResponse = await apiCall('POST', '/payments/initialize', paymentData) as PaymentResponse;
      
      if (!paymentResponse.success) {
        // If payment fails, we should probably clean up the adoption
        console.error('Payment initialization failed:', paymentResponse.message);
        return {
          success: false,
          message: paymentResponse.message || 'Failed to initialize payment. Please try again.'
        };
      }

      return {
        success: true,
        data: adoptionResponse.data,
        paymentUrl: paymentResponse.data?.authorization_url,
        message: 'Adoption created successfully. Complete payment to activate.'
      };
    } catch (error: unknown) {
      console.error('Failed to create adoption:', error);
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      if (err?.response?.status === 404) {
        return {
          success: false,
          message: 'Adoption service is currently unavailable. Please try again later.'
        };
      }
      return {
        success: false,
        message: err?.response?.data?.message || 'Failed to create adoption. Please try again.'
      };
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