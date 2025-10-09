import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { farmerStoryService, FarmerStory, CreateStoryData } from '@/services/farmerStoryService';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, Search, Heart, MessageCircle, ThumbsUp, Eye, Calendar, MapPin,
  Image as ImageIcon, Video, X, Loader2, Filter, TrendingUp
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'pest_control', label: 'Pest Control' },
  { value: 'crop_disease', label: 'Crop Disease' },
  { value: 'drought', label: 'Drought' },
  { value: 'flooding', label: 'Flooding' },
  { value: 'soil_management', label: 'Soil Management' },
  { value: 'irrigation', label: 'Irrigation' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'finance', label: 'Finance' },
  { value: 'labor', label: 'Labor' },
  { value: 'weather', label: 'Weather' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'livestock', label: 'Livestock' },
  { value: 'harvest', label: 'Harvest' },
  { value: 'storage', label: 'Storage' },
  { value: 'other', label: 'Other' }
];

const FarmerStoriesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [stories, setStories] = useState<FarmerStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Create story form state
  const [formData, setFormData] = useState<CreateStoryData>({
    title: '',
    challenge: '',
    solution: '',
    outcome: '',
    category: '',
    tags: [],
    media: []
  });
  
  const [mediaPreview, setMediaPreview] = useState<Array<{ url: string; type: string; file: File }>>([]);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [expandedStory, setExpandedStory] = useState<string | null>(null);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await farmerStoryService.getAllStories({
        page: currentPage,
        limit: 10,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchQuery || undefined,
        sort: '-createdAt'
      });

      if (response.success) {
        setStories(response.data.stories);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to load stories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedCategory, searchQuery]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (validFiles.length + mediaPreview.length > 5) {
      toast({
        title: "Too many files",
        description: "You can upload maximum 5 images/videos",
        variant: "destructive",
      });
      return;
    }

    const newPreviews = validFiles.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
      file
    }));

    setMediaPreview([...mediaPreview, ...newPreviews]);
    setFormData({ ...formData, media: [...(formData.media || []), ...validFiles] });
  };

  const removeMedia = (index: number) => {
    const newPreviews = [...mediaPreview];
    const newMedia = [...(formData.media || [])];
    
    URL.revokeObjectURL(newPreviews[index].url);
    newPreviews.splice(index, 1);
    newMedia.splice(index, 1);
    
    setMediaPreview(newPreviews);
    setFormData({ ...formData, media: newMedia });
  };

  const handleCreateStory = async () => {
    if (!formData.title || !formData.challenge || !formData.solution || !formData.category) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      const response = await farmerStoryService.createStory(formData);

      if (response.success) {
        toast({
          title: "Success!",
          description: "Your story has been shared with the community",
        });
        
        setIsCreateDialogOpen(false);
        setFormData({
          title: '',
          challenge: '',
          solution: '',
          outcome: '',
          category: '',
          tags: [],
          media: []
        });
        setMediaPreview([]);
        fetchStories(); // Refresh the feed
      }
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to create story",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleLike = async (storyId: string) => {
    try {
      const response = await farmerStoryService.toggleLike(storyId);
      
      if (response.success) {
        setStories(prev => prev.map(story => {
          if (story._id === storyId) {
            return {
              ...story,
              likeCount: response.data.likeCount,
              likes: response.data.liked 
                ? [...story.likes, { user: user?._id || '', date: new Date().toISOString() }]
                : story.likes.filter(like => like.user !== user?._id)
            };
          }
          return story;
        }));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like story",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async (storyId: string) => {
    const text = commentText[storyId];
    if (!text || text.trim().length === 0) return;

    try {
      const response = await farmerStoryService.addComment(storyId, text.trim());
      
      if (response.success) {
        setStories(prev => prev.map(story => {
          if (story._id === storyId) {
            return {
              ...story,
              comments: [...story.comments, response.data],
              commentCount: story.commentCount + 1
            };
          }
          return story;
        }));
        
        setCommentText({ ...commentText, [storyId]: '' });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const handleMarkHelpful = async (storyId: string) => {
    try {
      const response = await farmerStoryService.markHelpful(storyId);
      
      if (response.success) {
        setStories(prev => prev.map(story => {
          if (story._id === storyId) {
            return {
              ...story,
              helpfulCount: response.data.helpfulCount,
              markedHelpfulBy: response.data.marked
                ? [...story.markedHelpfulBy, user?._id || '']
                : story.markedHelpfulBy.filter(id => id !== user?._id)
            };
          }
          return story;
        }));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark as helpful",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Farmer Stories</h2>
          <p className="text-muted-foreground mt-1">
            Share and learn from real farming challenges and solutions
          </p>
        </div>
        
        {user?.role === 'farmer' && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Share Your Story
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Share Your Farming Story</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title">Story Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., How I Solved My Pest Problem"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="challenge">The Challenge *</Label>
                  <Textarea
                    id="challenge"
                    placeholder="Describe the problem or challenge you faced..."
                    value={formData.challenge}
                    onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="solution">The Solution *</Label>
                  <Textarea
                    id="solution"
                    placeholder="Explain how you solved the problem..."
                    value={formData.solution}
                    onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="outcome">The Outcome (Optional)</Label>
                  <Textarea
                    id="outcome"
                    placeholder="Share the results and impact..."
                    value={formData.outcome}
                    onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (Optional)</Label>
                  <Input
                    id="tags"
                    placeholder="e.g., organic, irrigation, pest-control (comma separated)"
                    value={formData.tags?.join(', ')}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) 
                    })}
                  />
                </div>

                {/* Media Upload */}
                <div>
                  <Label>Photos/Videos (Max 5)</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="media-upload"
                    />
                    <label htmlFor="media-upload">
                      <Button variant="outline" type="button" className="w-full" asChild>
                        <span className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          Upload Images/Videos
                        </span>
                      </Button>
                    </label>
                  </div>

                  {/* Media Preview */}
                  {mediaPreview.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {mediaPreview.map((media, index) => (
                        <div key={index} className="relative group">
                          {media.type === 'video' ? (
                            <video 
                              src={media.url} 
                              className="w-full h-24 object-cover rounded"
                            />
                          ) : (
                            <img 
                              src={media.url} 
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded"
                            />
                          )}
                          <button
                            onClick={() => removeMedia(index)}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateStory} disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sharing...
                    </>
                  ) : (
                    'Share Story'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stories Feed */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-3 bg-muted rounded w-1/6" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-20 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stories.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No stories yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to share your farming experience!
            </p>
            {user?.role === 'farmer' && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Share Your Story
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {stories.map((story) => (
            <Card key={story._id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={story.farmer.profilePicture} />
                      <AvatarFallback>
                        {story.farmer.firstName[0]}{story.farmer.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {story.farmer.firstName} {story.farmer.lastName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {story.farmer.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {story.farmer.location.county}, {story.farmer.location.country}
                          </span>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(story.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">{CATEGORIES.find(c => c.value === story.category)?.label}</Badge>
                </div>
                <CardTitle className="mt-3">{story.title}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Media Gallery */}
                {story.media && story.media.length > 0 && (
                  <div className={`grid gap-2 ${story.media.length === 1 ? 'grid-cols-1' : story.media.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {story.media.slice(0, 3).map((media, index) => (
                      <div key={index} className="relative">
                        {media.type === 'video' ? (
                          <video 
                            src={media.url}
                            controls
                            className="w-full h-48 object-cover rounded"
                          />
                        ) : (
                          <img 
                            src={media.url} 
                            alt={`Story media ${index + 1}`}
                            className="w-full h-48 object-cover rounded"
                          />
                        )}
                        {index === 2 && story.media.length > 3 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                            <span className="text-white font-semibold text-lg">
                              +{story.media.length - 3} more
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Story Content */}
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">The Challenge:</h4>
                    <p className="text-sm text-muted-foreground">
                      {expandedStory === story._id 
                        ? story.challenge 
                        : `${story.challenge.substring(0, 200)}${story.challenge.length > 200 ? '...' : ''}`
                      }
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-1">The Solution:</h4>
                    <p className="text-sm text-muted-foreground">
                      {expandedStory === story._id 
                        ? story.solution 
                        : `${story.solution.substring(0, 200)}${story.solution.length > 200 ? '...' : ''}`
                      }
                    </p>
                  </div>

                  {story.outcome && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1">The Outcome:</h4>
                      <p className="text-sm text-muted-foreground">{story.outcome}</p>
                    </div>
                  )}

                  {(story.challenge.length > 200 || story.solution.length > 200) && (
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 h-auto"
                      onClick={() => setExpandedStory(expandedStory === story._id ? null : story._id)}
                    >
                      {expandedStory === story._id ? 'Show less' : 'Read more'}
                    </Button>
                  )}
                </div>

                {/* Tags */}
                {story.tags && story.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {story.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground border-t pt-3">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {story.views} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {story.likeCount} likes
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {story.commentCount} comments
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    {story.helpfulCount} helpful
                  </span>
                </div>

                {/* Actions */}
                {user && (
                  <div className="flex gap-2 border-t pt-3">
                    <Button
                      variant={story.likes.some(like => like.user === user._id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleLike(story._id)}
                      className="flex-1"
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      {story.likes.some(like => like.user === user._id) ? 'Liked' : 'Like'}
                    </Button>
                    <Button
                      variant={story.markedHelpfulBy.includes(user._id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleMarkHelpful(story._id)}
                      className="flex-1"
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Helpful
                    </Button>
                  </div>
                )}

                {/* Comments Section */}
                <div className="border-t pt-3 space-y-3">
                  {story.comments && story.comments.length > 0 && (
                    <div className="space-y-2">
                      {story.comments.slice(0, 3).map((comment) => (
                        <div key={comment._id} className="flex gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.user.profilePicture} />
                            <AvatarFallback>
                              {comment.user.firstName[0]}{comment.user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 bg-muted rounded-lg p-2">
                            <p className="text-sm font-semibold">
                              {comment.user.firstName} {comment.user.lastName}
                            </p>
                            <p className="text-sm">{comment.text}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(comment.date)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {story.comments.length > 3 && (
                        <Button variant="link" size="sm" className="p-0">
                          View all {story.comments.length} comments
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Add Comment */}
                  {user && (
                    <div className="flex gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profilePicture as string} />
                        <AvatarFallback>
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex gap-2">
                        <Input
                          placeholder="Write a comment..."
                          value={commentText[story._id] || ''}
                          onChange={(e) => setCommentText({ ...commentText, [story._id]: e.target.value })}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(story._id);
                            }
                          }}
                        />
                        <Button 
                          size="sm"
                          onClick={() => handleAddComment(story._id)}
                          disabled={!commentText[story._id]?.trim()}
                        >
                          Post
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FarmerStoriesPage;
