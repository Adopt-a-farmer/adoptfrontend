import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface FarmerDashboardStats {
  activeAdopters: number;
  totalContributions: number;
  upcomingVisits: number;
  updatesShared: number;
  monthlyGoalProgress: number;
  adopterSatisfaction: number;
  successfulVisits: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  user?: string;
  amount?: string;
  content?: string;
  time: string;
  created_at: string;
}

export interface Task {
  id: string;
  task: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  type: string;
}

export const useFarmerDashboard = () => {
  const { user } = useAuth();

  // Get farmer profile
  const { data: farmerProfile } = useQuery({
    queryKey: ['farmer-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data } = await supabase
        .from('farmers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      return data;
    },
    enabled: !!user?.id
  });

  // Fetch farmer dashboard statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['farmer-dashboard-stats', farmerProfile?.id],
    queryFn: async (): Promise<FarmerDashboardStats> => {
      if (!farmerProfile?.id) throw new Error('Farmer profile not found');

      // Get active adoptions
      const { data: adoptions } = await supabase
        .from('farmer_adoptions')
        .select('monthly_contribution, total_contributed, status')
        .eq('farmer_id', farmerProfile.id)
        .eq('status', 'active');

      // Get status updates count
      const { count: updatesCount } = await supabase
        .from('status_updates')
        .select('*', { count: 'exact', head: true })
        .eq('farmer_id', farmerProfile.id)
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      // Get messages count for upcoming visits (placeholder)
      const upcomingVisits = 3; // This would come from a farm_visits table

      // Calculate statistics
      const activeAdopters = adoptions?.length || 0;
      const totalContributions = adoptions?.reduce((sum, adoption) => sum + Number(adoption.total_contributed), 0) || 0;
      const updatesShared = updatesCount || 0;

      // Calculate monthly goal progress (assuming goal is in farmer profile)
      const monthlyGoal = farmerProfile.fundinggoal || 50000;
      const monthlyContributions = adoptions?.reduce((sum, adoption) => sum + Number(adoption.monthly_contribution), 0) || 0;
      const monthlyGoalProgress = monthlyGoal > 0 ? Math.min((monthlyContributions / monthlyGoal) * 100, 100) : 0;

      return {
        activeAdopters,
        totalContributions,
        upcomingVisits,
        updatesShared,
        monthlyGoalProgress,
        adopterSatisfaction: 95, // This would come from feedback/ratings
        successfulVisits: 8 // This would come from completed visits
      };
    },
    enabled: !!farmerProfile?.id
  });

  // Fetch recent activity
  const { data: recentActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['farmer-recent-activity', farmerProfile?.id],
    queryFn: async (): Promise<RecentActivity[]> => {
      if (!farmerProfile?.id) throw new Error('Farmer profile not found');

      const activities: RecentActivity[] = [];

      // Get recent adoptions
      const { data: recentAdoptions } = await supabase
        .from('farmer_adoptions')
        .select(`
          id,
          adoption_date,
          monthly_contribution,
          profiles!inner(full_name)
        `)
        .eq('farmer_id', farmerProfile.id)
        .order('adoption_date', { ascending: false })
        .limit(5);

      // Get recent payments
      const { data: recentPayments } = await supabase
        .from('payments')
        .select('id, amount, currency, payment_date, status')
        .eq('farmer_id', farmerProfile.id)
        .eq('status', 'completed')
        .order('payment_date', { ascending: false })
        .limit(5);

      // Get recent status updates
      const { data: recentUpdates } = await supabase
        .from('status_updates')
        .select('id, update_type, description, created_at')
        .eq('farmer_id', farmerProfile.id)
        .order('created_at', { ascending: false })
        .limit(3);

      // Add adoption activities
      recentAdoptions?.forEach(adoption => {
        activities.push({
          id: `adoption-${adoption.id}`,
          action: 'New adopter joined',
          user: (adoption.profiles as any)?.full_name || 'Anonymous',
          time: formatTimeAgo(adoption.adoption_date),
          created_at: adoption.adoption_date
        });
      });

      // Add payment activities
      recentPayments?.forEach(payment => {
        activities.push({
          id: `payment-${payment.id}`,
          action: 'Contribution received',
          amount: `${payment.currency} ${payment.amount.toLocaleString()}`,
          time: formatTimeAgo(payment.payment_date),
          created_at: payment.payment_date
        });
      });

      // Add update activities
      recentUpdates?.forEach(update => {
        activities.push({
          id: `update-${update.id}`,
          action: 'Update shared',
          content: update.description.substring(0, 50) + '...',
          time: formatTimeAgo(update.created_at),
          created_at: update.created_at
        });
      });

      // Sort by created_at and return top 10
      return activities
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);
    },
    enabled: !!farmerProfile?.id
  });

  // Generate dynamic tasks based on farmer's current state
  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['farmer-tasks', farmerProfile?.id],
    queryFn: async (): Promise<Task[]> => {
      if (!farmerProfile?.id) throw new Error('Farmer profile not found');

      const dynamicTasks: Task[] = [];

      // Check for recent updates
      const { data: recentUpdates } = await supabase
        .from('status_updates')
        .select('created_at')
        .eq('farmer_id', farmerProfile.id)
        .order('created_at', { ascending: false })
        .limit(1);

      const lastUpdate = recentUpdates?.[0];
      const daysSinceLastUpdate = lastUpdate 
        ? Math.floor((Date.now() - new Date(lastUpdate.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 30;

      if (daysSinceLastUpdate > 7) {
        dynamicTasks.push({
          id: 'update-needed',
          task: 'Share progress update with photos',
          priority: 'High',
          dueDate: 'Today',
          type: 'update'
        });
      }

      // Check for unread messages
      const { count: unreadMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user?.id)
        .is('read_at', null);

      if (unreadMessages && unreadMessages > 0) {
        dynamicTasks.push({
          id: 'messages-pending',
          task: `Respond to ${unreadMessages} unread message${unreadMessages > 1 ? 's' : ''}`,
          priority: 'Medium',
          dueDate: 'Today',
          type: 'message'
        });
      }

      // Add some static high-value tasks
      dynamicTasks.push({
        id: 'profile-optimization',
        task: 'Complete farm profile optimization',
        priority: 'Low',
        dueDate: '1 week',
        type: 'profile'
      });

      return dynamicTasks.slice(0, 4); // Limit to 4 tasks
    },
    enabled: !!farmerProfile?.id && !!user?.id
  });

  return {
    farmerProfile,
    stats,
    recentActivity,
    tasks,
    isLoading: isLoadingStats || isLoadingActivity || isLoadingTasks
  };
};

// Helper function to format time ago
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}