
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/mock/client';
import { FarmerAdoption, FarmerWithAdoptionInfo } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useFarmerAdoptions = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchFarmersWithAdoptionInfo = async (): Promise<FarmerWithAdoptionInfo[]> => {
    try {
      console.log('Fetching farmers with adoption info...');
      const { data, error } = await supabase.rpc('get_farmers_with_adoption_info');
      
      if (error) {
        console.error('Error fetching farmers with adoption info:', error);
        throw error;
      }
      
      console.log('Farmers with adoption info fetched:', data);
      return data || [];
    } catch (error: unknown) {
      console.error('Error fetching farmers with adoption info:', error);
      toast({
        title: 'Error fetching farmers',
        description: error instanceof Error ? error.message : 'Failed to fetch farmers',
        variant: 'destructive',
      });
      return [];
    }
  };

  const { data: farmersWithAdoptionInfo = [], isLoading: isLoadingFarmers } = useQuery({
    queryKey: ['farmers-with-adoption-info'],
    queryFn: fetchFarmersWithAdoptionInfo,
  });

  const fetchMyAdoptions = async (): Promise<FarmerAdoption[]> => {
    if (!user) return [];
    
    try {
      console.log('Fetching my adoptions for user:', user.id);
      const { data, error } = await supabase
        .from('farmer_adoptions')
        .select('*')
        .eq('adopter_id', user.id);
      
      if (error) {
        console.error('Error fetching my adoptions:', error);
        throw error;
      }
      
      console.log('My adoptions fetched:', data);
      return (data as FarmerAdoption[]) || [];
    } catch (error: unknown) {
      console.error('Error fetching my adoptions:', error);
      return [];
    }
  };

  const { data: myAdoptions = [], isLoading: isLoadingAdoptions } = useQuery({
    queryKey: ['my-adoptions', user?.id],
    queryFn: fetchMyAdoptions,
    enabled: !!user,
  });

  const adoptFarmer = async (farmerId: number, monthlyContribution: number = 50) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to adopt a farmer',
        variant: 'destructive',
      });
      return false;
    }

    try {
      console.log('Adopting farmer:', farmerId, 'with contribution:', monthlyContribution);
      const result = await supabase
        .from('farmer_adoptions')
        .insert({
          farmer_id: farmerId,
          adopter_id: user.id,
          monthly_contribution: monthlyContribution,
        });

      const error = (result as { error?: unknown }).error;
      const data = (result as { data?: unknown }).data;

      if (error) {
        console.error('Error adopting farmer:', error);
        throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['farmers-with-adoption-info'] });
      queryClient.invalidateQueries({ queryKey: ['my-adoptions', user.id] });

      toast({
        title: 'Farmer adopted successfully',
        description: 'You have successfully adopted this farmer!',
      });

      return true;
    } catch (error: unknown) {
      console.error('Error adopting farmer:', error);
      toast({
        title: 'Error adopting farmer',
        description: error instanceof Error ? error.message : 'Failed to adopt farmer',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateAdoption = async (adoptionId: string, monthlyContribution: number) => {
    try {
      console.log('Updating adoption:', adoptionId, 'with new contribution:', monthlyContribution);
      const { error } = await supabase
        .from('farmer_adoptions')
        .update({ monthly_contribution: monthlyContribution })
        .eq('id', adoptionId);

      if (error) {
        console.error('Error updating adoption:', error);
        throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['farmers-with-adoption-info'] });
      queryClient.invalidateQueries({ queryKey: ['my-adoptions', user?.id] });

      toast({
        title: 'Adoption updated',
        description: 'Your monthly contribution has been updated',
      });

      return true;
    } catch (error: unknown) {
      console.error('Error updating adoption:', error);
      toast({
        title: 'Error updating adoption',
        description: error instanceof Error ? error.message : 'Failed to update adoption',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    console.log('Setting up real-time subscriptions...');
    const farmersChannel = supabase
      .channel('farmers-changes');
    
    // Mock channel subscription
    farmersChannel.subscribe();

    return () => {
      console.log('Cleaning up real-time subscriptions...');
      supabase.removeChannel(farmersChannel);
    };
  }, [queryClient, user?.id]);

  return {
    farmersWithAdoptionInfo,
    myAdoptions,
    isLoadingFarmers,
    isLoadingAdoptions,
    adoptFarmer,
    updateAdoption,
  };
};
