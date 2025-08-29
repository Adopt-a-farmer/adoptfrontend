import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { apiCall } from '@/services/api';

export interface DashboardStats {
  totalContributions: number;
  adoptedFarmers: number;
  averageContribution: number;
  upcomingVisits: number;
  unreadMessages: number;
  activeProjects: number;
}

export interface FarmerUpdate {
  id: string;
  farmer_id: number;
  farmer_name: string;
  farmer_image: string;
  update_type: string;
  description: string;
  image_url?: string;
  created_at: string;
}

export interface AdoptionDetails {
  id: string;
  farmer_id: number;
  farmer_name: string;
  farmer_image: string;
  farmer_location: string;
  farmer_crops: string[];
  farmer_category: string;
  adoption_date: string;
  monthly_contribution: number;
  total_contributed: number;
  status: string;
  last_update?: FarmerUpdate;
}

export const useAdopterDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch dashboard statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['adopter-dashboard-stats', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user?.id) throw new Error('User not authenticated');

      try {
        const response = await apiCall<DashboardStats>('GET', '/adopters/dashboard-stats');
        return response;
      } catch (error) {
        // Return default values if API fails
        return {
          totalContributions: 0,
          adoptedFarmers: 0,
          averageContribution: 0,
          upcomingVisits: 0,
          unreadMessages: 0,
          activeProjects: 0
        };
      }
    },
    enabled: !!user?.id
  });

  // Fetch recent farmer updates
  const { data: recentUpdates, isLoading: isLoadingUpdates } = useQuery({
    queryKey: ['recent-farmer-updates', user?.id],
    queryFn: async (): Promise<FarmerUpdate[]> => {
      if (!user?.id) throw new Error('User not authenticated');

      try {
        const response = await apiCall<FarmerUpdate[]>('GET', '/adopters/recent-updates');
        return response;
      } catch (error) {
        return [];
      }
    },
    enabled: !!user?.id
  });

  // Fetch adopted farmers with details
  const { data: adoptedFarmers, isLoading: isLoadingFarmers } = useQuery({
    queryKey: ['adopted-farmers', user?.id],
    queryFn: async (): Promise<AdoptionDetails[]> => {
      if (!user?.id) throw new Error('User not authenticated');

      try {
        const response = await apiCall<AdoptionDetails[]>('GET', '/adopters/adopted-farmers');
        return response;
      } catch (error) {
        return [];
      }
    },
    enabled: !!user?.id
  });

  // Update contribution mutation
  const updateContributionMutation = useMutation({
    mutationFn: async ({ adoptionId, newAmount }: { adoptionId: string; newAmount: number }) => {
      await apiCall('PUT', `/adopters/update-contribution/${adoptionId}`, {
        monthly_contribution: newAmount
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adopter-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['adopted-farmers'] });
      toast({
        title: "Success",
        description: "Monthly contribution updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update contribution",
        variant: "destructive"
      });
    }
  });

  return {
    stats,
    recentUpdates,
    adoptedFarmers,
    isLoading: isLoadingStats || isLoadingUpdates || isLoadingFarmers,
    updateContribution: updateContributionMutation.mutate,
    isUpdatingContribution: updateContributionMutation.isPending
  };
};