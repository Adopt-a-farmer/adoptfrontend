
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Farmer } from '@/types';
import { FarmerFormValues } from '@/components/admin/farmers/FarmerForm';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useFarmers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const fetchFarmers = async () => {
    try {
      const { data, error } = await supabase
        .from('farmers')
        .select('*');
      
      if (error) throw error;
      
      return data as Farmer[];
    } catch (error: any) {
      console.error('Error fetching farmers:', error);
      toast({
        title: 'Error fetching farmers',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    }
  };
  
  const { data: farmers = [], isLoading } = useQuery({
    queryKey: ['farmers'],
    queryFn: fetchFarmers,
  });
  
  const filteredFarmers = farmers.filter(farmer =>
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const addFarmer = async (data: FarmerFormValues) => {
    try {
      // Combine county and constituency for the location field
      const formattedLocation = `${data.county}, ${data.constituency}`;
      
      const { error } = await supabase
        .from('farmers')
        .insert({
          name: data.name,
          location: formattedLocation,
          description: data.description || null,
          crops: data.crops,
          farming_experience_years: data.farming_experience_years,
          fundinggoal: data.fundinggoal,
          fundingraised: 0,
          supporters: 0,
          featured: data.featured,
          image_url: data.image_url
        });
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      
      toast({
        title: 'Farmer added',
        description: 'New farmer has been added successfully',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error adding farmer:', error);
      toast({
        title: 'Error adding farmer',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };
  
  const updateFarmer = async (id: number, data: FarmerFormValues) => {
    try {
      // Combine county and constituency for the location field
      const formattedLocation = `${data.county}, ${data.constituency}`;
      
      const { error } = await supabase
        .from('farmers')
        .update({
          name: data.name,
          location: formattedLocation,
          description: data.description || null,
          crops: data.crops,
          farming_experience_years: data.farming_experience_years,
          fundinggoal: data.fundinggoal,
          featured: data.featured,
          image_url: data.image_url
        })
        .eq('id', id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      
      toast({
        title: 'Farmer updated',
        description: 'Farmer information has been updated successfully',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating farmer:', error);
      toast({
        title: 'Error updating farmer',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };
  
  const deleteFarmer = async (id: number) => {
    try {
      const { error } = await supabase
        .from('farmers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      
      toast({
        title: 'Farmer deleted',
        description: 'Farmer has been deleted successfully',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error deleting farmer:', error);
      toast({
        title: 'Error deleting farmer',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };
  
  const toggleFeatured = async (id: number, featured: boolean) => {
    try {
      const { error } = await supabase
        .from('farmers')
        .update({ featured: !featured })
        .eq('id', id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      
      toast({
        title: 'Farmer updated',
        description: `Farmer has been ${!featured ? 'featured' : 'unfeatured'} successfully`,
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating farmer:', error);
      toast({
        title: 'Error updating farmer',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    farmers: filteredFarmers,
    isLoading,
    searchTerm,
    setSearchTerm,
    addFarmer,
    updateFarmer,
    deleteFarmer,
    toggleFeatured
  };
};
