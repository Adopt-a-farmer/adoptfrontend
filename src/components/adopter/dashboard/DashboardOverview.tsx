
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Users, Wallet, Calendar, Book } from 'lucide-react';

const DashboardOverview = () => {
  // Mock data - in real app this would come from API
  const stats = {
    totalContributions: 2500,
    adoptedFarmers: 3,
    roi: 12.5,
    upcomingVisits: 1
  };

  const recentUpdates = [
    {
      id: 1,
      farmerName: "John Kamau",
      update: "New irrigation system installed successfully!",
      date: "2 hours ago",
      image: "https://images.unsplash.com/photo-1629721671030-a83fcab7141a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 2,
      farmerName: "Mary Wanjiku",
      update: "First harvest of the season completed - 80% above target!",
      date: "1 day ago",
      image: "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 3,
      farmerName: "Peter Ochieng",
      update: "Started construction of new fish ponds",
      date: "3 days ago",
      image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-farmer-primary to-farmer-secondary text-white rounded-lg p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, Adopter!</h1>
        <p className="text-lg opacity-90">Track your impact and connect with your adopted farmers</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Contributions</CardTitle>
            <Wallet className="h-4 w-4 text-farmer-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-farmer-primary">${stats.totalContributions}</div>
            <p className="text-xs text-gray-500 mt-1">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Adopted Farmers</CardTitle>
            <Users className="h-4 w-4 text-farmer-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-farmer-primary">{stats.adoptedFarmers}</div>
            <p className="text-xs text-gray-500 mt-1">Active partnerships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">ROI Impact</CardTitle>
            <Book className="h-4 w-4 text-farmer-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-farmer-primary">{stats.roi}%</div>
            <p className="text-xs text-gray-500 mt-1">Expected annual return</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Upcoming Visits</CardTitle>
            <Calendar className="h-4 w-4 text-farmer-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-farmer-primary">{stats.upcomingVisits}</div>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link to="/adopter/discover">
              <Button className="bg-farmer-primary hover:bg-farmer-primary/90">
                <Users className="mr-2 h-4 w-4" />
                Adopt New Farmer
              </Button>
            </Link>
            <Link to="/adopter/visits">
              <Button variant="outline" className="border-farmer-primary text-farmer-primary hover:bg-farmer-primary hover:text-white">
                <Calendar className="mr-2 h-4 w-4" />
                Book Farm Visit
              </Button>
            </Link>
            <Link to="/adopter/messages">
              <Button variant="outline" className="border-farmer-primary text-farmer-primary hover:bg-farmer-primary hover:text-white">
                <Book className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Updates Feed */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Farmer Updates</CardTitle>
          <Link to="/adopter/my-farmers">
            <Button variant="ghost" size="sm" className="text-farmer-primary">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentUpdates.map((update) => (
              <div key={update.id} className="flex items-start space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <img 
                  src={update.image} 
                  alt={update.farmerName}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900">{update.farmerName}</h4>
                    <span className="text-xs text-gray-500">{update.date}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{update.update}</p>
                  <Badge variant="outline" className="mt-2 bg-farmer-secondary/10 text-farmer-primary border-farmer-secondary">
                    Farm Update
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
