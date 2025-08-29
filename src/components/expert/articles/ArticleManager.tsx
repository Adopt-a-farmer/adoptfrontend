import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Eye, 
  Heart, 
  Edit3, 
  Trash2, 
  Plus, 
  Search,
  Filter,
  Calendar,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Article {
  _id: string;
  title: string;
  status: 'draft' | 'published';
  category: string;
  views: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  slug: string;
}

const ArticleManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteArticleId, setDeleteArticleId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['expert-articles', page, statusFilter, categoryFilter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await api.get(`/experts/articles?${params}`);
      return response.data.data;
    }
  });

  const deleteArticleMutation = useMutation({
    mutationFn: async (articleId: string) => {
      await api.delete(`/experts/articles/${articleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-articles'] });
      toast({
        title: 'Success',
        description: 'Article deleted successfully'
      });
      setDeleteArticleId(null);
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete article';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  });

  const categories = [
    'crop_farming',
    'livestock',
    'pest_control',
    'soil_management',
    'irrigation',
    'harvesting',
    'post_harvest',
    'marketing',
    'finance',
    'technology',
    'climate',
    'sustainability'
  ];

  const handleDeleteArticle = (articleId: string) => {
    deleteArticleMutation.mutate(articleId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Article Manager</h1>
          <p className="text-gray-600 mt-2">
            Manage your knowledge articles and track their performance
          </p>
        </div>
        <Link to="/expert/articles/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Article
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {getCategoryLabel(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Articles</CardTitle>
          <CardDescription>
            {articlesData?.pagination?.total || 0} articles total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : articlesData?.articles?.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' 
                  ? 'Try adjusting your filters or search terms'
                  : 'Start sharing your knowledge by creating your first article'
                }
              </p>
              <Link to="/expert/articles/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Article
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {articlesData?.articles?.map((article: Article) => (
                <div key={article._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {article.title}
                        </h3>
                        <Badge className={getStatusColor(article.status)}>
                          {article.status}
                        </Badge>
                        <Badge variant="outline">
                          {getCategoryLabel(article.category)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {article.views.toLocaleString()} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {article.likesCount.toLocaleString()} likes
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(article.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link to={`/expert/articles/edit/${article._id}`}>
                          <Button variant="outline" size="sm">
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        
                        {article.status === 'published' && (
                          <a 
                            href={`/knowledge/articles/${article.slug}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to={`/expert/articles/edit/${article._id}`}>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Article
                          </Link>
                        </DropdownMenuItem>
                        {article.status === 'published' && (
                          <DropdownMenuItem asChild>
                            <a 
                              href={`/knowledge/articles/${article.slug}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Article
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => setDeleteArticleId(article._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Article
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {articlesData?.pagination && articlesData.pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={!articlesData.pagination.hasPrev}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {articlesData.pagination.current} of {articlesData.pagination.pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={!articlesData.pagination.hasNext}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteArticleId} onOpenChange={() => setDeleteArticleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the article
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteArticleId && handleDeleteArticle(deleteArticleId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Article
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ArticleManager;