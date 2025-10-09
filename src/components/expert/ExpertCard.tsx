import { Star, Briefcase, DollarSign, MessageCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';

interface ExpertCardProps {
  expert: {
    _id: string;
    firstName: string;
    lastName: string;
    bio: string;
    specializations: string[];
    experience: number;
    hourlyRate: number;
    profilePicture?: string;
    rating?: number;
    totalReviews?: number;
    availability?: 'available' | 'busy' | 'unavailable';
  };
  onViewProfile: (expertId: string) => void;
  onMessage?: (expertId: string) => void;
}

export default function ExpertCard({ expert, onViewProfile, onMessage }: ExpertCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const truncateBio = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const getAvailabilityColor = (status?: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'unavailable':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getAvailabilityText = (status?: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'busy':
        return 'Busy';
      case 'unavailable':
        return 'Unavailable';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
      <CardContent className="pt-6 flex-1">
        {/* Header with Avatar and Status */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <Avatar className="w-16 h-16 border-2 border-primary">
              <AvatarImage 
                src={expert.profilePicture} 
                alt={`${expert.firstName} ${expert.lastName}`} 
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                {getInitials(expert.firstName, expert.lastName)}
              </AvatarFallback>
            </Avatar>
            {expert.availability && (
              <div 
                className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${getAvailabilityColor(expert.availability)}`}
                title={getAvailabilityText(expert.availability)}
              />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">
              {expert.firstName} {expert.lastName}
            </h3>
            
            {/* Rating */}
            {expert.rating && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{expert.rating.toFixed(1)}</span>
                {expert.totalReviews && (
                  <span className="text-sm text-muted-foreground">
                    ({expert.totalReviews} {expert.totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Specializations */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {expert.specializations.slice(0, 3).map((spec, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {spec}
              </Badge>
            ))}
            {expert.specializations.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{expert.specializations.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isExpanded ? expert.bio : truncateBio(expert.bio, 120)}
          </p>
          {expert.bio.length > 120 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-primary hover:underline mt-1"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Experience and Rate */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Briefcase className="w-4 h-4" />
            <span>{expert.experience} {expert.experience === 1 ? 'year' : 'years'}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span>${expert.hourlyRate}/hr</span>
          </div>
        </div>
      </CardContent>

      {/* Actions */}
      <CardFooter className="flex gap-2 pt-4 border-t">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onViewProfile(expert._id)}
        >
          <Eye className="w-4 h-4 mr-2" />
          View Profile
        </Button>
        {onMessage && (
          <Button
            variant="default"
            className="flex-1"
            onClick={() => onMessage(expert._id)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
