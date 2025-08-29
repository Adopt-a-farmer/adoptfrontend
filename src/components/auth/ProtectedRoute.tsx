
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireFarmer?: boolean;
  requireAdopter?: boolean;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  requireFarmer = false,
  requireAdopter = false,
  allowedRoles = []
}: ProtectedRouteProps) => {
  const { user, loading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to access this page",
        variant: "destructive",
      });
    }
  }, [user, loading, isAuthenticated, toast]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-farmer-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Save the intended location to redirect after login
    return <Navigate to={`/auth/login?redirect=${encodeURIComponent(location.pathname)}`} />;
  }

  // Check role-based access
  if (requireAdmin && user.role !== 'admin') {
    toast({
      title: "Access denied",
      description: "You don't have permission to access this page",
      variant: "destructive",
    });
    return <Navigate to="/auth/login" />;
  }

  if (requireFarmer && user.role !== 'farmer') {
    toast({
      title: "Access denied",
      description: "This page is only accessible to farmers",
      variant: "destructive",
    });
    return <Navigate to="/auth/login" />;
  }

  if (requireAdopter && user.role !== 'adopter') {
    toast({
      title: "Access denied", 
      description: "This page is only accessible to adopters",
      variant: "destructive",
    });
    return <Navigate to="/auth/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    toast({
      title: "Access denied",
      description: "You don't have permission to access this page",
      variant: "destructive",
    });
    return <Navigate to="/auth/login" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
