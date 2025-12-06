
import React, { useEffect, useRef } from 'react';
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
  const hasShownToast = useRef(false);

  // Determine access denial reason
  const getAccessDenialReason = () => {
    if (!isAuthenticated || !user) {
      return { denied: false, reason: '', description: '' };
    }
    if (requireAdmin && user.role !== 'admin') {
      return { denied: true, reason: 'Access denied', description: "You don't have permission to access this page" };
    }
    if (requireFarmer && user.role !== 'farmer') {
      return { denied: true, reason: 'Access denied', description: 'This page is only accessible to farmers' };
    }
    if (requireAdopter && user.role !== 'adopter') {
      return { denied: true, reason: 'Access denied', description: 'This page is only accessible to adopters' };
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return { denied: true, reason: 'Access denied', description: "You don't have permission to access this page" };
    }
    return { denied: false, reason: '', description: '' };
  };

  const accessDenial = getAccessDenialReason();

  useEffect(() => {
    // Show toast for unauthenticated users
    if (!loading && !isAuthenticated && !hasShownToast.current) {
      hasShownToast.current = true;
      toast({
        title: "Authentication required",
        description: "Please log in to access this page",
        variant: "destructive",
      });
    }
  }, [loading, isAuthenticated, toast]);

  useEffect(() => {
    // Show toast for access denied
    if (!loading && accessDenial.denied && !hasShownToast.current) {
      hasShownToast.current = true;
      toast({
        title: accessDenial.reason,
        description: accessDenial.description,
        variant: "destructive",
      });
    }
  }, [loading, accessDenial, toast]);

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
    return <Navigate to="/" />;
  }

  if (requireFarmer && user.role !== 'farmer') {
    return <Navigate to="/" />;
  }

  if (requireAdopter && user.role !== 'adopter') {
    return <Navigate to="/" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
