import { apiCall } from './api';

export interface CrowdfundingProject {
  _id: string;
  title: string;
  description: string;
  story: string;
  farmer: {
    _id: string;
    farmName: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    location: {
      state: string;
      city: string;
    };
  };
  category: string;
  goalAmount: number;
  progress: {
    raised: number;
    percentage: number;
  };
  backers: Array<{
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    amount: number;
    message?: string;
    date: string;
  }>;
  images: string[];
  video?: string;
  rewards: Array<{
    amount: number;
    title: string;
    description: string;
    deliverables: string[];
    estimatedDelivery: string;
    limitedQuantity?: number;
    claimed?: number;
  }>;
  timeline: Array<{
    phase: string;
    description: string;
    duration: string;
    milestones: string[];
  }>;
  updates: Array<{
    title: string;
    content: string;
    images?: string[];
    author: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    date: string;
  }>;
  status: 'draft' | 'active' | 'funded' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  tags: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export const crowdfundingService = {
  // Get all projects
  getProjects: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: 'latest' | 'ending' | 'progress' | 'goal';
    status?: string;
  }) => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return await apiCall<{
      success: boolean;
      data: {
        projects: CrowdfundingProject[];
        pagination: any;
      };
    }>('GET', `/crowdfunding/projects${queryString}`);
  },

  // Get single project
  getProject: async (projectId: string) => {
    return await apiCall<{
      success: boolean;
      data: { project: CrowdfundingProject };
    }>('GET', `/crowdfunding/projects/${projectId}`);
  },

  // Create project (Farmers only)
  createProject: async (projectData: {
    title: string;
    description: string;
    story: string;
    category: string;
    goalAmount: number;
    images: string[];
    video?: string;
    rewards: any[];
    timeline: any[];
    endDate: string;
    tags: string[];
  }) => {
    return await apiCall('POST', '/crowdfunding/projects', projectData);
  },

  // Update project
  updateProject: async (projectId: string, projectData: Partial<CrowdfundingProject>) => {
    return await apiCall('PUT', `/crowdfunding/projects/${projectId}`, projectData);
  },

  // Back a project
  backProject: async (projectId: string, backingData: {
    amount: number;
    message?: string;
    rewardId?: string;
  }) => {
    return await apiCall<{
      success: boolean;
      data: {
        paymentUrl: string;
        reference: string;
      };
    }>('POST', `/crowdfunding/projects/${projectId}/back`, backingData);
  },

  // Verify crowdfunding payment
  verifyPayment: async (reference: string) => {
    return await apiCall('POST', '/crowdfunding/verify-payment', { reference });
  },

  // Add project update
  addUpdate: async (projectId: string, updateData: {
    title: string;
    content: string;
    images?: string[];
  }) => {
    return await apiCall('POST', `/crowdfunding/projects/${projectId}/updates`, updateData);
  },

  // Get project backers
  getProjectBackers: async (projectId: string) => {
    return await apiCall('GET', `/crowdfunding/projects/${projectId}/backers`);
  },

  // Get project updates
  getProjectUpdates: async (projectId: string) => {
    return await apiCall('GET', `/crowdfunding/projects/${projectId}/updates`);
  },

  // Get user's backed projects
  getBackedProjects: async () => {
    return await apiCall('GET', '/crowdfunding/backed');
  },

  // Get user's created projects (Farmers)
  getMyProjects: async () => {
    return await apiCall('GET', '/crowdfunding/my-projects');
  },

  // Get featured projects
  getFeaturedProjects: async () => {
    return await apiCall('GET', '/crowdfunding/featured');
  },

  // Get trending projects
  getTrendingProjects: async () => {
    return await apiCall('GET', '/crowdfunding/trending');
  },

  // Get project categories
  getCategories: async () => {
    return await apiCall('GET', '/crowdfunding/categories');
  },

  // Search projects
  searchProjects: async (query: string, filters?: any) => {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
    }
    
    return await apiCall('GET', `/crowdfunding/search?${params.toString()}`);
  },

  // Follow project for updates
  followProject: async (projectId: string) => {
    return await apiCall('POST', `/crowdfunding/projects/${projectId}/follow`);
  },

  // Unfollow project
  unfollowProject: async (projectId: string) => {
    return await apiCall('DELETE', `/crowdfunding/projects/${projectId}/follow`);
  },

  // Share project
  shareProject: async (projectId: string, platform: string) => {
    return await apiCall('POST', `/crowdfunding/projects/${projectId}/share`, { platform });
  },

  // Report project
  reportProject: async (projectId: string, reason: string) => {
    return await apiCall('POST', `/crowdfunding/projects/${projectId}/report`, { reason });
  },

  // Cancel project (Project owner only)
  cancelProject: async (projectId: string, reason: string) => {
    return await apiCall('POST', `/crowdfunding/projects/${projectId}/cancel`, { reason });
  },

  // Get project analytics (Project owner only)
  getProjectAnalytics: async (projectId: string) => {
    return await apiCall('GET', `/crowdfunding/projects/${projectId}/analytics`);
  },
};