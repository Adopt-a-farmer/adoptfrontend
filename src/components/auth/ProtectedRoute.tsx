
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireFarmer?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  requireFarmer = false 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to access this page",
        variant: "destructive",
      });
    }
  }, [user, loading, toast]);

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

  if (!user) {
    // Save the intended location to redirect after login
    return <Navigate to={`/auth/login?redirect=${encodeURIComponent(location.pathname)}`} />;
  }

  // Allow all authenticated users for testing purposes
  return <>{children}</>;
};

export default ProtectedRoute;
