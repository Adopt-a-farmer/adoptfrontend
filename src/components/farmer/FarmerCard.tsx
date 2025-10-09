import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Star, 
  Users, 
  DollarSign, 
  Calendar,
  CheckCircle,
  Leaf,
  Eye,
  Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

import { FarmerProfile } from '@/services/farmer';

interface FarmerCardProps {
  farmer: FarmerProfile;
  className?: string;
  showActions?: boolean;
}

const FarmerCard: React.FC<FarmerCardProps> = ({ 
  farmer, 
  className,
  showActions = true 
}) => {
  const navigate = useNavigate();

  const isVerified = farmer.verificationStatus === 'verified';
  const farmImage = farmer.farmImages?.[0];
  const fullName = farmer.farmName; // Use farmName as display name
  const locationText = `${farmer.location.subCounty}, ${farmer.location.county}`;
  const establishedYears = new Date().getFullYear() - (farmer.establishedYear || new Date().getFullYear());

  const handleViewProfile = () => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login', { state: { from: `/farmers/${farmer._id}` } });
      return;
    }
    navigate(`/farmers/${farmer._id}`);
  };

  const handleAdoptFarm = () => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login', { state: { from: `/farmers/${farmer._id}/adopt` } });
      return;
    }
    navigate(`/farmers/${farmer._id}/adopt`);
  };
  
  const handleContactFarmer = () => {
    // Redirect to login for contact farmer
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login', { state: { from: `/farmers/${farmer._id}/contact` } });
      return;
    }
    navigate(`/farmers/${farmer._id}/contact`);
  };

  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-200", className)}>
      {/* Farm Image */}
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        {farmImage ? (
          <img
            src={farmImage}
            alt={farmer.farmName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
            <Leaf className="h-16 w-16 text-green-400" />
          </div>
        )}
        
        {/* Verification Badge */}
        {isVerified && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-green-500 text-white shadow-sm">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleViewProfile}
              className="shadow-lg"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            {showActions && (
              <Button
                size="sm"
                onClick={handleAdoptFarm}
                className="shadow-lg"
              >
                <Heart className="h-4 w-4 mr-1" />
                Adopt
              </Button>
            )}
          </div>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={farmer.media?.profileImage?.url || farmer.media?.farmImages?.[0]?.url} 
                alt={fullName} 
              />
              <AvatarFallback>
                {farmer.farmName?.[0] || 'F'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg leading-tight">
                {farmer.farmName}
              </h3>
              <p className="text-sm text-gray-600">
                by {fullName}
              </p>
            </div>
          </div>
          
          {/* Success Rate */}
          {farmer.statistics?.rating && (
            <div className="flex items-center text-green-600">
              <Star className="h-4 w-4 mr-1 fill-current" />
              <span className="text-sm font-medium">
                {Math.round(farmer.statistics.rating * 20)}%
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {farmer.bio}
        </p>

        {/* Location */}
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{locationText}</span>
        </div>

        {/* Farm Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Farm Size:</span>
            <p className="font-medium">
              {farmer.farmSize?.value || 0} {farmer.farmSize?.unit || 'acres'}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Experience:</span>
            <p className="font-medium">{establishedYears} years</p>
          </div>
        </div>

        {/* Crop Types */}
        {farmer.farmingType && farmer.farmingType.length > 0 && (
          <div>
            <span className="text-xs text-gray-500 block mb-2">Crops:</span>
            <div className="flex flex-wrap gap-1">
              {farmer.farmingType.slice(0, 3).map((crop, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {crop}
                </Badge>
              ))}
              {farmer.farmingType.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{farmer.farmingType.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Farming Types */}
        {farmer.farmingType && farmer.farmingType.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {farmer.farmingType.map((type, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Badge>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-1" />
            <span>{farmer.statistics?.totalAdoptions || 0} adopters</span>
          </div>
          
          <div className="flex items-center text-sm text-green-600">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Est. {farmer.establishedYear}</span>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="space-y-2 pt-2">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleViewProfile}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-1" />
                View Profile
              </Button>
              <Button 
                size="sm" 
                onClick={handleAdoptFarm}
                className="flex-1"
              >
                <Heart className="h-4 w-4 mr-1" />
                Adopt Farm
              </Button>
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleContactFarmer}
              className="w-full"
            >
              Contact Farmer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FarmerCard;