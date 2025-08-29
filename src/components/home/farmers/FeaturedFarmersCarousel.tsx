
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Farmer } from '@/types';
import FarmerCard from './FarmerCard';

interface FeaturedFarmersCarouselProps {
  farmers: Farmer[];
}

const FeaturedFarmersCarousel = ({ farmers }: FeaturedFarmersCarouselProps) => {
  // Limit to 10 farmers maximum (5 columns x 2 rows)
  const limitedFarmers = farmers.slice(0, 10);
  
  // Group farmers into rows of 5 for 5 columns display
  const farmerRows = [];
  for (let i = 0; i < limitedFarmers.length; i += 5) {
    farmerRows.push(limitedFarmers.slice(i, i + 5));
  }

  // Don't render if no farmers
  if (limitedFarmers.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">All Featured Farmers</h3>
        <div className="max-w-7xl mx-auto px-4">
          <div className="space-y-4">
            {farmerRows.map((row, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {row.map((farmer, farmerIndex) => (
                  <div key={`${farmer.id || farmer._id}-${farmerIndex}`} className="w-full">
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
