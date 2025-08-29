import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Base API URL configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
                    (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api');

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Function to process queued requests
const processQueue = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 Unauthorized and not a refresh token request and we haven't tried to refresh yet
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        localStorage.getItem('refreshToken') && 
        error.response?.data?.message !== 'Not authorized, no token') {
      
      // Check if we're not already refreshing
      if (!isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;

        try {
          // Call the refresh token endpoint
          const refreshToken = localStorage.getItem('refreshToken');
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { 
            refreshToken 
          });

          const { token, refreshToken: newRefreshToken } = response.data.data;
          
          // Update tokens in localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // Update authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          
          // Process queued requests
          processQueue(token);
          
          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh token is invalid, clear auth data
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Redirect to login page or handle as needed
          window.location.href = '/auth/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // If we're already refreshing, queue this request
        return new Promise(resolve => {
          refreshSubscribers.push((token: string) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }
    } else if (error.response?.status === 403) {
      // Forbidden - show error message
      console.error('Access denied');
    } else if (error.response?.status >= 500) {
      // Server error
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

// Generic API call function
export const apiCall = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  data?: unknown,
  config?: Record<string, unknown>
): Promise<T> => {
  const response = await api.request({
    method,
    url: endpoint,
    data,
    ...config,
  });
  return response.data;
};

export default api;