
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/mock/client';
import { FarmerCategory } from '@/types';
import { useToast } from '@/components/ui/use-toast';

export const useFarmerCategories = () => {
  const { toast } = useToast();

  const fetchCategories = async (): Promise<FarmerCategory[]> => {
    try {
      const { data, error } = await supabase
        .from('farmer_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      return data || [];
    } catch (error: any) {
      console.error('Error fetching farmer categories:', error);
      toast({
        title: 'Error fetching categories',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    }
  };

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['farmer-categories'],
    queryFn: fetchCategories,
  });

  return {
    categories,
    isLoading,
  };
};
