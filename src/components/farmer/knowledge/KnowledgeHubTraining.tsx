import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { knowledgeService, KnowledgeArticle, FarmingCalendar, FarmingVideo } from '@/services/knowledge';
import { BookOpen, Calendar, Clock, User, Heart, Eye, Search, Filter, Youtube, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const KnowledgeHubTraining = () => {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [calendar, setCalendar] = useState<FarmingCalendar[]>([]);
  const [videos, setVideos] = useState<FarmingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all_levels');
  const [videoCategory, setVideoCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

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

  const difficulties = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    fetchArticles();
    fetchCalendar();
    fetchFarmingVideos();
  }, [currentPage, selectedCategory, selectedDifficulty, searchQuery]);
  
  useEffect(() => {
    fetchFarmingVideos();
  }, [videoCategory]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await knowledgeService.getArticles({
        page: currentPage,
        limit: 12,
        category: selectedCategory === 'all' ? undefined : selectedCategory || undefined,
        difficulty: selectedDifficulty === 'all_levels' ? undefined : selectedDifficulty || undefined,
        search: searchQuery || undefined,
        sort: 'latest'
      });

      if (response.success) {
        setArticles(response.data.articles);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load articles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendar = async () => {
    try {
      const response = await knowledgeService.getCalendar();
      if (response.success) {
        setCalendar(response.data.calendar);
      }
    } catch (error) {
      console.error('Failed to load calendar:', error);
    }
  };
  
  const fetchFarmingVideos = async () => {
    try {
      setVideosLoading(true);
      const params: { category?: string, search?: string } = {};
      
      if (videoCategory && videoCategory !== 'all') {
        params.category = videoCategory;
      }
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      const response = await knowledgeService.getFarmingVideos(params);
      
      if (response.success) {
        setVideos(response.data.videos);
      }
    } catch (error) {
      console.error('Failed to load farming videos:', error);
      toast({
        title: "Error",
        description: "Failed to load farming videos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVideosLoading(false);
    }
  };

  const handleLikeArticle = async (articleId: string) => {
    try {
      const response = await knowledgeService.toggleLike(articleId);
      if (response.success) {
        setArticles(prev => prev.map(article => 
          article._id === articleId 
            ? { 
                ...article, 
                likes: response.data.liked 
                  ? [...article.likes, { user: 'current', date: new Date().toISOString() }]
                  : article.likes.slice(0, -1)
              }
            : article
        ));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like article. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMonthName = (month: number) => {
    return new Date(2024, month - 1).toLocaleDateString('en-US', { month: 'long' });
  };

  const getCurrentMonthCalendar = () => {
    const currentMonth = new Date().getMonth() + 1;
    return calendar.filter(item => item.timing.month === currentMonth);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Knowledge Hub</h2>
        <p className="text-muted-foreground">Access training and educational resources</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_levels">All Levels</SelectItem>
                {difficulties.map(difficulty => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="calendar">Farming Calendar</TabsTrigger>
          <TabsTrigger value="videos">Farming Videos</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No articles found. Try adjusting your search or filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Card key={article._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {article.category.replace(/_/g, ' ')}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {article.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {article.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {article.author.firstName} {article.author.lastName}
                        {article.isExpert && <Badge variant="outline" className="ml-1 text-xs">Expert</Badge>}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.estimatedReadTime} min read
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {article.views}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {article.likes.length}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLikeArticle(article._id)}
                          className="h-8"
                        >
                          <Heart className="h-3 w-3 mr-1" />
                          Like
                        </Button>
                        <Button size="sm" className="h-8">
                          Read More
                        </Button>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground mt-2">
                      Published {formatDate(article.publishedAt || article.createdAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                This Month's Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getCurrentMonthCalendar().length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No activities scheduled for this month.
                </p>
              ) : (
                <div className="space-y-4">
                  {getCurrentMonthCalendar().map((activity) => (
                    <div key={activity._id} className="border-l-4 border-primary pl-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">
                              {activity.category.replace(/_/g, ' ')}
                            </Badge>
                            <Badge variant={
                              activity.priority === 'critical' ? 'destructive' :
                              activity.priority === 'high' ? 'default' :
                              activity.priority === 'medium' ? 'secondary' : 'outline'
                            }>
                              {activity.priority}
                            </Badge>
                          </div>
                          {activity.instructions?.tips && activity.instructions.tips.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-muted-foreground">Tips:</p>
                              <ul className="text-xs text-muted-foreground ml-4 list-disc">
                                {activity.instructions.tips.slice(0, 2).map((tip, index) => (
                                  <li key={index}>{tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Week {activity.timing.week || 'All'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Full Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
                  const monthActivities = calendar.filter(item => item.timing.month === month);
                  return (
                    <Card key={month} className="p-4">
                      <h4 className="font-medium mb-2">{getMonthName(month)}</h4>
                      {monthActivities.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No activities</p>
                      ) : (
                        <div className="space-y-2">
                          {monthActivities.slice(0, 3).map(activity => (
                            <div key={activity._id} className="text-xs">
                              <p className="font-medium">{activity.title}</p>
                              <Badge variant="outline" className="text-xs">
                                {activity.category}
                              </Badge>
                            </div>
                          ))}
                          {monthActivities.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{monthActivities.length - 3} more
                            </p>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="videos" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Select value={videoCategory} onValueChange={setVideoCategory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="sustainability">Sustainability</SelectItem>
                      <SelectItem value="pest_control">Pest Control</SelectItem>
                      <SelectItem value="irrigation">Irrigation</SelectItem>
                      <SelectItem value="crop_farming">Crop Farming</SelectItem>
                      <SelectItem value="livestock">Livestock</SelectItem>
                      <SelectItem value="soil_management">Soil Management</SelectItem>
                      <SelectItem value="post_harvest">Post Harvest</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {videosLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-gray-200"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Youtube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No videos found. Try adjusting your filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videos.map(video => (
                <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-video">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button variant="secondary" size="sm" asChild>
                        <a href={video.url} target="_blank" rel="noopener noreferrer">
                          <Youtube className="h-4 w-4 mr-2" /> Play Video
                        </a>
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium line-clamp-1">{video.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {video.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline">
                        {video.category.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {video.duration}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="px-4 py-3 border-t flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      {video.channel}
                    </div>
                    <Button size="sm" variant="ghost" asChild>
                      <a href={video.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" /> Watch
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KnowledgeHubTraining;