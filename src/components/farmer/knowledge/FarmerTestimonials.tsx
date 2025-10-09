import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Heart,
  MessageCircle,
  Plus,
  Upload,
  X,
  Image as ImageIcon,
  TrendingUp,
  Calendar,
  User,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface Testimonial {
  _id: string;
  farmer: {
    _id: string;
    user: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    farmName: string;
  };
  title: string;
  story: string;
  beforeImages: Array<{ url: string; publicId: string }>;
  afterImages: Array<{ url: string; publicId: string }>;
  achievements: string[];
  tags: string[];
  likes: string[];
  comments: Array<{
    _id: string;
    user: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    text: string;
    createdAt: string;
  }>;
  views: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const FarmerTestimonials = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [achievements, setAchievements] = useState('');
  const [tags, setTags] = useState('');
  const [beforeImages, setBeforeImages] = useState<File[]>([]);
  const [afterImages, setAfterImages] = useState<File[]>([]);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const queryClient = useQueryClient();

  // Fetch testimonials
  const { data: testimonialsData, isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/testimonials`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
  });

  const testimonials: Testimonial[] = testimonialsData?.data?.testimonials || [];

  // Create testimonial mutation
  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/testimonials`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      toast.success('Testimonial created successfully!');
      resetForm();
      setIsCreateDialogOpen(false);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to create testimonial');
    },
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async (testimonialId: string) => {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/testimonials/${testimonialId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async ({ testimonialId, text }: { testimonialId: string; text: string }) => {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/testimonials/${testimonialId}/comments`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      setCommentText('');
      toast.success('Comment added!');
    },
  });

  const uploadImages = async (files: File[], type: 'before' | 'after') => {
    if (files.length === 0) return [];

    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/testimonials/upload-images`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data.data.images;
  };

  const handleSubmit = async () => {
    if (!title || !story) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUploading(true);

    try {
      // Upload images
      const beforeImageUrls = await uploadImages(beforeImages, 'before');
      const afterImageUrls = await uploadImages(afterImages, 'after');

      // Create testimonial
      const achievementsArray = achievements
        .split('\n')
        .filter(a => a.trim())
        .map(a => a.trim());

      const tagsArray = tags
        .split(',')
        .filter(t => t.trim())
        .map(t => t.trim());

      await createMutation.mutateAsync({
        title,
        story,
        achievements: achievementsArray,
        tags: tagsArray,
        beforeImages: beforeImageUrls,
        afterImages: afterImageUrls,
      });
    } catch (error) {
      toast.error('Failed to create testimonial');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setStory('');
    setAchievements('');
    setTags('');
    setBeforeImages([]);
    setAfterImages([]);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const files = Array.from(e.target.files || []);
    if (type === 'before') {
      setBeforeImages(prev => [...prev, ...files].slice(0, 5));
    } else {
      setAfterImages(prev => [...prev, ...files].slice(0, 5));
    }
  };

  const removeImage = (index: number, type: 'before' | 'after') => {
    if (type === 'before') {
      setBeforeImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setAfterImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleLike = (testimonialId: string) => {
    likeMutation.mutate(testimonialId);
  };

  const handleComment = (testimonialId: string) => {
    if (!commentText.trim()) return;
    commentMutation.mutate({ testimonialId, text: commentText });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Farmer Success Stories</h2>
          <p className="text-gray-500 mt-1">
            Share your journey and inspire other farmers with your transformation stories
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Share Your Story
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Share Your Success Story</DialogTitle>
              <DialogDescription>
                Inspire other farmers by sharing your journey, achievements, and transformation
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., From 1 acre to 10 acres: My Journey"
                  className="mt-1"
                />
              </div>

              {/* Story */}
              <div>
                <label className="text-sm font-medium">Your Story *</label>
                <Textarea
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="Tell us about your journey, challenges faced, and how you overcame them..."
                  rows={6}
                  className="mt-1"
                />
              </div>

              {/* Achievements */}
              <div>
                <label className="text-sm font-medium">Key Achievements (one per line)</label>
                <Textarea
                  value={achievements}
                  onChange={(e) => setAchievements(e.target.value)}
                  placeholder="Increased crop yield by 50%&#10;Expanded farm from 1 to 5 acres&#10;Started organic farming"
                  rows={4}
                  className="mt-1"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-medium">Tags (comma separated)</label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="crop-farming, organic, irrigation, success"
                  className="mt-1"
                />
              </div>

              {/* Before Images */}
              <div>
                <label className="text-sm font-medium">Before Images (up to 5)</label>
                <div className="mt-2 space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageSelect(e, 'before')}
                    className="hidden"
                    id="before-images"
                  />
                  <label
                    htmlFor="before-images"
                    className="flex items-center justify-center px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <Upload className="w-6 h-6 mr-2" />
                    Upload Before Images
                  </label>
                  {beforeImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {beforeImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Before ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <button
                            onClick={() => removeImage(index, 'before')}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* After Images */}
              <div>
                <label className="text-sm font-medium">After Images (up to 5)</label>
                <div className="mt-2 space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageSelect(e, 'after')}
                    className="hidden"
                    id="after-images"
                  />
                  <label
                    htmlFor="after-images"
                    className="flex items-center justify-center px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <Upload className="w-6 h-6 mr-2" />
                    Upload After Images
                  </label>
                  {afterImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {afterImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`After ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <button
                            onClick={() => removeImage(index, 'after')}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={isUploading || !title || !story}
                className="w-full"
              >
                {isUploading ? 'Creating...' : 'Share Story'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Testimonials Grid */}
      {testimonials.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Success Stories Yet</h3>
            <p className="text-gray-500 mb-4">
              Be the first to share your farming success story and inspire others!
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Share Your Story
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={testimonial.farmer.user.avatar} />
                      <AvatarFallback>
                        {testimonial.farmer.user.firstName[0]}
                        {testimonial.farmer.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">
                        {testimonial.farmer.user.firstName} {testimonial.farmer.user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{testimonial.farmer.farmName}</p>
                    </div>
                  </div>
                  <Badge variant={testimonial.status === 'published' ? 'default' : 'secondary'}>
                    {testimonial.status}
                  </Badge>
                </div>
                <CardTitle className="mt-3 text-lg">{testimonial.title}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Before/After Images */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">BEFORE</p>
                    {testimonial.beforeImages[0] && (
                      <img
                        src={testimonial.beforeImages[0].url}
                        alt="Before"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-green-600 mb-1">AFTER</p>
                    {testimonial.afterImages[0] && (
                      <img
                        src={testimonial.afterImages[0].url}
                        alt="After"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                  </div>
                </div>

                {/* Story Preview */}
                <p className="text-sm text-gray-600 line-clamp-3">{testimonial.story}</p>

                {/* Tags */}
                {testimonial.tags && testimonial.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {testimonial.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(testimonial._id)}
                    className="flex items-center space-x-1"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        testimonial.likes.length > 0 ? 'fill-red-500 text-red-500' : ''
                      }`}
                    />
                    <span>{testimonial.likes.length}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTestimonial(testimonial)}
                    className="flex items-center space-x-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{testimonial.comments.length}</span>
                  </Button>
                  <div className="flex items-center space-x-1 text-gray-500 text-sm">
                    <Eye className="w-4 h-4" />
                    <span>{testimonial.views}</span>
                  </div>
                </div>

                {/* View Details */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTestimonial(testimonial)}
                  className="w-full"
                >
                  Read Full Story
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detailed View Dialog */}
      {selectedTestimonial && (
        <Dialog open={!!selectedTestimonial} onOpenChange={() => setSelectedTestimonial(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center space-x-3 mb-2">
                <Avatar>
                  <AvatarImage src={selectedTestimonial.farmer.user.avatar} />
                  <AvatarFallback>
                    {selectedTestimonial.farmer.user.firstName[0]}
                    {selectedTestimonial.farmer.user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {selectedTestimonial.farmer.user.firstName} {selectedTestimonial.farmer.user.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{selectedTestimonial.farmer.farmName}</p>
                </div>
              </div>
              <DialogTitle className="text-2xl">{selectedTestimonial.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Before/After Images */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Before</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedTestimonial.beforeImages.map((img, index) => (
                      <img
                        key={index}
                        src={img.url}
                        alt={`Before ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">After</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedTestimonial.afterImages.map((img, index) => (
                      <img
                        key={index}
                        src={img.url}
                        alt={`After ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Story */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">The Story</h4>
                <p className="text-gray-600 whitespace-pre-line">{selectedTestimonial.story}</p>
              </div>

              {/* Achievements */}
              {selectedTestimonial.achievements && selectedTestimonial.achievements.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Key Achievements</h4>
                  <ul className="space-y-2">
                    {selectedTestimonial.achievements.map((achievement, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Comments Section */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-700 mb-4">
                  Comments ({selectedTestimonial.comments.length})
                </h4>
                
                {/* Add Comment */}
                <div className="flex space-x-2 mb-4">
                  <Input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleComment(selectedTestimonial._id);
                      }
                    }}
                  />
                  <Button onClick={() => handleComment(selectedTestimonial._id)}>
                    Post
                  </Button>
                </div>

                {/* Comments List */}
                <div className="space-y-3">
                  {selectedTestimonial.comments.map((comment) => (
                    <div key={comment._id} className="flex space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.user.avatar} />
                        <AvatarFallback>
                          {comment.user.firstName[0]}
                          {comment.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg px-3 py-2">
                          <p className="font-semibold text-sm">
                            {comment.user.firstName} {comment.user.lastName}
                          </p>
                          <p className="text-gray-600 text-sm">{comment.text}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FarmerTestimonials;
