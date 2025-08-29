import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { KnowledgeArticle } from '@/services/knowledge';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Heart, 
  FileText,
  Users,
  Calendar,
  Target
} from 'lucide-react';
import api from '@/services/api';

const KnowledgeAnalytics = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['expert-dashboard'],
    queryFn: async () => {
      const response = await api.get('/experts/dashboard');
      return response.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = dashboardData?.stats;
  const recentArticles = dashboardData?.recentArticles || [];

  const performanceMetrics = [
    {
      title: 'Article Performance',
      description: 'How your articles are performing',
      metrics: [
        {
          label: 'Published Articles',
          value: stats?.articles?.published || 0,
          total: stats?.articles?.total || 0,
          icon: FileText,
          color: 'text-blue-600'
        },
        {
          label: 'Total Views',
          value: stats?.engagement?.totalViews || 0,
          total: Math.max(stats?.engagement?.totalViews || 0, 1000),
          icon: Eye,
          color: 'text-green-600'
        },
        {
          label: 'Total Likes',
          value: stats?.engagement?.totalLikes || 0,
          total: Math.max(stats?.engagement?.totalLikes || 0, 100),
          icon: Heart,
          color: 'text-red-600'
        }
      ]
    }
  ];

  const engagementRate = stats?.engagement?.totalViews > 0 
    ? ((stats?.engagement?.totalLikes || 0) / stats?.engagement?.totalViews * 100).toFixed(1)
    : '0.0';

  const reachPercentage = stats?.platform?.totalFarmers > 0
    ? ((stats?.engagement?.totalViews || 0) / stats?.platform?.totalFarmers * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Knowledge Analytics</h1>
        <p className="text-gray-600 mt-2">
          Track your content performance and impact on the farming community
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published Articles</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.articles?.published || 0}</p>
                <p className="text-xs text-gray-500">{stats?.articles?.drafts || 0} drafts</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-green-600">{(stats?.engagement?.totalViews || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500">All time</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold text-red-600">{engagementRate}%</p>
                <p className="text-xs text-gray-500">Likes per view</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reach</p>
                <p className="text-2xl font-bold text-purple-600">{reachPercentage}%</p>
                <p className="text-xs text-gray-500">of farmers reached</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Content Performance
            </CardTitle>
            <CardDescription>
              Detailed breakdown of your content metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {performanceMetrics[0].metrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <metric.icon className={`h-4 w-4 ${metric.color}`} />
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <span className="text-sm font-bold">{metric.value.toLocaleString()}</span>
                </div>
                <Progress 
                  value={(metric.value / metric.total) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Platform Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Platform Impact
            </CardTitle>
            <CardDescription>
              Your influence on the farming community
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {stats?.platform?.totalFarmers || 0}
                </div>
                <div className="text-sm text-gray-600">Total Farmers</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {stats?.platform?.totalAdopters || 0}
                </div>
                <div className="text-sm text-gray-600">Total Adopters</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Knowledge Reach</span>
                <span className="text-sm font-medium">{reachPercentage}%</span>
              </div>
              <Progress value={parseFloat(reachPercentage)} className="h-2" />
              <p className="text-xs text-gray-500">
                Your articles have reached {reachPercentage}% of farmers on the platform
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Engagement Quality</span>
                <span className="text-sm font-medium">{engagementRate}%</span>
              </div>
              <Progress value={parseFloat(engagementRate)} className="h-2" />
              <p className="text-xs text-gray-500">
                Average engagement rate across all your content
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Articles */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Articles</CardTitle>
          <CardDescription>
            Your most successful knowledge contributions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentArticles.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No published articles yet</p>
              <p className="text-sm text-gray-400">Create your first article to see analytics</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentArticles
                .filter((article: KnowledgeArticle) => article.status === 'published')
                .sort((a: KnowledgeArticle, b: KnowledgeArticle) => (b.views + b.likesCount) - (a.views + a.likesCount))
                .slice(0, 5)
                .map((article: KnowledgeArticle, index: number) => (
                  <div key={article._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 line-clamp-1">{article.title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {article.views.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {article.likesCount.toLocaleString()}
                          </span>
                          <Badge variant="outline">
                            {((article.likesCount / Math.max(article.views, 1)) * 100).toFixed(1)}% engagement
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              
              {recentArticles.filter((article: KnowledgeArticle) => article.status === 'published').length === 0 && (
                <div className="text-center py-6">
                  <p className="text-gray-500">No published articles with engagement data yet</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
          <CardDescription>
            Tips to improve your content performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Content Strategy</h4>
              <p className="text-sm text-blue-700">
                {stats?.articles?.published < 5 
                  ? "Create more articles to build your expertise reputation and reach more farmers."
                  : "Great job! Keep consistently publishing quality content to maintain engagement."
                }
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Engagement</h4>
              <p className="text-sm text-green-700">
                {parseFloat(engagementRate) < 2
                  ? "Focus on writing more practical, actionable content that farmers can easily apply."
                  : "Excellent engagement! Your content resonates well with the farming community."
                }
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Reach</h4>
              <p className="text-sm text-purple-700">
                {parseFloat(reachPercentage) < 10
                  ? "Try covering trending farming topics and seasonal advice to increase visibility."
                  : "Amazing reach! Your expertise is making a significant impact on the community."
                }
              </p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">Growth Opportunity</h4>
              <p className="text-sm text-orange-700">
                Consider adding visual content and step-by-step guides to enhance article appeal.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeAnalytics;