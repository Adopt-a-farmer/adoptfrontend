import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Eye, 
  Heart, 
  Clock, 
  User,
  Share2,
  BookOpen
} from 'lucide-react';
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
  isLiked?: boolean;
}

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);

  const fetchArticle = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/knowledge/articles/${id}`);
      const articleData = response.data.article;
      setArticle(articleData);
      
      // Fetch related articles
      const relatedResponse = await api.get(`/knowledge/articles?category=${articleData.category}&limit=3`);
      const related = relatedResponse.data.articles.filter((a: Article) => a._id !== id);
      setRelatedArticles(related.slice(0, 3));
      
      setError(null);
    } catch (error) {
      console.error('Failed to fetch article:', error);
      setError('Failed to load article');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchArticle();
    }
  }, [id, fetchArticle]);

  const handleLike = async () => {
    if (!article || isLiking) return;
    
    try {
      setIsLiking(true);
      await api.post(`/knowledge/articles/${article._id}/like`);
      
      setArticle(prev => prev ? {
        ...prev,
        likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1,
        isLiked: !prev.isLiked
      } : null);
    } catch (error) {
      console.error('Failed to like article:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      // You might want to show a toast here
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

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600 text-lg">{error || 'Article not found'}</p>
            <Link to="/knowledge">
              <Button className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Knowledge Hub
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/knowledge">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Knowledge Hub
            </Button>
          </Link>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Article */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-6">
                  {article.featuredImage && (
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-64 object-cover rounded-lg mb-6"
                    />
                  )}
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary">{article.category}</Badge>
                    {article.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                    {article.title}
                  </CardTitle>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {article.author.avatar_url && (
                        <img
                          src={article.author.avatar_url}
                          alt={`${article.author.firstName} ${article.author.lastName}`}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {article.author.firstName} {article.author.lastName}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {article.views.toLocaleString()} views
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant={article.isLiked ? "default" : "outline"}
                        size="sm"
                        onClick={handleLike}
                        disabled={isLiking}
                        className={article.isLiked ? "text-red-600 bg-red-50 hover:bg-red-100" : ""}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${article.isLiked ? 'fill-current' : ''}`} />
                        {article.likesCount}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Author Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About the Author</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    {article.author.avatar_url && (
                      <img
                        src={article.author.avatar_url}
                        alt={`${article.author.firstName} ${article.author.lastName}`}
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {article.author.firstName} {article.author.lastName}
                      </p>
                      <p className="text-sm text-gray-600">Agricultural Expert</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Expert in sustainable farming practices with years of experience 
                    helping farmers improve their yields and techniques.
                  </p>
                </CardContent>
              </Card>

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Related Articles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {relatedArticles.map((relatedArticle) => (
                        <Link
                          key={relatedArticle._id}
                          to={`/knowledge/articles/${relatedArticle._id}`}
                          className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">
                            {relatedArticle.title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {relatedArticle.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {relatedArticle.likesCount}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link to="/knowledge">
                      <Button variant="outline" className="w-full justify-start">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Browse More Articles
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={handleShare}
                      className="w-full justify-start"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Article
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;