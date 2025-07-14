import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

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

      // Get adoption data
      const { data: adoptions } = await supabase
        .from('farmer_adoptions')
        .select('monthly_contribution, total_contributed, status')
        .eq('adopter_id', user.id)
        .eq('status', 'active');

      // Get upcoming visits (placeholder for now)
      // This would need a farm_visits table
      const upcomingVisits = 0;

      // Get unread messages (placeholder for now)
      // This would need a messages table
      const unreadMessages = 0;

      const totalContributions = adoptions?.reduce((sum, adoption) => sum + Number(adoption.total_contributed), 0) || 0;
      const adoptedFarmers = adoptions?.length || 0;
      const averageContribution = adoptedFarmers > 0 ? totalContributions / adoptedFarmers : 0;

      return {
        totalContributions,
        adoptedFarmers,
        averageContribution,
        upcomingVisits,
        unreadMessages,
        activeProjects: adoptedFarmers
      };
    },
    enabled: !!user?.id
  });

  // Fetch recent farmer updates
  const { data: recentUpdates, isLoading: isLoadingUpdates } = useQuery({
    queryKey: ['recent-farmer-updates', user?.id],
    queryFn: async (): Promise<FarmerUpdate[]> => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get farmer IDs that the user has adopted
      const { data: adoptions } = await supabase
        .from('farmer_adoptions')
        .select('farmer_id')
        .eq('adopter_id', user.id)
        .eq('status', 'active');

      if (!adoptions || adoptions.length === 0) return [];

      const farmerIds = adoptions.map(a => a.farmer_id);

      // Get recent status updates from adopted farmers
      const { data: updates } = await supabase
        .from('status_updates')
        .select(`
          id,
          farmer_id,
          update_type,
          description,
          image_url,
          created_at,
          farmers!inner(name, image_url)
        `)
        .in('farmer_id', farmerIds)
        .order('created_at', { ascending: false })
        .limit(5);

      return updates?.map(update => ({
        id: update.id,
        farmer_id: update.farmer_id,
        farmer_name: (update.farmers as any).name,
        farmer_image: (update.farmers as any).image_url || '/placeholder.svg',
        update_type: update.update_type,
        description: update.description,
        image_url: update.image_url,
        created_at: update.created_at
      })) || [];
    },
    enabled: !!user?.id
  });

  // Fetch adopted farmers with details
  const { data: adoptedFarmers, isLoading: isLoadingFarmers } = useQuery({
    queryKey: ['adopted-farmers', user?.id],
    queryFn: async (): Promise<AdoptionDetails[]> => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: adoptions } = await supabase
        .from('farmer_adoptions')
        .select(`
          id,
          farmer_id,
          adoption_date,
          monthly_contribution,
          total_contributed,
          status,
          farmers!inner(
            name,
            location,
            crops,
            image_url,
            farmer_categories(name)
          )
        `)
        .eq('adopter_id', user.id)
        .eq('status', 'active')
        .order('adoption_date', { ascending: false });

      if (!adoptions) return [];

      // Get latest updates for each farmer
      const farmerIds = adoptions.map(a => a.farmer_id);
      const { data: latestUpdates } = await supabase
        .from('status_updates')
        .select('farmer_id, update_type, description, created_at')
        .in('farmer_id', farmerIds)
        .order('created_at', { ascending: false });

      return adoptions.map(adoption => {
        const farmer = adoption.farmers as any;
        const latestUpdate = latestUpdates?.find(u => u.farmer_id === adoption.farmer_id);

        return {
          id: adoption.id,
          farmer_id: adoption.farmer_id,
          farmer_name: farmer.name,
          farmer_image: farmer.image_url || '/placeholder.svg',
          farmer_location: farmer.location,
          farmer_crops: farmer.crops || [],
          farmer_category: farmer.farmer_categories?.name || 'General',
          adoption_date: adoption.adoption_date,
          monthly_contribution: Number(adoption.monthly_contribution),
          total_contributed: Number(adoption.total_contributed),
          status: adoption.status,
          last_update: latestUpdate ? {
            id: latestUpdate.farmer_id.toString(),
            farmer_id: latestUpdate.farmer_id,
            farmer_name: farmer.name,
            farmer_image: farmer.image_url || '/placeholder.svg',
            update_type: latestUpdate.update_type,
            description: latestUpdate.description,
            created_at: latestUpdate.created_at
          } : undefined
        };
      });
    },
    enabled: !!user?.id
  });

  // Update contribution mutation
  const updateContributionMutation = useMutation({
    mutationFn: async ({ adoptionId, newAmount }: { adoptionId: string; newAmount: number }) => {
      const { error } = await supabase
        .from('farmer_adoptions')
        .update({ monthly_contribution: newAmount })
        .eq('id', adoptionId)
        .eq('adopter_id', user?.id);

      if (error) throw error;
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