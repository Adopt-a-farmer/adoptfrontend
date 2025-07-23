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
  AlertCircle
} from 'lucide-react';

const DashboardHome = () => {
  const stats = [
    {
      title: 'Active Adopters',
      value: '12',
      icon: Users,
      trend: '+2 this month',
      color: 'text-blue-600'
    },
    {
      title: 'Total Contributions',
      value: 'KES 45,600',
      icon: DollarSign,
      trend: '+8% from last month',
      color: 'text-green-600'
    },
    {
      title: 'Upcoming Visits',
      value: '3',
      icon: Calendar,
      trend: 'Next: Tomorrow',
      color: 'text-purple-600'
    },
    {
      title: 'Updates Shared',
      value: '18',
      icon: FileText,
      trend: 'Last: 2 days ago',
      color: 'text-orange-600'
    }
  ];

  const tasks = [
    { id: 1, task: 'Share harvest update with photos', priority: 'High', dueDate: 'Today' },
    { id: 2, task: 'Respond to Sarah\'s message', priority: 'Medium', dueDate: 'Tomorrow' },
    { id: 3, task: 'Prepare for farm visit (John & Mary)', priority: 'High', dueDate: '2 days' },
    { id: 4, task: 'Complete soil management training', priority: 'Low', dueDate: '1 week' }
  ];

  const recentActivity = [
    { id: 1, action: 'New adopter joined', user: 'Michael Chen', time: '2 hours ago' },
    { id: 2, action: 'Contribution received', amount: 'KES 2,500', time: '1 day ago' },
    { id: 3, action: 'Update approved by admin', content: 'Planting season update', time: '2 days ago' },
    { id: 4, action: 'Visit scheduled', user: 'Emma Wilson', time: '3 days ago' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Welcome back, John! 🌾</h2>
          <p className="text-muted-foreground">Here's what's happening on your farm today</p>
        </div>
        <Button className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Share Update
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
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
            {tasks.map((task) => (
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
            {recentActivity.map((activity) => (
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
              <Users className="h-6 w-6" />
              <span className="text-sm">Message Adopters</span>
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
              <span>75%</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">95%</p>
              <p className="text-sm text-muted-foreground">Adopter Satisfaction</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">18</p>
              <p className="text-sm text-muted-foreground">Updates This Month</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">8</p>
              <p className="text-sm text-muted-foreground">Successful Visits</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;