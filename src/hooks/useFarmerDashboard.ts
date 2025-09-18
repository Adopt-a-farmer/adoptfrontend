import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiCall } from '@/services/api';
import type { FarmerProfile } from '@/services/farmer';

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

  // Get farmer dashboard data (includes profile, stats, recent activity)
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['farmer-dashboard', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      try {
        const response = await apiCall<{data: {farmer: unknown; stats: unknown; recentActivity: unknown[]; tasks: unknown[]}}>('GET', '/farmers/dashboard');
        console.log('Dashboard data received:', response);
        return response.data;
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        return null;
      }
    },
    enabled: !!user?.id
  });

  // Transform the backend data to match our component expectations
  const farmerProfile: FarmerProfile | null = dashboardData?.farmer && typeof dashboardData.farmer === 'object' ? 
    dashboardData.farmer as FarmerProfile : null;

  const stats: FarmerDashboardStats = dashboardData?.stats && typeof dashboardData.stats === 'object' ? {
    activeAdopters: (dashboardData.stats as { activeAdopters?: number }).activeAdopters || 0,
    totalContributions: (dashboardData.stats as { totalEarnings?: number }).totalEarnings || 0,
    upcomingVisits: (dashboardData.stats as { upcomingVisits?: number }).upcomingVisits || 0,
    updatesShared: (dashboardData.stats as { totalUpdates?: number }).totalUpdates || 0,
    monthlyGoalProgress: (dashboardData.stats as { monthlyGoalProgress?: number }).monthlyGoalProgress || 65,
    adopterSatisfaction: 85, // Mock data - would need backend implementation
    successfulVisits: (dashboardData.stats as { completedVisits?: number }).completedVisits || 0
  } : {
    activeAdopters: 0,
    totalContributions: 0,
    upcomingVisits: 0,
    updatesShared: 0,
    monthlyGoalProgress: 0,
    adopterSatisfaction: 0,
    successfulVisits: 0
  };

  // Use backend-provided recent activity if available, otherwise transform from adoptions/payments
  const recentActivity: RecentActivity[] = dashboardData?.recentActivity ? 
    dashboardData.recentActivity.map((activity: { type: string; description: string; data?: unknown; date: string }, index: number) => ({
      id: `${activity.type}-${index}`,
      action: activity.description,
      user: activity.data && typeof activity.data === 'object' && 'adopter' in activity.data && activity.data.adopter && typeof activity.data.adopter === 'object' 
        ? `${(activity.data.adopter as { firstName?: string; lastName?: string }).firstName || ''} ${(activity.data.adopter as { firstName?: string; lastName?: string }).lastName || ''}`.trim() 
        : undefined,
      amount: activity.type === 'payment' && activity.data && typeof activity.data === 'object' && 'netAmount' in activity.data 
        ? `KES ${(activity.data.netAmount as number)?.toLocaleString()}` 
        : undefined,
      content: activity.type === 'update' && activity.data && typeof activity.data === 'object' && 'title' in activity.data 
        ? activity.data.title as string 
        : undefined,
      time: new Date(activity.date).toLocaleDateString(),
      created_at: activity.date
    })) : [];

  // Use backend-provided tasks if available, otherwise use default tasks
  const tasks: Task[] = dashboardData?.tasks ? 
    dashboardData.tasks.map((task: { id: string; title: string; priority: string; dueDate?: string }) => ({
      id: task.id,
      task: task.title,
      priority: task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low',
      dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date',
      type: task.id.split('_')[0] // Extract type from task ID
    })) : [];

  return {
    farmerProfile,
    stats,
    recentActivity: recentActivity.slice(0, 10), // Limit to 10 items
    tasks,
    isLoading
  };
};