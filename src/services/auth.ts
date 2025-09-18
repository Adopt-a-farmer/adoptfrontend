import { apiCall } from './api';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'farmer' | 'adopter' | 'expert' | 'admin' | 'investor' | 'buyer' | 'logistics_partner';
  phone?: string;
  phoneNumber?: string;
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: Record<string, unknown>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: 'farmer' | 'adopter' | 'expert' | 'admin' | 'investor' | 'buyer' | 'logistics_partner';
  avatar?: string;
  farmerProfile?: {
    farmName: string;
    description: string;
    location: {
      county: string;
      subCounty: string;
      village?: string;
    };
    farmSize: {
      value: number;
      unit: 'acres' | 'hectares';
    };
    establishedYear?: number;
    farmingType: string[];
    cropTypes?: string[];
    farmingMethods?: string[];
    contactInfo?: {
      phone: string;
      email: string;
      website?: string;
    };
    socialMedia?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
    };
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export const authService = {
  // Register new user
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    return await apiCall<AuthResponse>('POST', '/auth/register', userData);
  },

  // Signup (alias for register)
  signup: async (userData: RegisterData): Promise<AuthResponse> => {
    return await apiCall<AuthResponse>('POST', '/auth/register', userData);
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return await apiCall<AuthResponse>('POST', '/auth/login', credentials);
  },

  // Get current user
  getCurrentUser: async (): Promise<{ success: boolean; data: { user: User } }> => {
    return await apiCall<{ success: boolean; data: { user: User } }>('GET', '/auth/me');
  },

  // Verify token
  verifyToken: async (): Promise<{ success: boolean; data: { user: User } }> => {
    return await apiCall<{ success: boolean; data: { user: User } }>('GET', '/auth/me');
  },
  
  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ success: boolean; data: { token: string; refreshToken: string } }> => {
    return await apiCall<{ success: boolean; data: { token: string; refreshToken: string } }>('POST', '/auth/refresh', { refreshToken });
  },

  // Update current user
  updateProfile: async (userData: Partial<User>): Promise<{ success: boolean; data: { user: User } }> => {
    return await apiCall<{ success: boolean; data: { user: User } }>('PUT', '/auth/me', userData);
  },

  // Verify email
  verifyEmail: async (token: string): Promise<{ success: boolean; message: string }> => {
    return await apiCall<{ success: boolean; message: string }>('POST', '/auth/verify-email', { token });
  },

  // Resend verification email
  resendVerificationEmail: async (): Promise<{ success: boolean; message: string }> => {
    return await apiCall<{ success: boolean; message: string }>('POST', '/auth/resend-verification');
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    return await apiCall<{ success: boolean; message: string }>('POST', '/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token: string, password: string): Promise<{ success: boolean; message: string }> => {
    return await apiCall<{ success: boolean; message: string }>('POST', '/auth/reset-password', { token, password });
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    return await apiCall<{ success: boolean; message: string }>('PUT', '/auth/change-password', { 
      currentPassword, 
      newPassword 
    });
  },

  // Logout (client-side cleanup)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get stored token
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },
  
  // Send OTP for email verification with user data
  sendOTP: async (email: string, userData?: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
    role: string;
  }): Promise<{ token: string; message: string }> => {
    console.log('🔄 Auth Service: Sending OTP request...', { email, userData });
    
    const payload = userData ? userData : { email };
    
    console.log('📤 Auth Service: Request payload:', payload);
    
    const response = await apiCall('POST', '/auth/send-otp', payload);
    
    console.log('📥 Auth Service: Response received:', response);
    
    return response as { token: string; message: string };
  },

  // Verify OTP
  verifyOTP: async (email: string, otp: string, token: string): Promise<{ message: string }> => {
    return apiCall('POST', '/auth/verify-otp', { email, otp, token });
  },

  // Complete signup after OTP verification
  completeSignup: async (formData: FormData): Promise<AuthResponse> => {
    return apiCall('POST', '/auth/complete-signup', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Get stored refresh token
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken');
  },

  // Get stored user
  getStoredUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Store auth data
  storeAuthData: (user: User, token: string, refreshToken?: string) => {
    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(user));
  },
};