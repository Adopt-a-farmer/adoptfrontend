import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Eye, 
  Heart, 
  Users, 
  Sprout,
  TrendingUp,
  Plus,
  Loader2,
  Calendar,
  MessageCircle,
  MapPin,
  HandHeart
} from 'lucide-react';
import { useExpertDashboard } from '@/hooks/useExpertDashboard';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const ExpertDashboardHome = () => {
  const { stats, recentArticles, isLoading, error } = useExpertDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">Error loading dashboard data</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  const statsConfig = [
    {
      title: 'Active Mentorships',
      value: '0', // Will be replaced with actual data
      icon: HandHeart,
      description: 'Farmers you are mentoring',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Articles',
      value: stats?.articles?.total?.toString() || '0',
      icon: FileText,
      description: `${stats?.articles?.published || 0} published, ${stats?.articles?.drafts || 0} drafts`,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Investor Relations',
      value: '0', // Will be replaced with actual data
      icon: Users,
      description: 'Investors you oversee',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Farm Visits',
      value: '0', // Will be replaced with actual data
      icon: MapPin,
      description: 'Scheduled and completed',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expert Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Mentor farmers, share knowledge, and track your impact
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/expert/mentorships">
            <Button variant="outline" className="flex items-center gap-2">
              <HandHeart className="h-4 w-4" />
              Mentorships
            </Button>
          </Link>
          <Link to="/expert/articles/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Article
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Articles
              </CardTitle>
              <Link to="/expert/articles">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentArticles.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No articles yet</p>
                <Link to="/expert/articles/create">
                  <Button>Create Your First Article</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentArticles.slice(0, 5).map((article) => (
                  <div key={article._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 line-clamp-1">{article.title}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                          {article.status}
                        </Badge>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {article.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {article.likesCount || 0}
                          </span>
                          <span>
                            {formatDistanceToNow(new Date(article.updatedAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/expert/mentorships">
                <Button variant="outline" className="w-full justify-start">
                  <HandHeart className="h-4 w-4 mr-2" />
                  Manage Mentorships
                </Button>
              </Link>
              <Link to="/expert/investors">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Investor Relations
                </Button>
              </Link>
              <Link to="/expert/messages">
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Messages
                </Button>
              </Link>
              <Link to="/expert/visits">
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Farm Visits
                </Button>
              </Link>
              <Link to="/expert/articles/create">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Article
                </Button>
              </Link>
              <Link to="/expert/articles">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Articles
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5" />
            Expert Impact Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats?.articles?.total || 0}
              </div>
              <p className="text-sm text-gray-600">Articles Published</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {(stats?.engagement?.totalViews || 0).toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Total Article Views</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(stats?.engagement?.totalLikes || 0).toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Article Likes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {((stats?.platform?.totalFarmers || 0) + (stats?.platform?.totalAdopters || 0)).toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Platform Users</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 text-center mt-4">
            Your expertise helps {((stats?.platform?.totalFarmers || 0) + (stats?.platform?.totalAdopters || 0)).toLocaleString()} users succeed in farming
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpertDashboardHome;