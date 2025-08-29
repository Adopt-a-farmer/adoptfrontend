import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  FileText, 
  Eye, 
  X,
  Plus,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import api from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

interface ArticleForm {
  title: string;
  content: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  status: 'draft' | 'published';
}

const EditArticle = () => {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<ArticleForm>({
    title: '',
    content: '',
    category: '',
    difficulty: 'beginner',
    tags: [],
    status: 'draft'
  });
  const [newTag, setNewTag] = useState('');
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch article data
  const { data: article, isLoading } = useQuery({
    queryKey: ['article', id],
    queryFn: async () => {
      const response = await api.get(`/knowledge/articles/${id}`);
      return response.data.data.article;
    },
    enabled: !!id
  });

  // Update form data when article loads
  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || '',
        content: article.content || '',
        category: article.category || '',
        difficulty: article.difficulty || 'beginner',
        tags: article.tags || [],
        status: article.status || 'draft'
      });
    }
  }, [article]);

  const updateArticleMutation = useMutation({
    mutationFn: async (data: ArticleForm) => {
      const response = await api.put(`/experts/articles/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', id] });
      toast({
        title: 'Success',
        description: 'Article updated successfully'
      });
      navigate('/expert/articles');
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update article';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  });

  const categories = [
    { value: 'crop_farming', label: 'Crop Farming' },
    { value: 'livestock', label: 'Livestock' },
    { value: 'pest_control', label: 'Pest Control' },
    { value: 'soil_management', label: 'Soil Management' },
    { value: 'irrigation', label: 'Irrigation' },
    { value: 'harvesting', label: 'Harvesting' },
    { value: 'post_harvest', label: 'Post Harvest' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'finance', label: 'Finance' },
    { value: 'technology', label: 'Technology' },
    { value: 'climate', label: 'Climate' },
    { value: 'sustainability', label: 'Sustainability' }
  ];

  const handleInputChange = (field: keyof ArticleForm, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (status: 'draft' | 'published') => {
    if (!formData.title.trim() || !formData.content.trim() || !formData.category) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    updateArticleMutation.mutate({
      ...formData,
      status
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h2>
        <p className="text-gray-600 mb-4">The article you're looking for doesn't exist.</p>
        <Link to="/expert/articles">
          <Button>Back to Articles</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/expert/articles">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
          <p className="text-gray-600 mt-1">
            Update your article content and settings
          </p>
        </div>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Article Content</CardTitle>
              <CardDescription>
                Update your article content and title
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter article title..."
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Write your article content here..."
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  className="min-h-96"
                />
                <p className="text-sm text-gray-500">
                  {formData.content.length} characters
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Article Settings</CardTitle>
              <CardDescription>
                Configure your article metadata
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => handleInputChange('difficulty', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button onClick={handleAddTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Current Status */}
              <div className="space-y-2">
                <Label>Current Status</Label>
                <Badge className={article.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {article.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Update Article</CardTitle>
              <CardDescription>
                Save your changes or update publish status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => handleSubmit('draft')}
                variant="outline"
                className="w-full"
                disabled={updateArticleMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              
              <Button
                onClick={() => handleSubmit('published')}
                className="w-full"
                disabled={updateArticleMutation.isPending}
              >
                <Eye className="h-4 w-4 mr-2" />
                {article.status === 'published' ? 'Update Published' : 'Publish Article'}
              </Button>

              {updateArticleMutation.isPending && (
                <p className="text-sm text-gray-500 text-center">
                  Updating article...
                </p>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 line-clamp-2">
                  {formData.title || 'Article Title'}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {formData.content || 'Article content will appear here...'}
                </p>
                {formData.category && (
                  <Badge variant="outline">
                    {categories.find(c => c.value === formData.category)?.label}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditArticle;