import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  FileText, 
  TrendingUp,
  CheckCircle2,
  Clock,
  MessageCircle,
  Loader2,
  UserCheck,
  Target,
  Star,
  Video,
  Phone
} from 'lucide-react';
import { useFarmerDashboard } from '@/hooks/useFarmerDashboard';
import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import FarmerMessagingCenter from '@/components/farmer/messages/FarmerMessagingCenter';

interface Expert {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  email: string;
  specialization: string;
  mentorshipId: string;
  startDate: string;
  status: string;
  goals: Array<{
    title: string;
    description: string;
    status: string;
    targetDate: string;
  }>;
  completedGoals: number;
  totalGoals: number;
  conversationId: string;
}

const EnhancedDashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { farmerProfile, stats, recentActivity, tasks, isLoading } = useFarmerDashboard();
  const [showMessaging, setShowMessaging] = useState(false);
  const [selectedExpertConversation, setSelectedExpertConversation] = useState<string | null>(null);

  // Fetch farmer's assigned experts
  const { data: expertsData, isLoading: isLoadingExperts } = useQuery({
    queryKey: ['farmer-experts', user?.id],
    queryFn: async () => {
      try {
        const response = await apiCall<{ data: { experts: Expert[] } }>('GET', '/farmers/experts');
        return response.data;
      } catch (error) {
        console.error('Error fetching experts:', error);
        return { experts: [] };
      }
    },
    enabled: !!user?.id
  });

  // Get unread message count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['farmer-unread-messages', user?.id],
    queryFn: async () => {
      try {
        const response = await apiCall<{ data: { unreadCount: number } }>('GET', '/farmers/messages/unread-count');
        return response.data.unreadCount;
      } catch (error) {
        return 0;
      }
    },
    enabled: !!user?.id,
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  const experts = expertsData?.experts || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const statsConfig = [
    {
      title: 'Active Adopters',
      value: stats?.activeAdopters?.toString() || '0',
      icon: Users,
      trend: `${stats?.activeAdopters || 0} supporters`,
      color: 'text-blue-600'
    },
    {
      title: 'Total Contributions',
      value: `KES ${(stats?.totalContributions || 0).toLocaleString()}`,
      icon: DollarSign,
      trend: 'All time earnings',
      color: 'text-green-600'
    },
    {
      title: 'Upcoming Visits',
      value: stats?.upcomingVisits?.toString() || '0',
      icon: Calendar,
      trend: 'Scheduled this month',
      color: 'text-purple-600'
    },
    {
      title: 'Updates Shared',
      value: stats?.updatesShared?.toString() || '0',
      icon: FileText,
      trend: 'This month',
      color: 'text-orange-600'
    }
  ];

  const handleMessageExpert = (expert: Expert) => {
    setSelectedExpertConversation(expert.conversationId);
    setShowMessaging(true);
  };

  const getSpecializationColor = (specialization: string) => {
    const colors = {
      'crop_management': 'bg-green-100 text-green-800',
      'livestock_care': 'bg-blue-100 text-blue-800',
      'soil_health': 'bg-amber-100 text-amber-800',
      'pest_control': 'bg-red-100 text-red-800',
      'irrigation': 'bg-cyan-100 text-cyan-800',
      'organic_farming': 'bg-emerald-100 text-emerald-800',
      'sustainable_practices': 'bg-teal-100 text-teal-800',
      'marketing': 'bg-purple-100 text-purple-800',
      'financial_planning': 'bg-indigo-100 text-indigo-800',
      'technology_adoption': 'bg-pink-100 text-pink-800',
      'climate_adaptation': 'bg-orange-100 text-orange-800'
    };
    return colors[specialization as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatSpecialization = (specialization: string) => {
    return specialization.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Welcome back, {farmerProfile?.name || 'Farmer'}! 🌾
          </h2>
          <p className="text-muted-foreground">Here's what's happening on your farm today</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowMessaging(true)}
            className="flex items-center gap-2 relative"
            variant="outline"
          >
            <MessageCircle className="h-4 w-4" />
            Messages
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                {unreadCount}
              </Badge>
            )}
          </Button>
          <Button className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Share Update
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Experts Section */}
      {experts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              Your Expert Mentors
              <Badge variant="secondary">{experts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoadingExperts ? (
                <div className="flex items-center justify-center col-span-2 py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                experts.map((expert) => (
                  <Card key={expert._id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={expert.avatar} />
                            <AvatarFallback>
                              {expert.firstName.charAt(0)}{expert.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-sm">
                              {expert.firstName} {expert.lastName}
                            </h4>
                            <Badge className={`text-xs ${getSpecializationColor(expert.specialization)}`}>
                              {formatSpecialization(expert.specialization)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleMessageExpert(expert)}
                            className="h-8 w-8 p-0"
                          >
                            <MessageCircle className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Phone className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Video className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Goals Progress</span>
                          <span className="font-medium">
                            {expert.completedGoals}/{expert.totalGoals}
                          </span>
                        </div>
                        <Progress 
                          value={expert.totalGoals > 0 ? (expert.completedGoals / expert.totalGoals) * 100 : 0} 
                          className="h-2" 
                        />
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Target className="h-3 w-3" />
                          <span>
                            Started {new Date(expert.startDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* What's Next Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks?.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{task.task}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={task.priority === 'High' ? 'destructive' : 
                              task.priority === 'Medium' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {task.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <Clock className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity?.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.user || activity.amount || activity.content} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span className="text-sm">Share Update</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2 relative"
              onClick={() => setShowMessaging(true)}
            >
              <MessageCircle className="h-6 w-6" />
              <span className="text-sm">Messages</span>
              {unreadCount > 0 && (
                <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs min-w-[16px] h-4 flex items-center justify-center rounded-full">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Schedule Visit</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <DollarSign className="h-6 w-6" />
              <span className="text-sm">Request Withdrawal</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Farm Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Farm Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Monthly Goal Progress</span>
              <span>{Math.round(stats?.monthlyGoalProgress || 0)}%</span>
            </div>
            <Progress value={stats?.monthlyGoalProgress || 0} className="h-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats?.adopterSatisfaction || 0}%</p>
              <p className="text-sm text-muted-foreground">Adopter Satisfaction</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats?.updatesShared || 0}</p>
              <p className="text-sm text-muted-foreground">Updates This Month</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats?.successfulVisits || 0}</p>
              <p className="text-sm text-muted-foreground">Successful Visits</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messaging Dialog */}
      <Dialog open={showMessaging} onOpenChange={setShowMessaging}>
        <DialogContent className="max-w-7xl h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Messages</DialogTitle>
          </DialogHeader>
          <div className="flex-1 p-6 pt-0">
            <FarmerMessagingCenter />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedDashboardHome;