
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
  const { user, profile, loading, isAdmin } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to access this page",
        variant: "destructive",
      });
    } else if (!loading && requireAdmin && profile && profile.role !== 'admin') {
      toast({
        title: "Access denied",
        description: "You do not have permission to access this page",
        variant: "destructive",
      });
    } else if (!loading && requireFarmer && profile?.role !== 'farmer') {
      toast({
        title: "Access denied",
        description: "This area is reserved for farmers",
        variant: "destructive",
      });
    }
  }, [user, loading, requireAdmin, requireFarmer, profile, toast]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Save the intended location to redirect after login
    return <Navigate to={`/auth/login?redirect=${encodeURIComponent(location.pathname)}`} />;
  }

  if (requireAdmin && profile && profile.role !== 'admin') {
    return (
      <Card className="mx-auto max-w-md mt-10">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You do not have admin privileges required to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </CardContent>
      </Card>
    );
  }

  if (requireFarmer && profile?.role !== 'farmer') {
    return (
      <Card className="mx-auto max-w-md mt-10">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            This area is restricted to farmers only.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
