import { apiCall } from './api';

export interface ContributionRequest {
  farmerId: string;
  adoptionId?: string;
  amount: number;
  currency: string;
  contributionType: 'additional' | 'monthly' | 'one-time';
  message?: string;
  paymentMethod?: 'card' | 'mobile_money';
}

export interface Contribution {
  _id: string;
  adopter: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  farmer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  adoption?: string;
  amount: number;
  currency: string;
  contributionType: 'additional' | 'monthly' | 'one-time';
  status: 'pending' | 'completed' | 'failed';
  paymentReference?: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContributionResponse {
  success: boolean;
  data?: {
    contribution: Contribution;
    payment: {
      authorization_url: string;
      access_code: string;
      reference: string;
    };
  };
  message?: string;
}

export interface FarmerContributions {
  totalContributions: number;
  monthlyContributions: number;
  additionalContributions: number;
  lastContribution?: {
    amount: number;
    date: string;
    adopter: string;
  };
  recentContributions: Array<{
    amount: number;
    date: string;
    adopter: {
      firstName: string;
      lastName: string;
    };
    type: string;
  }>;
}

export const contributionService = {
  // Make additional contribution to farmer
  async makeContribution(data: ContributionRequest): Promise<ContributionResponse> {
    try {
      console.log('Making contribution:', data);
      
      const response = await apiCall('POST', '/adopters/contribute', data) as {
        success: boolean;
        message?: string;
        data?: {
          contribution: Contribution;
          payment: {
            authorization_url: string;
            access_code: string;
            reference: string;
          };
        };
      };
      
      if (!response.success) {
        return {
          success: false,
          message: response.message || 'Failed to initialize contribution payment.'
        };
      }

      return {
        success: true,
        data: response.data,
        message: 'Contribution initiated successfully. Complete payment to confirm.'
      };
    } catch (error: unknown) {
      console.error('Failed to make contribution:', error);
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      return {
        success: false,
        message: err?.response?.data?.message || 'Failed to make contribution. Please try again.'
      };
    }
  },

  // Get contributions for a specific farmer (adopter view)
  async getFarmerContributions(farmerId: string): Promise<{
    success: boolean;
    data: Contribution[];
  }> {
    try {
      return await apiCall('GET', `/adopters/farmers/${farmerId}/contributions`);
    } catch (error) {
      console.error('Failed to fetch farmer contributions:', error);
      return { success: false, data: [] };
    }
  },

  // Get my contribution history
  async getMyContributions(): Promise<{
    success: boolean;
    data: Contribution[];
  }> {
    try {
      return await apiCall('GET', '/adopters/contributions');
    } catch (error) {
      console.error('Failed to fetch contribution history:', error);
      return { success: false, data: [] };
    }
  },

  // Get contribution statistics for adopter
  async getContributionStats(): Promise<{
    success: boolean;
    data: {
      totalContributions: number;
      monthlyContributions: number;
      additionalContributions: number;
      farmersSupported: number;
    };
  }> {
    try {
      return await apiCall('GET', '/adopters/contributions/stats');
    } catch (error) {
      console.error('Failed to fetch contribution stats:', error);
      return {
        success: false,
        data: {
          totalContributions: 0,
          monthlyContributions: 0,
          additionalContributions: 0,
          farmersSupported: 0
        }
      };
    }
  },

  // Update monthly contribution amount
  async updateMonthlyContribution(adoptionId: string, newAmount: number): Promise<{
    success: boolean;
    data?: { adoption: unknown };
    message?: string;
  }> {
    try {
      const response = await apiCall('PUT', `/adopters/adoptions/${adoptionId}/contribution`, {
        monthlyContribution: newAmount
      }) as { data?: { adoption: unknown } };
      return {
        success: true,
        data: response.data,
        message: 'Monthly contribution updated successfully'
      };
    } catch (error: unknown) {
      console.error('Failed to update monthly contribution:', error);
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err?.response?.data?.message || 'Failed to update monthly contribution'
      };
    }
  },

  // Verify contribution payment
  async verifyContribution(reference: string): Promise<{
    success: boolean;
    data?: { payment: unknown; verified: boolean };
    message?: string;
  }> {
    try {
      return await apiCall('POST', '/payments/verify', { reference });
    } catch (error) {
      console.error('Failed to verify contribution payment:', error);
      throw error;
    }
  }
};

export default contributionService;
