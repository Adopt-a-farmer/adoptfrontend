
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
  // Group farmers into pairs for 2-column display
  const farmerPairs = [];
  for (let i = 0; i < farmers.length; i += 2) {
    farmerPairs.push(farmers.slice(i, i + 2));
  }

  return (
    <>
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">All Featured Farmers</h3>
        <div className="max-w-6xl mx-auto px-12">
          <Carousel className="w-full">
            <CarouselContent>
              {farmerPairs.map((pair, index) => (
                <CarouselItem key={index}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                    {pair.map((farmer) => (
                      <div key={farmer.id} className="max-w-md mx-auto">
                        <FarmerCard farmer={farmer} showFeaturedBadge size="regular" />
                      </div>
                    ))}
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
