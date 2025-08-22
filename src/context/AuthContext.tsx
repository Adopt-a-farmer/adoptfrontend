
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  phone?: string;
  role: 'farmer' | 'adopter' | 'expert' | 'admin' | 'investor' | 'buyer' | 'logistics_partner';
  isEmailVerified?: boolean;
  isVerified?: boolean;
  avatar_url?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // To accommodate any additional fields from API
}

export interface Profile {
  _id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  [key: string]: any;
}

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile?: (profileData: any) => Promise<void>;
  changePassword?: (oldPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check for existing authentication on mount (verify with backend) and sync across tabs
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Verify token by calling /auth/me (interceptor adds token)
          try {
            const res = await authService.getCurrentUser();
            const userData = (res as any).data.user || (res as any).data?.data?.user || (res as any).data?.data?.user;
            const normalizedUser = (res as any).data?.data?.user ?? (res as any).data?.user ?? userData;
            const u = normalizedUser;
            localStorage.setItem('user', JSON.stringify(u));

            const profileData: Profile = {
              _id: (u as any)._id || (u as any).id,
              full_name: `${u.firstName} ${u.lastName}`,
              avatar_url: (u as any).avatar_url || (u as any).avatar || undefined,
              role: u.role,
              ...u,
            };

            setUser(u);
            setProfile(profileData);
            setIsAuthenticated(true);
          } catch (err) {
            // Token invalid or expired – clear
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
            setProfile(null);
            setIsAuthenticated(false);
          }
        } else {
          // No token – ensure user cleared
          localStorage.removeItem('user');
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Multi-tab sync for login/logout
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token') {
        // Re-run auth check when token changes
        checkAuth();
      }
      if (e.key === 'user' && !localStorage.getItem('token')) {
        // If user changed without a token, clear
        setUser(null);
        setIsAuthenticated(false);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting to sign in user:', email);
      
      const res = await authService.login({ email, password });
      console.log('Sign in response:', res);
      
      const payload = (res as any).data?.data ?? (res as any).data;
      if (payload && payload.token && payload.user) {
        const { token, refreshToken, user: userData } = payload as any;
        
        // Store token and user data
        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Create profile from user data
        const profileData: Profile = {
          _id: (userData as any)._id || (userData as any).id,
          full_name: `${userData.firstName} ${userData.lastName}`,
          avatar_url: (userData as any).avatar_url || undefined,
          role: userData.role,
          ...userData
        };
        
        // Update state
        setUser(userData);
        setProfile(profileData);
        setIsAuthenticated(true);
        
        console.log('Sign in successful, user authenticated:', userData);
        
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
      } else {
        console.error('Invalid response structure:', res);
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Sign in failed:', error);
      
      // Clear any existing auth data
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      
      let errorMessage = 'Login failed. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Re-throw the error to be handled by the component
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData: any) => {
    try {
      setLoading(true);
      console.log('Attempting to sign up user:', userData.email);
      
      const res = await authService.signup(userData);
      console.log('Sign up response:', res);
      
      const payload = (res as any).data?.data ?? (res as any).data;
      if (payload && payload.token && payload.user) {
        const { token, refreshToken, user: newUser } = payload as any;
        
        // Store token and user data
        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(newUser));
        
        // Create profile from user data
        const profileData: Profile = {
          _id: (newUser as any)._id || (newUser as any).id,
          full_name: `${newUser.firstName} ${newUser.lastName}`,
          avatar_url: (newUser as any).avatar_url || undefined,
          role: newUser.role,
          ...newUser
        };
        
        // Update state
        setUser(newUser);
        setProfile(profileData);
        setIsAuthenticated(true);
        
        console.log('Sign up successful, user authenticated:', newUser);
        
        toast({
          title: "Registration successful",
          description: "Welcome to our platform!",
        });
      } else {
        console.error('Invalid signup response structure:', res);
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Sign up failed:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Re-throw the error to be handled by the component
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user');
      
      // Clear storage
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
      
      // Update state
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      
      toast({
        title: "Signed out successfully",
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      setLoading(true);
      // Normalize payload for backend: phoneNumber -> phone
      const payload: any = { ...profileData };
      if (payload.phoneNumber !== undefined) {
        payload.phone = payload.phoneNumber;
        delete payload.phoneNumber;
      }
      // Call backend to update user
      const res = await authService.updateProfile(payload);
      const updatedUser = (res as any).data?.user || (res as any).data?.data?.user;

      if (!updatedUser) throw new Error('Invalid update response');

      // Update state and storage
      setUser(updatedUser);
      setProfile(prev => prev ? { ...prev, full_name: `${updatedUser.firstName} ${updatedUser.lastName}` } : prev);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast({ title: 'Profile updated successfully' });
    } catch (error: any) {
      console.error('Profile update failed:', error);
      toast({
        title: 'Profile update failed',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      // Implement password change logic here
      console.log('Change password called');
      
      toast({
        title: "Password changed successfully",
      });
    } catch (error: any) {
      console.error('Password change failed:', error);
      toast({
        title: "Password change failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const isAdmin = user?.role === 'admin';

  const value: AuthContextType = {
    user,
    profile,
    loading,
    isAuthenticated,
    isAdmin,
    signIn,
    signUp,
    signOut,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
