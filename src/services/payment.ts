import { apiCall } from './api';

export interface Payment {
  _id: string;
  user: string;
  amount: number;
  type: 'adoption' | 'crowdfunding' | 'visit' | 'subscription';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference: string;
  gateway: 'paystack';
  metadata?: any;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentInitialization {
  amount: number;
  type: string;
  metadata?: any;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data: {
    paymentUrl: string;
    reference: string;
  };
}

export interface PaymentVerification {
  success: boolean;
  message: string;
  data: {
    payment: Payment;
    verified: boolean;
  };
}

export const paymentService = {
  // Initialize payment
  initializePayment: async (paymentData: PaymentInitialization): Promise<PaymentResponse> => {
    return await apiCall<PaymentResponse>('POST', '/payments/initialize', paymentData);
  },

  // Verify payment
  verifyPayment: async (reference: string): Promise<PaymentVerification> => {
    return await apiCall<PaymentVerification>('POST', '/payments/verify', { reference });
  },

  // Get user's payment history
  getPaymentHistory: async (params?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return await apiCall('GET', `/payments${queryString}`);
  },

  // Get payment by ID
  getPayment: async (paymentId: string) => {
    return await apiCall('GET', `/payments/${paymentId}`);
  },

  // Get payment statistics
  getPaymentStats: async () => {
    return await apiCall('GET', '/payments/stats');
  },

  // Process refund (Admin only)
  processRefund: async (paymentId: string, reason?: string) => {
    return await apiCall('POST', `/payments/${paymentId}/refund`, { reason });
  },

  // Get payment methods
  getPaymentMethods: async () => {
    return await apiCall('GET', '/payments/methods');
  },

  // Calculate adoption payment
  calculateAdoptionPayment: async (farmerId: string, packageType: string, duration: number) => {
    return await apiCall('POST', '/payments/calculate', {
      type: 'adoption',
      farmerId,
      packageType,
      duration
    });
  },

  // Process withdrawal (Farmer)
  requestWithdrawal: async (amount: number, bankDetails: any) => {
    return await apiCall('POST', '/payments/withdraw', { amount, bankDetails });
  },

  // Get withdrawal history
  getWithdrawals: async (params?: { status?: string; page?: number; limit?: number }) => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return await apiCall('GET', `/payments/withdrawals${queryString}`);
  },

  // Approve withdrawal (Admin only)
  approveWithdrawal: async (withdrawalId: string) => {
    return await apiCall('POST', `/payments/withdrawals/${withdrawalId}/approve`);
  },

  // Reject withdrawal (Admin only)
  rejectWithdrawal: async (withdrawalId: string, reason: string) => {
    return await apiCall('POST', `/payments/withdrawals/${withdrawalId}/reject`, { reason });
  },
};