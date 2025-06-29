
import React from 'react';
import { useFarmers } from '@/hooks/useFarmers';
import FarmerLoadingState from './farmers/FarmerLoadingState';
import FarmerEmptyState from './farmers/FarmerEmptyState';
import CropAccordionSection from './farmers/CropAccordionSection';
import FeaturedFarmersGrid from './farmers/FeaturedFarmersGrid';

const FeaturedFarmers = () => {
  const { farmers, isLoading } = useFarmers();
  
  // Filter only featured farmers
  const featuredFarmers = farmers.filter(farmer => farmer.featured);
  
  // Group farmers by crop type for accordion
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

        {/* Crop Categories Accordion */}
        <CropAccordionSection farmersByCrop={farmersByCrop} />

        {/* Featured Farmers Compact Grid */}
        <FeaturedFarmersGrid farmers={featuredFarmers} />
      </div>
    </section>
  );
};

export default FeaturedFarmers;
