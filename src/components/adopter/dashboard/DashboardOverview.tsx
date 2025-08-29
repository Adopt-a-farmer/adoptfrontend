
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Users, Wallet, Calendar, Book, MessageCircle, TrendingUp, Bell } from 'lucide-react';
import { useAdopterDashboard } from '@/hooks/useAdopterDashboard';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

const DashboardOverview = () => {
  const { user } = useAuth();
  const { stats, recentUpdates, isLoading } = useAdopterDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-farmer-primary to-farmer-secondary text-white rounded-lg p-6 animate-pulse">
          <div className="h-8 bg-white/20 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-white/20 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-farmer-primary to-farmer-secondary text-white rounded-lg p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Welcome back, {user?.firstName || user?.email?.split('@')[0] || 'Adopter'}!
        </h1>
        <p className="text-lg opacity-90">Track your impact and connect with your adopted farmers</p>
        {stats?.unreadMessages > 0 && (
          <div className="mt-3 flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-2 w-fit">
            <Bell className="h-4 w-4" />
            <span className="text-sm">You have {stats.unreadMessages} new messages</span>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Contributions</CardTitle>
            <Wallet className="h-4 w-4 text-farmer-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-farmer-primary">
              KES {stats?.totalContributions?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Lifetime giving</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Adopted Farmers</CardTitle>
            <Users className="h-4 w-4 text-farmer-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-farmer-primary">{stats?.adoptedFarmers || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Active partnerships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Support</CardTitle>
            <TrendingUp className="h-4 w-4 text-farmer-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-farmer-primary">
              KES {Math.round(stats?.averageContribution || 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Per farmer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-farmer-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-farmer-primary">{stats?.unreadMessages || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Unread updates</p>
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
          {recentUpdates && recentUpdates.length > 0 ? (
            <div className="space-y-4">
              {recentUpdates.map((update) => (
                <div key={update.id} className="flex items-start space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <img 
                    src={update.farmer_image} 
                    alt={update.farmer_name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-900">{update.farmer_name}</h4>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{update.description}</p>
                    <Badge variant="outline" className="mt-2 bg-farmer-secondary/10 text-farmer-primary border-farmer-secondary">
                      {update.update_type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent updates from your farmers</p>
              <Link to="/adopter/discover" className="inline-block mt-2">
                <Button size="sm" className="bg-farmer-primary hover:bg-farmer-primary/90">
                  Adopt Your First Farmer
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
