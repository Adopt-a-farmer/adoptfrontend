import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { apiCall } from '@/services/api';

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
        const response = await apiCall<{data: any}>('GET', '/farmers/dashboard');
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
  const farmerProfile = dashboardData?.farmer ? {
    name: dashboardData.farmer.farmName || `${dashboardData.farmer.user?.firstName} ${dashboardData.farmer.user?.lastName}`,
    ...dashboardData.farmer
  } : null;

  const stats: FarmerDashboardStats = dashboardData?.stats ? {
    activeAdopters: dashboardData.stats.totalAdopters || 0,
    totalContributions: dashboardData.stats.totalEarnings || 0,
    upcomingVisits: 0, // Would need to be added to backend
    updatesShared: 0, // Would need to be added to backend
    monthlyGoalProgress: 65, // Mock data - would need backend implementation
    adopterSatisfaction: 85, // Mock data - would need backend implementation
    successfulVisits: 0 // Would need to be added to backend
  } : {
    activeAdopters: 0,
    totalContributions: 0,
    upcomingVisits: 0,
    updatesShared: 0,
    monthlyGoalProgress: 0,
    adopterSatisfaction: 0,
    successfulVisits: 0
  };

  // Transform recent activity from adoptions and payments
  const recentActivity: RecentActivity[] = [];
  
  if (dashboardData?.adoptions) {
    dashboardData.adoptions.slice(0, 5).forEach((adoption: any, index: number) => {
      recentActivity.push({
        id: `adoption-${adoption._id}`,
        action: 'New adoption',
        user: adoption.adopter ? `${adoption.adopter.firstName} ${adoption.adopter.lastName}` : 'Anonymous',
        time: new Date(adoption.createdAt).toLocaleDateString(),
        created_at: adoption.createdAt
      });
    });
  }

  if (dashboardData?.payments) {
    dashboardData.payments.slice(0, 3).forEach((payment: any) => {
      recentActivity.push({
        id: `payment-${payment._id}`,
        action: 'Payment received',
        amount: `KES ${payment.netAmount?.toLocaleString()}`,
        time: new Date(payment.createdAt).toLocaleDateString(),
        created_at: payment.createdAt
      });
    });
  }

  // Sort recent activity by date
  recentActivity.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Generate tasks based on farmer's current state
  const tasks: Task[] = [
    {
      id: 'update-needed',
      task: 'Share progress update with photos',
      priority: 'High',
      dueDate: 'Today',
      type: 'update'
    },
    {
      id: 'respond-messages',
      task: 'Respond to adopter messages',
      priority: 'Medium',
      dueDate: 'Tomorrow',
      type: 'communication'
    },
    {
      id: 'profile-optimization',
      task: 'Complete farm profile optimization',
      priority: 'Low',
      dueDate: '1 week',
      type: 'profile'
    }
  ];

  return {
    farmerProfile,
    stats,
    recentActivity: recentActivity.slice(0, 10), // Limit to 10 items
    tasks,
    isLoading
  };
};