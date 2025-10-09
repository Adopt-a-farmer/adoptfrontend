import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Heart,
  MessageCircle,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  Send
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { apiCall } from '@/services/api';

interface Comment {
  _id: string;
  author: {
    firstName: string;
    lastName: string;
  };
  content: string;
  createdAt: string;
}

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
  comments: Comment[];
  tags?: string[];
  createdAt: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  onLike?: () => void;
  onComment?: (comment: string) => Promise<void>;
  onEdit?: () => void;
  onDelete?: () => void;
  isOwnTestimonial?: boolean;
  onRefresh?: () => void;
}

const TestimonialCard = ({
  testimonial,
  onEdit,
  onDelete,
  isOwnTestimonial,
  onRefresh
}: TestimonialCardProps) => {
  const [isLiked, setIsLiked] = useState(testimonial.hasLiked || false);
  const [likesCount, setLikesCount] = useState(testimonial.likes);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleLike = async () => {
    try {
      if (isLiked) {
        await apiCall('DELETE', `/testimonials/${testimonial._id}/like`);
        setLikesCount(prev => prev - 1);
        setIsLiked(false);
      } else {
        await apiCall('POST', `/testimonials/${testimonial._id}/like`);
        setLikesCount(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update like',
        variant: 'destructive'
      });
    }
  };

  const handleSubmitComment = async () => {
    if (!comment.trim()) return;

    setIsSubmittingComment(true);
    try {
      await apiCall('POST', `/testimonials/${testimonial._id}/comment`, {
        content: comment
      });
      
      setComment('');
      toast({
        title: 'Comment Added',
        description: 'Your comment has been added successfully',
      });
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive'
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <>
      <Card className="w-full hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${testimonial.author.firstName} ${testimonial.author.lastName}`} />
                <AvatarFallback>
                  {testimonial.author.firstName[0]}{testimonial.author.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">
                  {testimonial.author.firstName} {testimonial.author.lastName}
                </p>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Badge variant="outline" className="text-xs">
                    {testimonial.author.role}
                  </Badge>
                  <span>•</span>
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(testimonial.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {isOwnTestimonial && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-gray-700 whitespace-pre-wrap">{testimonial.content}</p>

          {testimonial.images && testimonial.images.length > 0 && (
            <div className={`grid gap-2 ${testimonial.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'}`}>
              {testimonial.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Testimonial image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedImage(image)}
                />
              ))}
            </div>
          )}

          {testimonial.tags && testimonial.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {testimonial.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <div className="flex items-center space-x-4 w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={isLiked ? 'text-red-500' : ''}
            >
              <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {testimonial.comments.length} {testimonial.comments.length === 1 ? 'Comment' : 'Comments'}
            </Button>
          </div>

          {showComments && (
            <div className="w-full space-y-3 pt-3 border-t">
              {testimonial.comments.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {testimonial.comments.map((comment) => (
                    <div key={comment._id} className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-semibold text-sm">
                        {comment.author.firstName} {comment.author.lastName}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex space-x-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="flex-1 min-h-[60px]"
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={!comment.trim() || isSubmittingComment}
                  className="bg-farmer-primary hover:bg-farmer-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Full size"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default TestimonialCard;
