
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { MapPin, Users, Leaf } from 'lucide-react';
import { Farmer } from '@/types';

interface FarmerCardProps {
  farmer: Farmer;
  showFeaturedBadge?: boolean;
  size?: 'small' | 'regular';
}

const FarmerCard = ({ farmer, showFeaturedBadge = false, size = 'regular' }: FarmerCardProps) => {
  const imageHeight = size === 'small' ? 'h-24' : 'h-32';
  const cardPadding = size === 'small' ? 'p-3' : 'p-3';
  const headerPadding = size === 'small' ? 'p-3 pb-2' : 'p-3 pb-2';
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className={`relative ${imageHeight}`}>
        <img 
          src={farmer.image_url || 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'} 
          alt={farmer.name} 
          className="object-cover w-full h-full"
        />
        {showFeaturedBadge && (
          <div className="absolute top-1 right-1">
            <Badge className="bg-farmer-primary hover:bg-farmer-primary text-xs">Featured</Badge>
          </div>
        )}
      </div>
      
      <CardHeader className={headerPadding}>
        <CardTitle className="text-sm font-medium leading-tight">{farmer.name}</CardTitle>
        <div className="flex items-center text-gray-500 text-xs mt-1">
          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{farmer.location.split(',')[0]}</span>
        </div>
        {showFeaturedBadge && (
          <div className="flex flex-wrap gap-1 mt-2">
            {farmer.crops.slice(0, 2).map((crop, index) => (
              <Badge key={index} variant="outline" className="bg-farmer-secondary/10 text-farmer-primary border-farmer-secondary text-xs">
                <Leaf className="h-2 w-2 mr-1" /> {crop.length > 8 ? crop.substring(0, 8) + '...' : crop}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className={`${cardPadding} pt-0`}>
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>Progress</span>
            <span className="font-medium">{Math.round((farmer.fundingraised / farmer.fundinggoal) * 100)}%</span>
          </div>
          <Progress value={(farmer.fundingraised / farmer.fundinggoal) * 100} className={size === 'small' ? 'h-1' : 'h-1.5'} />
          <div className="flex justify-between text-xs mt-1 text-gray-500">
            <span>${farmer.fundingraised}</span>
            <span>${farmer.fundinggoal}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500">
            <Users className="h-3 w-3 mr-1" />
            <span>{farmer.supporters}</span>
          </div>
          <Link to={`/farmers/${farmer.id}`}>
            <Button size="sm" className="bg-farmer-primary hover:bg-farmer-primary/90 text-xs px-2 py-1 h-6">
              View
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default FarmerCard;
