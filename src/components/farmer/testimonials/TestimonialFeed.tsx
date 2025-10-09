import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { apiCall } from '@/services/api';
import TestimonialCard from './TestimonialCard';
import TestimonialForm from './TestimonialForm';

interface Testimonial {
  _id: string;
  content: string;
  images?: string[];
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  likes: number;
  hasLiked?: boolean;
  comments: { _id: string; author: { firstName: string; lastName: string }; content: string; createdAt: string }[];
  tags?: string[];
  createdAt: string;
}

interface TestimonialFeedProps {
  onlyMyTestimonials?: boolean;
  filterTag?: string;
}

const TestimonialFeed = ({ onlyMyTestimonials = false, filterTag }: TestimonialFeedProps) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState(filterTag || '');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most-liked'>('newest');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { toast } = useToast();

  const fetchTestimonials = useCallback(async () => {
    setIsLoading(true);
    try {
      let endpoint = onlyMyTestimonials ? '/testimonials/my' : '/testimonials';
      
      if (selectedTag && !onlyMyTestimonials) {
        endpoint = `/testimonials/tags/${selectedTag}`;
      }

      const response = await apiCall<{ success: boolean; data: Testimonial[] }>('GET', endpoint);
      
      const fetchedTestimonials = response.data || [];

      // Sort testimonials
      switch (sortBy) {
        case 'newest':
          fetchedTestimonials.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'oldest':
          fetchedTestimonials.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case 'most-liked':
          fetchedTestimonials.sort((a, b) => b.likes - a.likes);
          break;
      }

      setTestimonials(fetchedTestimonials);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load testimonials',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [onlyMyTestimonials, selectedTag, sortBy, toast]);

  useEffect(() => {
    fetchTestimonials();
    
    // Get current user ID from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUserId(user._id);
    }
  }, [fetchTestimonials]);

  const handleDelete = async (testimonialId: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      await apiCall('DELETE', `/testimonials/${testimonialId}`);
      
      toast({
        title: 'Testimonial Deleted',
        description: 'Your testimonial has been deleted successfully',
      });
      
      fetchTestimonials();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete testimonial',
        variant: 'destructive'
      });
    }
  };

  const filteredTestimonials = testimonials.filter(testimonial => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      testimonial.content.toLowerCase().includes(searchLower) ||
      testimonial.author.firstName.toLowerCase().includes(searchLower) ||
      testimonial.author.lastName.toLowerCase().includes(searchLower) ||
      testimonial.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  if (isCreating) {
    return (
      <div className="max-w-2xl mx-auto">
        <TestimonialForm
          onSuccess={() => {
            setIsCreating(false);
            fetchTestimonials();
          }}
          onCancel={() => setIsCreating(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {onlyMyTestimonials ? 'My Testimonials' : 'Farmer Testimonials'}
        </h2>
        {onlyMyTestimonials && (
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-farmer-primary hover:bg-farmer-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Share Your Story
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search testimonials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'most-liked') => setSortBy(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="most-liked">Most Liked</SelectItem>
            </SelectContent>
          </Select>

          {!onlyMyTestimonials && (
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Tags</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="harvest">Harvest</SelectItem>
                <SelectItem value="challenge">Challenge</SelectItem>
                <SelectItem value="innovation">Innovation</SelectItem>
                <SelectItem value="community">Community</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farmer-primary" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredTestimonials.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No testimonials found' : 'No testimonials yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? 'Try adjusting your search or filters'
              : onlyMyTestimonials
              ? 'Share your farming experience with the community'
              : 'Be the first to share your story'}
          </p>
          {onlyMyTestimonials && !searchTerm && (
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-farmer-primary hover:bg-farmer-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Testimonial
            </Button>
          )}
        </div>
      )}

      {/* Testimonials Grid */}
      {!isLoading && filteredTestimonials.length > 0 && (
        <div className="grid gap-6">
          {filteredTestimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial._id}
              testimonial={testimonial}
              isOwnTestimonial={testimonial.author._id === currentUserId}
              onDelete={() => handleDelete(testimonial._id)}
              onRefresh={fetchTestimonials}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TestimonialFeed;
