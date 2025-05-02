
import React, { useState } from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import FarmerFilters from '@/components/farmers/FarmerFilters';
import FarmersList from '@/components/farmers/FarmersList';
import { useToast } from '@/components/ui/use-toast';

// Mock data that will later be replaced with API calls
import { farmers } from '@/data/farmers';

const BrowseFarmers = () => {
  const { toast } = useToast();
  const [filteredFarmers, setFilteredFarmers] = useState(farmers);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFilterChange = (filters: any) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Filter farmers based on selected filters
      const filtered = farmers.filter(farmer => {
        // Filter by county if selected
        if (filters.county && filters.county !== 'all' && farmer.location !== filters.county) {
          return false;
        }
        
        // Filter by crop type if selected
        if (filters.cropType && filters.cropType !== 'all' && 
           !farmer.crops.some(crop => crop.toLowerCase().includes(filters.cropType.toLowerCase()))) {
          return false;
        }
        
        // Filter by funding progress if selected
        if (filters.fundingProgress && filters.fundingProgress !== 'any') {
          const progress = (farmer.fundingRaised / farmer.fundingGoal) * 100;
          if (filters.fundingProgress === 'low' && progress > 30) return false;
          if (filters.fundingProgress === 'medium' && (progress <= 30 || progress > 70)) return false;
          if (filters.fundingProgress === 'high' && progress <= 70) return false;
        }
        
        return true;
      });
      
      setFilteredFarmers(filtered);
      setIsLoading(false);
      
      toast({
        title: `${filtered.length} farmers found`,
        description: "Filters applied successfully",
      });
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-8">Browse Farmers</h1>
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
              Find and support farmers across Kenya by browsing through their profiles and agricultural projects
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-3">
                <FarmerFilters onFilterChange={handleFilterChange} />
              </div>
              <div className="lg:col-span-9">
                <FarmersList farmers={filteredFarmers} isLoading={isLoading} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BrowseFarmers;
