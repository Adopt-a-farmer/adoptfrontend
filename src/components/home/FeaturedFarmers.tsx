
import React, { useState } from 'react';
import { useFarmers } from '@/hooks/useFarmers';
import FarmerLoadingState from './farmers/FarmerLoadingState';
import FarmerEmptyState from './farmers/FarmerEmptyState';
import CropCategoriesGrid from './farmers/CropCategoriesGrid';
import FeaturedFarmersCarousel from './farmers/FeaturedFarmersCarousel';
import FarmerCard from './farmers/FarmerCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const FeaturedFarmers = () => {
  const { farmers, isLoading } = useFarmers();
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  
  // Filter only featured farmers
  const featuredFarmers = farmers.filter(farmer => farmer.featured);
  
  // Group farmers by crop type for categories
  const farmersByCrop = React.useMemo(() => {
    const cropGroups: { [key: string]: typeof featuredFarmers } = {};
    
    featuredFarmers.forEach(farmer => {
      farmer.crops.forEach(crop => {
        const cropKey = crop.trim();
        if (!cropGroups[cropKey]) {
          cropGroups[cropKey] = [];
        }
        if (!cropGroups[cropKey].find(f => f.id === farmer.id)) {
          cropGroups[cropKey].push(farmer);
        }
      });
    });
    
    return cropGroups;
  }, [featuredFarmers]);

  const handleCropSelect = (crop: string) => {
    setSelectedCrop(crop);
  };

  const handleBackToAll = () => {
    setSelectedCrop(null);
  };

  if (isLoading) {
    return <FarmerLoadingState />;
  }

  if (featuredFarmers.length === 0) {
    return <FarmerEmptyState />;
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Featured Farmers</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Meet some of our farmers who are looking for support to grow their agricultural businesses
          </p>
        </div>

        {selectedCrop ? (
          // Show farmers for selected crop
          <div>
            <div className="mb-6 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={handleBackToAll}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to All Categories
              </Button>
              <h3 className="text-xl font-semibold text-gray-900">{selectedCrop} Farmers</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-6xl mx-auto">
              {farmersByCrop[selectedCrop]?.map((farmer) => (
                <FarmerCard key={farmer.id} farmer={farmer} size="small" />
              ))}
            </div>
          </div>
        ) : (
          // Show crop categories and featured farmers carousel
          <>
            {/* Crop Categories Grid */}
            <CropCategoriesGrid 
              farmersByCrop={farmersByCrop} 
              onCropSelect={handleCropSelect}
            />

            {/* Featured Farmers Carousel */}
            <FeaturedFarmersCarousel farmers={featuredFarmers} />
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedFarmers;
