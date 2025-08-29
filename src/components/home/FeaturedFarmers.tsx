
import React, { useState, useEffect } from 'react';
import { farmerService } from '@/services/farmer';
import FarmerLoadingState from './farmers/FarmerLoadingState';
import FarmerEmptyState from './farmers/FarmerEmptyState';
import CropCategoriesGrid from './farmers/CropCategoriesGrid';
import FeaturedFarmersCarousel from './farmers/FeaturedFarmersCarousel';
import FarmerCard from './farmers/FarmerCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Farmer } from '@/types';

import { FarmerProfile } from '@/services/farmer';

const FeaturedFarmers = () => {
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  
  // Fetch farmers on component mount
  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        console.log('[FEATURED FARMERS] Starting to fetch farmers...');
        setIsLoading(true);
        setError(null);
        
        const response = await farmerService.getFarmers({ 
          limit: 20, 
          page: 1 
        });
        
        console.log('[FEATURED FARMERS] Farmers fetch response:', response);
        
        if (response?.data?.farmers) {
          const fetchedFarmers = response.data.farmers;
          console.log('[FEATURED FARMERS] Successfully fetched farmers:', fetchedFarmers.length);
          setFarmers(fetchedFarmers);
        } else {
          console.warn('[FEATURED FARMERS] No farmers data in response');
          setFarmers([]);
        }
      } catch (error: unknown) {
        console.error('[FEATURED FARMERS] Error fetching farmers:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch farmers');
        setFarmers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarmers();
  }, []);
  
  // Transform farmers data to match expected format
  const transformedFarmers = React.useMemo(() => {
    return farmers.map((farmer: FarmerProfile) => ({
      id: parseInt(farmer._id) || Math.floor(Math.random() * 1000),
      name: farmer.farmName || 'Unknown Farmer',
      location: farmer.location ? 
        `${farmer.location.city || ''}, ${farmer.location.state || ''}`.replace(/^,\s*|,\s*$/g, '') : 
        'Location not specified',
      description: farmer.bio || 'A dedicated farmer committed to sustainable agriculture and quality produce.',
      crops: farmer.farmingType || ['Mixed farming'],
      farming_experience_years: farmer.establishedYear ? 
        new Date().getFullYear() - farmer.establishedYear : 0,
      fundinggoal: 25000, // Default value
      fundingraised: farmer.statistics?.totalAdoptions ? farmer.statistics.totalAdoptions * 500 : Math.floor(Math.random() * 15000),
      supporters: farmer.statistics?.totalAdoptions || Math.floor(Math.random() * 50),
      featured: farmer.verificationStatus === 'verified',
      image_url: farmer.farmImages?.[0] || 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      user_id: farmer.user || null,
      category_id: null,
      created_at: farmer.createdAt || new Date().toISOString(),
      updated_at: farmer.updatedAt || new Date().toISOString()
    }));
  }, [farmers]);

  console.log('[FEATURED FARMERS] Transformed farmers:', transformedFarmers);
  
  // Group farmers by crop type for categories
  const farmersByCrop = React.useMemo(() => {
    const cropGroups: { [key: string]: Farmer[] } = {};
    
    transformedFarmers.forEach(farmer => {
      farmer.crops.forEach((crop: string) => {
        const cropKey = crop.trim();
        if (!cropGroups[cropKey]) {
          cropGroups[cropKey] = [];
        }
        if (!cropGroups[cropKey].find(f => f.id === farmer.id)) {
          cropGroups[cropKey].push(farmer);
        }
      });
    });
    
    console.log('[FEATURED FARMERS] Farmers grouped by crop:', cropGroups);
    return cropGroups;
  }, [transformedFarmers]);

  const handleCropSelect = (crop: string) => {
    console.log('[FEATURED FARMERS] Crop selected:', crop);
    setSelectedCrop(crop);
  };

  const handleBackToAll = () => {
    console.log('[FEATURED FARMERS] Going back to all categories');
    setSelectedCrop(null);
  };

  if (isLoading) {
    console.log('[FEATURED FARMERS] Showing loading state');
    return <FarmerLoadingState />;
  }

  if (error) {
    console.error('[FEATURED FARMERS] Showing error state:', error);
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Farmers</h2>
          <p className="text-red-600">Error loading farmers: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-farmer-primary text-white rounded hover:bg-farmer-primary/90"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (transformedFarmers.length === 0) {
    console.log('[FEATURED FARMERS] Showing empty state');
    return <FarmerEmptyState />;
  }

  console.log('[FEATURED FARMERS] Rendering farmers section with', transformedFarmers.length, 'farmers');

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
              {farmersByCrop[selectedCrop]?.map((farmer, index) => (
                <FarmerCard key={`${farmer.id}-${index}`} farmer={farmer} size="small" />
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
            <FeaturedFarmersCarousel farmers={transformedFarmers} />
            
            {/* Browse All Farmers Button */}
            <div className="text-center mt-12">
              <Link to="/browse-farmers">
                <Button 
                  size="lg" 
                  className="bg-farmer-primary hover:bg-farmer-primary/90 text-white px-8 py-3 rounded-lg font-semibold"
                >
                  Browse All Farmers
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="mt-3 text-gray-600">
                Discover more farmers and find the perfect match for your adoption journey
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedFarmers;
