
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Video, FileText, Users, Clock, Eye, Heart, Share2, Search, Filter, Play, Download } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  type: 'article' | 'video' | 'guide' | 'research';
  author_name: string;
  author_image: string;
  thumbnail_url?: string;
  video_url?: string;
  file_url?: string;
  tags: string[];
  read_time: number;
  views_count: number;
  likes_count: number;
  is_featured: boolean;
  published_at: string;
  created_at: string;
}

const KnowledgeHub = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);

  // Fetch knowledge articles
  const { data: articles = [], isLoading, error: queryError } = useQuery({
    queryKey: ['knowledge-articles', filterCategory, filterType, searchTerm],
    queryFn: async (): Promise<KnowledgeArticle[]> => {
      try {
        const params = new URLSearchParams();
        if (filterCategory !== 'all') params.append('category', filterCategory);
        if (filterType !== 'all') params.append('type', filterType);
        if (searchTerm) params.append('search', searchTerm);
        
        const response = await apiCall<KnowledgeArticle[]>('GET', `/knowledge/articles?${params}`);
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('Failed to fetch articles:', error);
        // Return mock data for demonstration
        return mockArticles;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Like article mutation
  const likeArticleMutation = useMutation({
    mutationFn: async (articleId: string) => {
      return await apiCall('POST', `/knowledge/articles/${articleId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-articles'] });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to like article",
        variant: "destructive",
      });
    }
  });

  // Track view mutation
  const trackViewMutation = useMutation({
    mutationFn: async (articleId: string) => {
      return await apiCall('POST', `/knowledge/articles/${articleId}/view`);
    },
  });

  const categories = [
    'all', 'Crop Management', 'Irrigation', 'Pest Control', 'Soil Health', 
    'Market Trends', 'Technology', 'Sustainability', 'Finance'
  ];

  const types = ['all', 'article', 'video', 'guide', 'research'];

  const filterArticles = () => {
    let filtered = articles;
    
    if (activeTab === 'featured') {
      filtered = filtered.filter(article => article.is_featured);
    } else if (activeTab === 'recent') {
      filtered = filtered.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    } else if (activeTab === 'popular') {
      filtered = filtered.sort((a, b) => b.views_count - a.views_count);
    }
    
    return filtered;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'guide': return <FileText className="h-4 w-4" />;
      case 'research': return <BookOpen className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-800';
      case 'guide': return 'bg-blue-100 text-blue-800';
      case 'research': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleArticleClick = (article: KnowledgeArticle) => {
    trackViewMutation.mutate(article.id);
    setSelectedArticle(article);
  };

  return (
    <div className="min-h-screen bg-gray-50 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Hub</h1>
        <p className="text-gray-600 mt-1">Learn about farming practices and industry insights</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Content</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterArticles().map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={() => handleArticleClick(article)}
                onLike={() => likeArticleMutation.mutate(article.id)}
                isLiking={likeArticleMutation.isPending}
              />
            ))}
          </div>

          {filterArticles().length === 0 && !isLoading && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Article Detail Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedArticle && (
            <ArticleDetail 
              article={selectedArticle} 
              onLike={() => likeArticleMutation.mutate(selectedArticle.id)}
              isLiking={likeArticleMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Article Card Component
const ArticleCard = ({ 
  article, 
  onClick, 
  onLike, 
  isLiking 
}: {
  article: KnowledgeArticle;
  onClick: () => void;
  onLike: () => void;
  isLiking: boolean;
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="relative">
        <img 
          src={article.thumbnail_url || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'} 
          alt={article.title}
          className="w-full h-48 object-cover rounded-t-lg"
          onClick={onClick}
        />
        <div className="absolute top-4 left-4">
          <Badge className={`${getTypeColor(article.type)}`}>
            <span className="flex items-center">
              {getTypeIcon(article.type)}
              <span className="ml-1 capitalize">{article.type}</span>
            </span>
          </Badge>
        </div>
        {article.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-50 rounded-full p-3 group-hover:bg-opacity-70 transition-colors">
              <Play className="h-8 w-8 text-white" />
            </div>
          </div>
        )}
        {article.is_featured && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-yellow-500 text-white">Featured</Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div onClick={onClick}>
          <Badge variant="outline" className="mb-2">
            {article.category}
          </Badge>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-farmer-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-3">{article.excerpt}</p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <img 
            src={article.author_image} 
            alt={article.author_name}
            className="w-6 h-6 rounded-full"
          />
          <span>{article.author_name}</span>
          <span>•</span>
          <span>{formatDate(article.published_at)}</span>
          <span>•</span>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {article.read_time} min read
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {article.views_count}
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
              disabled={isLiking}
              className="flex items-center hover:text-red-500 transition-colors"
            >
              <Heart className="h-4 w-4 mr-1" />
              {article.likes_count}
            </button>
          </div>
          <Button size="sm" variant="ghost" onClick={(e) => e.stopPropagation()}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-1">
          {article.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Article Detail Component
const ArticleDetail = ({ 
  article, 
  onLike, 
  isLiking 
}: {
  article: KnowledgeArticle;
  onLike: () => void;
  isLiking: boolean;
}) => {
  return (
    <div className="space-y-6">
      <DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge className={`${getTypeColor(article.type)}`}>
              <span className="flex items-center">
                {getTypeIcon(article.type)}
                <span className="ml-1 capitalize">{article.type}</span>
              </span>
            </Badge>
            <Badge variant="outline">{article.category}</Badge>
            {article.is_featured && (
              <Badge className="bg-yellow-500 text-white">Featured</Badge>
            )}
          </div>
          <DialogTitle className="text-2xl">{article.title}</DialogTitle>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <img 
                src={article.author_image} 
                alt={article.author_name}
                className="w-8 h-8 rounded-full mr-2"
              />
              <span className="font-medium">{article.author_name}</span>
            </div>
            <span>•</span>
            <span>{new Date(article.published_at).toLocaleDateString()}</span>
            <span>•</span>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {article.read_time} min read
            </div>
          </div>
        </div>
      </DialogHeader>

      {article.type === 'video' && article.video_url && (
        <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
          <div className="text-white text-center">
            <Play className="h-16 w-16 mx-auto mb-4" />
            <p>Video player would be embedded here</p>
            <p className="text-sm text-gray-300 mt-2">{article.video_url}</p>
          </div>
        </div>
      )}

      {article.thumbnail_url && article.type !== 'video' && (
        <img 
          src={article.thumbnail_url} 
          alt={article.title}
          className="w-full h-64 object-cover rounded-lg"
        />
      )}

      <div className="prose max-w-none">
        <div className="text-lg text-gray-600 mb-6">{article.excerpt}</div>
        <div className="whitespace-pre-wrap">{article.content}</div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-6">
          <div className="flex items-center text-sm text-gray-500">
            <Eye className="h-4 w-4 mr-2" />
            {article.views_count} views
          </div>
          <button 
            onClick={onLike}
            disabled={isLiking}
            className="flex items-center text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            <Heart className="h-4 w-4 mr-2" />
            {article.likes_count} likes
          </button>
        </div>
        <div className="flex items-center space-x-2">
          {article.file_url && (
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
          <Button size="sm" variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {article.tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};

// Helper function for type icons and colors
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'video': return <Video className="h-4 w-4" />;
    case 'guide': return <FileText className="h-4 w-4" />;
    case 'research': return <BookOpen className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'video': return 'bg-red-100 text-red-800';
    case 'guide': return 'bg-blue-100 text-blue-800';
    case 'research': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Mock data for demonstration
const mockArticles: KnowledgeArticle[] = [
  {
    id: '1',
    title: 'Modern Irrigation Techniques for Small-Scale Farmers',
    content: 'Water management is crucial for successful farming. This comprehensive guide covers drip irrigation, sprinkler systems, and water conservation techniques that can significantly improve crop yields while reducing water consumption...',
    excerpt: 'Learn about modern irrigation techniques that can help small-scale farmers improve crop yields while conserving water.',
    category: 'Irrigation',
    type: 'guide',
    author_name: 'Dr. Sarah Mwangi',
    author_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    tags: ['irrigation', 'water-conservation', 'farming-techniques'],
    read_time: 8,
    views_count: 1250,
    likes_count: 89,
    is_featured: true,
    published_at: '2024-01-15T10:00:00Z',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Organic Pest Control Methods',
    content: 'Integrated pest management using organic methods can effectively control pests while maintaining soil health and crop quality...',
    excerpt: 'Discover effective organic pest control methods that protect crops without harmful chemicals.',
    category: 'Pest Control',
    type: 'article',
    author_name: 'John Kamau',
    author_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    tags: ['organic-farming', 'pest-control', 'sustainable-agriculture'],
    read_time: 6,
    views_count: 890,
    likes_count: 67,
    is_featured: false,
    published_at: '2024-01-12T14:30:00Z',
    created_at: '2024-01-12T14:30:00Z'
  },
  {
    id: '3',
    title: 'Soil Health Assessment and Improvement',
    content: 'Understanding soil composition and implementing improvement strategies is fundamental to successful farming...',
    excerpt: 'Learn how to assess soil health and implement strategies for soil improvement and fertility management.',
    category: 'Soil Health',
    type: 'video',
    author_name: 'Prof. Mary Wanjiku',
    author_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    video_url: 'https://example.com/soil-health-video',
    tags: ['soil-health', 'fertility', 'testing'],
    read_time: 12,
    views_count: 2100,
    likes_count: 156,
    is_featured: true,
    published_at: '2024-01-10T09:00:00Z',
    created_at: '2024-01-10T09:00:00Z'
  }
];

export default KnowledgeHub;
