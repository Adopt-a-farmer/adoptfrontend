import api from './api';

export interface DashboardStats {
  users: {
    total: number;
    farmers: number;
    adopters: number;
    experts: number;
    newThisMonth: number;
    newThisWeek: number;
  };
  farmers: {
    verified: number;
    pending: number;
    rejected: number;
    total: number;
  };
  financial: {
    totalRevenue: number;
    revenueThisMonth: number;
    recentPayments: number;
  };
  activity: {
    adoptions: {
      total: number;
      active: number;
      recent: number;
    };
    projects: {
      total: number;
      active: number;
    };
    visits: {
      total: number;
      completed: number;
    };
  };
  content: {
    articles: {
      total: number;
      published: number;
    };
    messages: number;
  };
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  avatar?: {
    url: string;
    publicId: string;
  };
}

export interface PaginationInfo {
  current: number;
  pages: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [K in string]: K extends 'pagination' ? PaginationInfo : T[];
  } & {
    pagination: PaginationInfo;
  };
}

export interface AdminUser extends User {
  verificationNotes?: string;
  deactivationReason?: string;
  deactivatedAt?: string;
}

export interface FarmerProfile {
  _id: string;
  user: User;
  farmName: string;
  description: string;
  location: {
    county: string;
    subCounty: string;
    village?: string;
  };
  farmSize: {
    value: number;
    unit: string;
  };
  farmingType: string[];
  cropTypes: string[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationNotes?: string;
  rating: {
    average: number;
    count: number;
  };
  adoptionStats: {
    totalAdopters: number;
    totalFunding: number;
    currentAdoptions: number;
  };
  isActive: boolean;
  createdAt: string;
}

export interface ExpertProfile {
  _id: string;
  user: User;
  specializations: string[];
  bio: string;
  experience: {
    yearsOfExperience: number;
    education: Array<{
      institution: string;
      degree: string;
      field: string;
      year: number;
    }>;
    certifications: Array<{
      name: string;
      issuingOrganization: string;
      issueDate: string;
      expiryDate?: string;
    }>;
  };
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDocuments: Array<{
    _id: string;
    type: string;
    url: string;
    fileName: string;
    status: 'pending' | 'approved' | 'rejected';
    uploadDate: string;
  }>;
  statistics: {
    totalMentorships: number;
    activeMentorships: number;
    averageRating: number;
  };
  isActive: boolean;
  createdAt: string;
}

export interface AdopterProfile {
  _id: string;
  user: User;
  adopterType: string;
  interests: {
    farmingTypes: string[];
  };
  adoptionHistory: {
    totalAdoptions: number;
    totalContributed: number;
    activeAdoptions: number;
  };
  isActive: boolean;
  createdAt: string;
}

export interface AdopterWithFarmers {
  _id: string;
  adopterInfo: User;
  adopterProfile?: AdopterProfile;
  adoptedFarmers: {
    adoptionId: string;
    farmer: User;
    farmerProfile?: FarmerProfile;
    adoptionType: string;
    status: string;
    paymentPlan: {
      amount: number;
      totalPaid: number;
    };
    createdAt: string;
    expectedReturns?: {
      estimatedRevenue: number;
      expectedProfit: number;
      roi: number;
    };
    actualReturns?: {
      totalRevenue: number;
      profit: number;
      actualRoi: number;
    };
  }[];
  totalAdoptions: number;
  activeAdoptions: number;
  totalAmountPaid: number;
}

export interface VerificationUser {
  _id: string;
  type: 'farmer' | 'expert';
  name: string;
  fullName: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationNotes?: string;
  user: User;
  createdAt: string;
  // Farmer specific fields
  farmName?: string;
  farmingType?: string;
  farmSize?: number;
  location?: {
    city: string;
    state: string;
    coordinates?: [number, number];
  };
  // Expert specific fields
  specializations?: string[];
  experience?: number | {
    yearsOfExperience?: number;
    education?: Array<{
      institution: string;
      degree: string;
      field: string;
      year: number;
    }>;
    certifications?: Array<{
      name: string;
      issuingOrganization: string;
      issueDate: string;
      expiryDate: string;
      certificateUrl: string;
    }>;
    previousWork?: Array<{
      organization: string;
      position: string;
      startDate: string;
      endDate: string;
      description: string;
    }>;
  };
  hourlyRate?: number;
  bio?: string;
}

export interface VerificationStats {
  total: number;
  farmers: number;
  experts: number;
  pending: {
    farmers: number;
    experts: number;
  };
  verified: {
    farmers: number;
    experts: number;
  };
  rejected: {
    farmers: number;
    experts: number;
  };
}

export interface VerificationResponse {
  users: VerificationUser[];
  stats: VerificationStats;
  pagination: {
    current: number;
    pages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface Allocation {
  _id: string;
  farmer: FarmerProfile;
  adopter: AdopterProfile;
  status: string;
  adoptionDate: string;
  monthlyContribution: number;
  totalContributed: number;
  duration: number;
  notes?: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  sender: User;
  recipient: User;
  conversationId: string;
  messageType: 'text' | 'image' | 'video' | 'file';
  content: {
    text?: string;
    media?: {
      url: string;
      fileName: string;
    };
  };
  isRead: boolean;
  isDelivered: boolean;
  createdAt: string;
}

export interface FarmerAvailability {
  _id: string;
  farmer: FarmerProfile;
  date: string;
  timeSlots: string[];
  createdAt: string;
}

// Admin API service
export const adminService = {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get('/admin/dashboard');
    return response.data.data;
  },

  async getAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d') {
    const response = await api.get(`/admin/analytics?period=${period}`);
    return response.data.data;
  },

  // User Management
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<AdminUser>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.role) query.append('role', params.role);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const response = await api.get(`/admin/users?${query.toString()}`);
    return response.data;
  },

  async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
    profileData?: Record<string, unknown>;
  }) {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  async verifyUser(userId: string, data: { isVerified: boolean; notes?: string }) {
    const response = await api.put(`/admin/users/${userId}/verify`, data);
    return response.data;
  },

  async updateUserStatus(userId: string, data: { isActive: boolean; reason?: string }) {
    const response = await api.put(`/admin/users/${userId}/status`, data);
    return response.data;
  },

  // Farmer Management
  async getAllFarmers(params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
  }): Promise<PaginatedResponse<FarmerProfile>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);

    const response = await api.get(`/admin/farmers?${query.toString()}`);
    return response.data;
  },

  async getFarmerById(farmerId: string): Promise<{ success: boolean; data: { farmer: FarmerProfile } }> {
    const response = await api.get(`/admin/farmers/${farmerId}`);
    return response.data;
  },

  async verifyFarmer(farmerId: string, data: { status: string; notes?: string }) {
    const response = await api.put(`/admin/farmers/${farmerId}/verify`, data);
    return response.data;
  },

  // Expert Management
  async getAllExperts(params?: {
    page?: number;
    limit?: number;
    status?: string;
    specialization?: string;
    search?: string;
  }): Promise<PaginatedResponse<ExpertProfile>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.specialization) query.append('specialization', params.specialization);
    if (params?.search) query.append('search', params.search);

    const response = await api.get(`/admin/experts?${query.toString()}`);
    return response.data;
  },

  async verifyExpert(expertId: string, data: {
    status: string;
    notes?: string;
    documentApprovals?: Array<{ documentId: string; status: string }>;
  }) {
    const response = await api.put(`/admin/experts/${expertId}/verify`, data);
    return response.data;
  },

  // Adopter Management
  async getAllAdopters(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<AdopterProfile>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const response = await api.get(`/admin/adopters-simple?${query.toString()}`);
    return response.data;
  },

  async getAllAdoptersWithFarmers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<AdopterWithFarmers>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);

    const response = await api.get(`/admin/adopters?${query.toString()}`);
    return response.data;
  },

  // Allocation Management
  async getAllAllocations(params?: {
    page?: number;
    limit?: number;
    status?: string;
    farmerId?: string;
    adopterId?: string;
  }): Promise<PaginatedResponse<Allocation>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.farmerId) query.append('farmerId', params.farmerId);
    if (params?.adopterId) query.append('adopterId', params.adopterId);

    const response = await api.get(`/admin/allocations?${query.toString()}`);
    return response.data;
  },

  // Message Monitoring
  async getAllMessages(params?: {
    page?: number;
    limit?: number;
    conversationId?: string;
    senderId?: string;
    recipientId?: string;
    messageType?: string;
  }): Promise<PaginatedResponse<Message>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.conversationId) query.append('conversationId', params.conversationId);
    if (params?.senderId) query.append('senderId', params.senderId);
    if (params?.recipientId) query.append('recipientId', params.recipientId);
    if (params?.messageType) query.append('messageType', params.messageType);

    const response = await api.get(`/admin/messages?${query.toString()}`);
    return response.data;
  },

  // Farmer Availability
  async getFarmerAvailability(params?: {
    page?: number;
    limit?: number;
    farmerId?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<FarmerAvailability>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.farmerId) query.append('farmerId', params.farmerId);
    if (params?.date) query.append('date', params.date);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);

    const response = await api.get(`/admin/farmer-availability?${query.toString()}`);
    return response.data;
  },

  // Payment Management
  async getAllPayments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.type) query.append('type', params.type);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);

    const response = await api.get(`/admin/payments?${query.toString()}`);
    return response.data;
  },

  // Get all users for verification (farmers and experts combined)
  async getAllForVerification(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.type) query.append('type', params.type);

    const response = await api.get(`/admin/verification?${query.toString()}`);
    return response.data;
  }
};

export default adminService;