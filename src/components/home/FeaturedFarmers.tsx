
import React, { useState, useEffect } from 'react';
import { farmerService } from '@/services/farmer';
import FarmerLoadingState from './farmers/FarmerLoadingState';
import FarmerEmptyState from './farmers/FarmerEmptyState';
import CropCategoriesGrid from './farmers/CropCategoriesGrid';
import FeaturedFarmersCarousel from './farmers/FeaturedFarmersCarousel';
import FarmerCard from './farmers/FarmerCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Farmer } from '@/types';

const FeaturedFarmers = () => {
  const [farmers, setFarmers] = useState<any[]>([]);
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
      } catch (error: any) {
        console.error('[FEATURED FARMERS] Error fetching farmers:', error);
        setError(error.message || 'Failed to fetch farmers');
        setFarmers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarmers();
  }, []);
  
  // Transform farmers data to match expected format
  const transformedFarmers = React.useMemo(() => {
    return farmers.map((farmer: any) => ({
      id: parseInt(farmer._id) || Math.floor(Math.random() * 1000),
      name: farmer.user ? `${farmer.user.firstName} ${farmer.user.lastName}` : 'Unknown Farmer',
      location: farmer.location ? `${farmer.location.city || ''}, ${farmer.location.state || ''}`.trim() : 'Location not specified',
      description: farmer.description || farmer.bio || 'No description available',
      crops: farmer.crops?.map((c: any) => c.name || c) || farmer.farmingType || ['Mixed farming'],
      farming_experience_years: farmer.farmingExperience || 0,
      fundinggoal: farmer.fundingGoal || 10000,
      fundingraised: farmer.adoptionStats?.totalFunding || 0,
      supporters: farmer.adoptionStats?.totalAdoptions || 0,
      featured: true, // Treat all farmers as featured for now
      image_url: farmer.farmImages?.[0] || farmer.user?.avatar || '/placeholder.svg',
      user_id: farmer.user?._id || null,
      category_id: farmer.category?._id || null,
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
            <FeaturedFarmersCarousel farmers={transformedFarmers} />
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedFarmers;
