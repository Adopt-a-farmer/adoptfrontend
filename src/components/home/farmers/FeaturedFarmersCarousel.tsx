
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Farmer } from '@/types';
import FarmerCard from './FarmerCard';

interface FeaturedFarmersCarouselProps {
  farmers: Farmer[];
}

const FeaturedFarmersCarousel = ({ farmers }: FeaturedFarmersCarouselProps) => {
  // Group farmers into chunks of 10 for 2 rows of 5 each
  const farmerGroups = [];
  for (let i = 0; i < farmers.length; i += 10) {
    farmerGroups.push(farmers.slice(i, i + 10));
  }

  return (
    <>
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">All Featured Farmers</h3>
        <div className="max-w-6xl mx-auto px-12">
          <Carousel className="w-full">
            <CarouselContent>
              {farmerGroups.map((group, index) => (
                <CarouselItem key={index}>
                  <div className="p-4">
                    {/* Split into 2 rows of 5 farmers each */}
                    <div className="grid grid-rows-2 gap-6">
                      {/* First row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {group.slice(0, 5).map((farmer) => (
                          <div key={farmer.id} className="max-w-sm mx-auto">
                            <FarmerCard farmer={farmer} showFeaturedBadge size="regular" />
                          </div>
                        ))}
                      </div>
                      {/* Second row */}
                      {group.length > 5 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {group.slice(5, 10).map((farmer) => (
                            <div key={farmer.id} className="max-w-sm mx-auto">
                              <FarmerCard farmer={farmer} showFeaturedBadge size="regular" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
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
