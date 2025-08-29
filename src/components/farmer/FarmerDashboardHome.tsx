import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  Target,
  Calendar,
  Award,
  Activity,
  DollarSign,
  CheckCircle2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import FarmerExpertChat from './FarmerExpertChat';

interface DashboardStats {
  totalAdoptions: number;
  activeAdopters: number;
  totalRevenue: number;
  completedVisits: number;
  pendingTasks: number;
  upcomingVisits: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: string;
}

const FarmerDashboardHome = () => {
  const { user } = useAuth();

  // Fetch dashboard statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['farmer-dashboard-stats', user?.id],
    queryFn: async () => {
      try {
        const response = await apiCall<{ data: DashboardStats }>('GET', '/farmers/dashboard/stats');
        return response.data;
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
          totalAdoptions: 0,
          activeAdopters: 0,
          totalRevenue: 0,
          completedVisits: 0,
          pendingTasks: 0,
          upcomingVisits: 0
        };
      }
    },
    enabled: !!user?.id
  });

  // Fetch recent activities
  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ['farmer-recent-activities', user?.id],
    queryFn: async () => {
      try {
        const response = await apiCall<{ data: RecentActivity[] }>('GET', '/farmers/activities/recent');
        return response.data || [];
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        return [];
      }
    },
    enabled: !!user?.id
  });

  const statsCards = [
    {
      title: 'Total Adoptions',
      value: stats?.totalAdoptions || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Adopters',
      value: stats?.activeAdopters || 0,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Revenue',
      value: `₦${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Completed Visits',
      value: stats?.completedVisits || 0,
      icon: CheckCircle2,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'adoption':
        return Users;
      case 'visit':
        return Calendar;
      case 'payment':
        return DollarSign;
      case 'achievement':
        return Award;
      default:
        return Activity;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-green-100">
          Here's what's happening with your farming operations today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Expert Chat Section - Takes 2 columns */}
        <div className="lg:col-span-2">
          <FarmerExpertChat />
        </div>

        {/* Recent Activities */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingActivities ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : activities && activities.length > 0 ? (
                  activities.slice(0, 6).map((activity) => {
                    const IconComponent = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-white rounded-full shadow-sm">
                          <IconComponent className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getActivityColor(activity.status)}`}
                            >
                              {activity.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No recent activities</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Schedule Farm Visit</p>
                    <p className="text-sm text-gray-500">Book a visit with adopters</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Update Farm Progress</p>
                    <p className="text-sm text-gray-500">Share latest farm updates</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">View Reports</p>
                    <p className="text-sm text-gray-500">Check detailed analytics</p>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboardHome;