import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  FileText, 
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  MessageCircle,
  UserCheck
} from 'lucide-react';
import { useFarmerDashboard } from '@/hooks/useFarmerDashboard';
import FarmerExpertChat from '../FarmerExpertChat';

const DashboardHome = () => {
  const { farmerProfile, stats, recentActivity, tasks, isLoading } = useFarmerDashboard();

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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          {/* Profile Image */}
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {farmerProfile?.user?.avatar || farmerProfile?.media?.profileImage?.url ? (
              <img
                src={farmerProfile?.user?.avatar || farmerProfile?.media?.profileImage?.url}
                alt={`${farmerProfile?.user?.firstName || 'Farmer'} profile`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-farmer-primary/10 flex items-center justify-center">
                <UserCheck className="h-8 w-8 text-farmer-primary" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Welcome back, {farmerProfile?.user?.firstName || 'Farmer'}!
            </h2>
            <p className="text-muted-foreground">Here's what's happening on your farm today</p>
          </div>
        </div>
        <Button className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Share Update
        </Button>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expert Chat Section - Takes 2 columns */}
        <div className="lg:col-span-2">
          <FarmerExpertChat />
        </div>

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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

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
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <MessageCircle className="h-6 w-6" />
              <span className="text-sm">Chat with Expert</span>
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
    </div>
  );
};

export default DashboardHome;