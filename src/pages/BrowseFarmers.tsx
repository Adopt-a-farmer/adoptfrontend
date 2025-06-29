
import React, { useState } from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import FarmersList from '@/components/farmers/FarmersList';
import FarmerFilters from '@/components/farmers/FarmerFilters';
import { useFarmers } from '@/hooks/useFarmers';

const BrowseFarmers = () => {
  const { farmers, isLoading } = useFarmers();
  const [filteredFarmers, setFilteredFarmers] = useState(farmers);

  const handleFiltersChange = (filters: any) => {
    let filtered = [...farmers];
    
    // Apply location filter
    if (filters.county && filters.county !== 'all') {
      filtered = filtered.filter(farmer => 
        farmer.location.toLowerCase().includes(filters.county.toLowerCase())
      );
    }
    
    // Apply crop filter
    if (filters.cropType && filters.cropType !== 'all') {
      filtered = filtered.filter(farmer => 
        farmer.crops.some(crop => 
          crop.toLowerCase().includes(filters.cropType.toLowerCase())
        )
      );
    }
    
    // Apply funding progress filter
    if (filters.fundingProgress && filters.fundingProgress !== 'any') {
      filtered = filtered.filter(farmer => {
        const progress = (farmer.fundingraised / farmer.fundinggoal) * 100;
        switch (filters.fundingProgress) {
          case 'low':
            return progress >= 0 && progress < 30;
          case 'medium':
            return progress >= 30 && progress < 70;
          case 'high':
            return progress >= 70 && progress <= 100;
          default:
            return true;
        }
      });
    }
    
    setFilteredFarmers(filtered);
  };

  // Update filtered farmers when farmers data changes
  React.useEffect(() => {
    setFilteredFarmers(farmers);
  }, [farmers]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Browse Our Farmers
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover and support amazing farmers from across Kenya. Each farmer has a unique story and specific needs for their agricultural journey.
          </p>
        </div>
        
        <div className="mb-8">
          <FarmerFilters onFilterChange={handleFiltersChange} />
        </div>
        
        <FarmersList farmers={filteredFarmers} isLoading={isLoading} />
      </main>
      
      <Footer />
    </div>
  );
};

export default BrowseFarmers;
