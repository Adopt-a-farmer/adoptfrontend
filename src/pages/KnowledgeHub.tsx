import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Clock, 
  User, 
  Eye, 
  Heart,
  BookOpen,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import api from '@/services/api';

interface Article {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar_url?: string;
  };
  views: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  featuredImage?: string;
}

interface KnowledgeStats {
  totalArticles: number;
  totalViews: number;
  totalExperts: number;
  categories: string[];
}

const KnowledgeHub = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKnowledgeData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [articlesRes, statsRes] = await Promise.all([
        api.get('/knowledge/articles'),
        api.get('/knowledge/stats')
      ]);
      
      setArticles(articlesRes.data.articles || []);
      setStats(statsRes.data.stats || null);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch knowledge data:', error);
      setError('Failed to load knowledge hub data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filterAndSortArticles = useCallback(() => {
    let filtered = [...articles];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => 
        article.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Sort articles
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'liked':
        filtered.sort((a, b) => b.likesCount - a.likesCount);
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    setFilteredArticles(filtered);
  }, [articles, searchTerm, selectedCategory, sortBy]);

  useEffect(() => {
    fetchKnowledgeData();
  }, [fetchKnowledgeData]);

  useEffect(() => {
    filterAndSortArticles();
  }, [filterAndSortArticles]);

  const handleLikeArticle = async (articleId: string) => {
    try {
      await api.post(`/knowledge/articles/${articleId}/like`);
      // Update local state
      setArticles(prev => prev.map(article => 
        article._id === articleId 
          ? { ...article, likesCount: article.likesCount + 1 }
          : article
      ));
    } catch (error) {
      console.error('Failed to like article:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600 text-lg">{error}</p>
            <Button onClick={fetchKnowledgeData} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const categories = ['all', ...(stats?.categories || [])];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Knowledge Hub</h1>
                <p className="text-gray-600">Learn from agricultural experts and improve your farming</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalArticles}</div>
                <p className="text-sm text-gray-600">Articles</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalViews.toLocaleString()}</div>
                <p className="text-sm text-gray-600">Total Views</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalExperts}</div>
                <p className="text-sm text-gray-600">Expert Contributors</p>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Viewed</option>
                <option value="liked">Most Liked</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'No articles available yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Card key={article._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  {article.featuredImage && (
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{article.category}</Badge>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {article.likesCount}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {article.author.avatar_url && (
                        <img
                          src={article.author.avatar_url}
                          alt={`${article.author.firstName} ${article.author.lastName}`}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {article.author.firstName} {article.author.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikeArticle(article._id)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Link to={`/knowledge/articles/${article._id}`}>
                        <Button size="sm">
                          Read More
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeHub;