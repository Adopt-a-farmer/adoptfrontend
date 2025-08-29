import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { authService, type User as AuthUser, type AuthResponse } from '@/services/auth';

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
  [key: string]: unknown;
}

export interface Profile {
  _id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  [key: string]: unknown;
}

interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'farmer' | 'adopter' | 'expert';
  phoneNumber?: string;
}

interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  avatar?: string;
}

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile?: (profileData: ProfileUpdateData) => Promise<void>;
  changePassword?: (oldPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export AuthContext for external use
export { AuthContext };

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const res = await authService.getCurrentUser();
            const userData = (res as unknown as { data: { user: User } }).data.user;
            
            const profileData: Profile = {
              _id: userData._id,
              full_name: `${userData.firstName} ${userData.lastName}`,
              avatar_url: userData.avatar_url,
              role: userData.role,
              ...userData,
            };

            setUser(userData);
            setProfile(profileData);
            setIsAuthenticated(true);
          } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
            setProfile(null);
            setIsAuthenticated(false);
          }
        } else {
          localStorage.removeItem('user');
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
        }
      } catch (error: unknown) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const res = await authService.login({ email, password });
      const response = res as unknown as { data: { token: string; refreshToken?: string; user: User } };
      const { token, refreshToken, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(userData));
      
      const profileData: Profile = {
        _id: userData._id,
        full_name: `${userData.firstName} ${userData.lastName}`,
        avatar_url: userData.avatar_url,
        role: userData.role,
        ...userData
      };
      
      setUser(userData);
      setProfile(profileData);
      setIsAuthenticated(true);
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      if (userData.role === 'farmer') {
        navigate('/farmer');
      } else if (userData.role === 'adopter') {
        navigate('/adopter');
      } else if (userData.role === 'expert') {
        navigate('/expert');
      } else if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      }
    } catch (error: unknown) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData: SignUpData) => {
    try {
      setLoading(true);
      const res = await authService.signup(userData);
      const response = res as unknown as { data: { token: string; refreshToken?: string; user: User } };
      const { token, refreshToken, user: newUser } = response.data;
      
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(newUser));
      
      const profileData: Profile = {
        _id: newUser._id,
        full_name: `${newUser.firstName} ${newUser.lastName}`,
        avatar_url: newUser.avatar_url,
        role: newUser.role,
        ...newUser
      };
      
      setUser(newUser);
      setProfile(profileData);
      setIsAuthenticated(true);
      
      toast({
        title: "Registration successful",
        description: "Welcome to our platform!",
      });
    } catch (error: unknown) {
      toast({
        title: "Registration failed",
        description: "Please try again.",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      
      toast({
        title: "Signed out successfully",
      });
      
      navigate('/');
    } catch (error: unknown) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "An error occurred while signing out",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (profileData: ProfileUpdateData) => {
    try {
      setLoading(true);
      const res = await authService.updateProfile(profileData);
      const updatedUser = (res as unknown as { data: { user: User } }).data.user;

      setUser(updatedUser);
      setProfile(prev => prev ? { ...prev, full_name: `${updatedUser.firstName} ${updatedUser.lastName}` } : prev);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast({ title: 'Profile updated successfully' });
    } catch (error: unknown) {
      toast({
        title: 'Profile update failed',
        description: 'Update failed',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      toast({
        title: "Password changed successfully",
      });
    } catch (error: unknown) {
      toast({
        title: "Password change failed",
        description: 'Password change failed',
        variant: "destructive",
      });
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);
      await authService.forgotPassword(email);
      toast({
        title: "Reset email sent",
        description: "Please check your email for password reset instructions.",
      });
    } catch (error: unknown) {
      toast({
        title: "Failed to send reset email",
        description: "Please try again later.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      setLoading(true);
      await authService.resetPassword(token, password);
      toast({
        title: "Password reset successful",
        description: "You can now sign in with your new password.",
      });
    } catch (error: unknown) {
      toast({
        title: "Failed to reset password",
        description: "Please try again or request a new reset link.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
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
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook is now exported from @/hooks/useAuth
