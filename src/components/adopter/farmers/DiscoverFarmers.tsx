
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Users, Wallet, Loader2 } from 'lucide-react';
import { useFarmerAdoptions } from '@/hooks/useFarmerAdoptions';
import { useFarmerCategories } from '@/hooks/useFarmerCategories';
import { FarmerWithAdoptionInfo } from '@/types';

const DiscoverFarmers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const { 
    farmersWithAdoptionInfo, 
    myAdoptions, 
    isLoadingFarmers, 
    adoptFarmer 
  } = useFarmerAdoptions();
  
  const { categories, isLoading: isLoadingCategories } = useFarmerCategories();

  console.log('DiscoverFarmers - farmersWithAdoptionInfo:', farmersWithAdoptionInfo);
  console.log('DiscoverFarmers - categories:', categories);

  // Get unique locations from farmers
  const uniqueLocations = useMemo(() => {
    if (!farmersWithAdoptionInfo || farmersWithAdoptionInfo.length === 0) return [];
    const locations = farmersWithAdoptionInfo.map(farmer => 
      farmer.location.split(',')[0].trim()
    );
    return [...new Set(locations)].sort();
  }, [farmersWithAdoptionInfo]);

  // Filter farmers based on search criteria
  const filteredFarmers = useMemo(() => {
    if (!farmersWithAdoptionInfo) return [];
    
    return farmersWithAdoptionInfo.filter(farmer => {
      const matchesSearch = searchTerm === '' || 
        farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLocation = locationFilter === 'all' || 
        farmer.location.toLowerCase().includes(locationFilter.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || 
        farmer.category_name === categoryFilter;
      
      return matchesSearch && matchesLocation && matchesCategory;
    });
  }, [farmersWithAdoptionInfo, searchTerm, locationFilter, categoryFilter]);

  // Check if farmer is already adopted by current user
  const isAdopted = (farmerId: number) => {
    if (!myAdoptions) return false;
    return myAdoptions.some(adoption => 
      adoption.farmer_id === farmerId && adoption.status === 'active'
    );
  };

  const handleAdoptFarmer = async (farmerId: number) => {
    await adoptFarmer(farmerId);
  };

  if (isLoadingFarmers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-farmer-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading farmers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Discover Farmers</h1>
        <p className="text-gray-600 mt-1">Find and support farmers who need your help</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Farmers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div>
        <p className="text-gray-600">
          Showing {filteredFarmers.length} farmer{filteredFarmers.length !== 1 ? 's' : ''} available for adoption
        </p>
      </div>

      {/* Farmers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFarmers.map((farmer) => (
          <FarmerCard 
            key={farmer.id} 
            farmer={farmer} 
            isAdopted={isAdopted(farmer.id)}
            onAdopt={() => handleAdoptFarmer(farmer.id)}
          />
        ))}
      </div>

      {filteredFarmers.length === 0 && !isLoadingFarmers && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No farmers found matching your criteria.</p>
          <p className="text-gray-400 mt-2">Try adjusting your filters to see more results.</p>
        </div>
      )}
    </div>
  );
};

// Separate FarmerCard component for better organization
const FarmerCard = ({ 
  farmer, 
  isAdopted, 
  onAdopt 
}: { 
  farmer: FarmerWithAdoptionInfo; 
  isAdopted: boolean;
  onAdopt: () => void;
}) => {
  const fundingProgress = (farmer.fundingraised / farmer.fundinggoal) * 100;
  const defaultImage = "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80";

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <img 
          src={farmer.image_url || defaultImage} 
          alt={farmer.name}
          className="w-full h-full object-cover rounded-t-lg"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          {farmer.category_name && (
            <Badge 
              className="text-white"
              style={{ backgroundColor: farmer.category_color || '#10b981' }}
            >
              {farmer.category_name}
            </Badge>
          )}
          {farmer.featured && (
            <Badge className="bg-yellow-500 text-white">Featured</Badge>
          )}
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{farmer.name}</CardTitle>
          {isAdopted && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Adopted
            </Badge>
          )}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="h-4 w-4 mr-1" />
          {farmer.location}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Description */}
        {farmer.description && (
          <p className="text-sm text-gray-600 line-clamp-3">{farmer.description}</p>
        )}

        {/* Crops */}
        <div>
          <div className="flex flex-wrap gap-1">
            {farmer.crops.slice(0, 3).map((crop, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                {crop}
              </Badge>
            ))}
            {farmer.crops.length > 3 && (
              <Badge variant="outline" className="text-xs bg-gray-50">
                +{farmer.crops.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Funding Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Funding Progress</span>
            <span className="text-farmer-primary font-medium">
              ${farmer.fundingraised} / ${farmer.fundinggoal}
            </span>
          </div>
          <Progress value={fundingProgress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {farmer.total_adopters} adopters
            </div>
            <span>{Math.round(fundingProgress)}% funded</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button 
            size="sm" 
            className="flex-1 bg-farmer-primary hover:bg-farmer-primary/90"
            onClick={onAdopt}
            disabled={isAdopted}
          >
            <Wallet className="mr-2 h-4 w-4" />
            {isAdopted ? 'Already Adopted' : 'Adopt Farmer'}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-farmer-primary text-farmer-primary hover:bg-farmer-primary hover:text-white"
          >
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscoverFarmers;
