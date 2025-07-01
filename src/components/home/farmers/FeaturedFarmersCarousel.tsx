
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Farmer } from '@/types';
import FarmerCard from './FarmerCard';

interface FeaturedFarmersCarouselProps {
  farmers: Farmer[];
}

const FeaturedFarmersCarousel = ({ farmers }: FeaturedFarmersCarouselProps) => {
  // Limit to 20 farmers maximum
  const limitedFarmers = farmers.slice(0, 20);
  
  // Group farmers into pairs for 2 columns display (5 rows max)
  const farmerPairs = [];
  for (let i = 0; i < limitedFarmers.length; i += 2) {
    farmerPairs.push(limitedFarmers.slice(i, i + 2));
  }

  // Don't render if no farmers
  if (limitedFarmers.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">All Featured Farmers</h3>
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-4">
            {farmerPairs.map((pair, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pair.map((farmer) => (
                  <div key={farmer.id} className="w-full">
                    <FarmerCard farmer={farmer} showFeaturedBadge size="regular" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <Link to="/browse-farmers">
          <Button variant="outline" className="border-farmer-primary text-farmer-primary hover:bg-farmer-primary hover:text-white">
            View All Farmers
          </Button>
        </Link>
      </div>
    </>
  );
};

export default FeaturedFarmersCarousel;
