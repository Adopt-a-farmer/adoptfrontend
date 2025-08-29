import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Checkbox 
} from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  MapPin, 
  Filter, 
  SlidersHorizontal,
  X,
  Users,
  Star,
  Leaf,
  Calendar
} from 'lucide-react';
import { farmerService } from '@/services/farmer';
import FarmerCard from '@/components/farmer/FarmerCard';
import { cn } from '@/lib/utils';

interface SearchFilters {
  search: string;
  location: string;
  crops: string[];
  farmingType: string;
  experience: string;
  verified: boolean;
  minFarmSize: number;
  maxFarmSize: number;
  sortBy: string;
  page: number;
  limit: number;
}

interface Farmer {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  farmName: string;
  description: string;
  location: {
    county: string;
    subCounty: string;
    village?: string;
  };
  farmSize: {
    value: number;
    unit: string;
  };
  cropTypes: string[];
  farmingType: string[];
  verificationStatus: string;
  establishedYear: number;
  media: {
    farmImages: Array<{ url: string }>;
  };
  stats: {
    totalAdopters: number;
    totalEarnings: number;
    successRate: number;
  };
}

const CROP_OPTIONS = [
  'maize', 'beans', 'rice', 'wheat', 'vegetables', 'fruits',
  'coffee', 'tea', 'sugarcane', 'cotton', 'sunflower', 'sorghum', 'millet'
];

const FARMING_TYPES = [
  'crop', 'livestock', 'mixed', 'aquaculture', 'apiary'
];

const KENYAN_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta',
  'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Meru', 'Tharaka-Nithi',
  'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga',
  'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot', 'Samburu', 'Trans-Nzoia',
  'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi', 'Baringo', 'Laikipia', 'Nakuru',
  'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma',
  'Busia', 'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira'
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'verified', label: 'Verified First' },
  { value: 'most_adopters', label: 'Most Adopters' },
  { value: 'highest_earnings', label: 'Highest Earnings' },
  { value: 'farm_size_asc', label: 'Farm Size (Small to Large)' },
  { value: 'farm_size_desc', label: 'Farm Size (Large to Small)' },
  { value: 'alphabetical', label: 'Alphabetical' }
];

const FarmerSearchAndFilter: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    location: '',
    crops: [],
    farmingType: '',
    experience: '',
    verified: false,
    minFarmSize: 0,
    maxFarmSize: 1000,
    sortBy: 'newest',
    page: 1,
    limit: 12
  });

  const [showFilters, setShowFilters] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Fetch farmers with filters
  const { data: farmersData, isLoading, error } = useQuery({
    queryKey: ['farmers', { ...filters, search: debouncedSearch }],
    queryFn: async () => {
      const queryParams = {
        search: debouncedSearch,
        location: filters.location,
        crops: filters.crops.join(','),
        farmingType: filters.farmingType,
        verified: filters.verified,
        minFarmSize: filters.minFarmSize,
        maxFarmSize: filters.maxFarmSize,
        sortBy: filters.sortBy,
        page: filters.page,
        limit: filters.limit
      };

      // Remove empty parameters
      const cleanParams = Object.fromEntries(
        Object.entries(queryParams).filter(([_, v]) => v !== '' && v !== false && v !== 0)
      );

      return await farmerService.getFarmers(cleanParams);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const farmers = useMemo(() => farmersData?.data?.farmers || [], [farmersData]);
  const totalFarmers = farmersData?.data?.total || 0;
  const totalPages = Math.ceil(totalFarmers / filters.limit);

  const handleFilterChange = (key: keyof SearchFilters, value: unknown) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : (value as number) // Reset to page 1 when other filters change
    }));
  };

  const handleCropToggle = (crop: string) => {
    const updatedCrops = filters.crops.includes(crop)
      ? filters.crops.filter(c => c !== crop)
      : [...filters.crops, crop];
    
    handleFilterChange('crops', updatedCrops);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      crops: [],
      farmingType: '',
      experience: '',
      verified: false,
      minFarmSize: 0,
      maxFarmSize: 1000,
      sortBy: 'newest',
      page: 1,
      limit: 12
    });
  };

  const activeFiltersCount = [
    filters.location,
    filters.farmingType,
    filters.verified,
    filters.crops.length > 0,
    filters.minFarmSize > 0,
    filters.maxFarmSize < 1000
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search farmers by name, farm name, or description..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
              <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Advanced Filters
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Location Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Location</Label>
              <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
                <SelectTrigger>
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select county" />
                </SelectTrigger>
                <SelectContent>
                  {KENYAN_COUNTIES.map(county => (
                    <SelectItem key={county} value={county}>
                      {county}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Farming Type Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Farming Type</Label>
              <Select value={filters.farmingType} onValueChange={(value) => handleFilterChange('farmingType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select farming type" />
                </SelectTrigger>
                <SelectContent>
                  {FARMING_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Crop Types Filter */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Crop Types</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {CROP_OPTIONS.map(crop => (
                  <div key={crop} className="flex items-center space-x-2">
                    <Checkbox
                      id={crop}
                      checked={filters.crops.includes(crop)}
                      onCheckedChange={() => handleCropToggle(crop)}
                    />
                    <Label
                      htmlFor={crop}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {crop.charAt(0).toUpperCase() + crop.slice(1)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Farm Size Range */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Farm Size (acres)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minSize" className="text-xs text-gray-500">Minimum</Label>
                  <Input
                    id="minSize"
                    type="number"
                    min="0"
                    value={filters.minFarmSize}
                    onChange={(e) => handleFilterChange('minFarmSize', Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="maxSize" className="text-xs text-gray-500">Maximum</Label>
                  <Input
                    id="maxSize"
                    type="number"
                    min="0"
                    value={filters.maxFarmSize}
                    onChange={(e) => handleFilterChange('maxFarmSize', Number(e.target.value))}
                    placeholder="1000"
                  />
                </div>
              </div>
            </div>

            {/* Verified Only */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={filters.verified}
                onCheckedChange={(checked) => handleFilterChange('verified', checked)}
              />
              <Label htmlFor="verified" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Verified farmers only
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {isLoading ? (
            'Searching...'
          ) : (
            `Found ${totalFarmers} farmer${totalFarmers !== 1 ? 's' : ''}`
          )}
        </p>
        
        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">Active filters:</span>
            {filters.location && (
              <Badge variant="secondary" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {filters.location}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => handleFilterChange('location', '')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.farmingType && (
              <Badge variant="secondary" className="text-xs">
                <Leaf className="h-3 w-3 mr-1" />
                {filters.farmingType}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => handleFilterChange('farmingType', '')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.verified && (
              <Badge variant="secondary" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Verified
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => handleFilterChange('verified', false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.crops.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {filters.crops.length} crop{filters.crops.length !== 1 ? 's' : ''}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => handleFilterChange('crops', [])}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600">Error loading farmers. Please try again.</p>
          </CardContent>
        </Card>
      ) : farmers.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-3">
              <Users className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="text-lg font-medium">No farmers found</h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or clearing some filters.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farmers.map((farmer) => (
            <FarmerCard key={farmer._id} farmer={farmer} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            disabled={filters.page <= 1}
            onClick={() => handleFilterChange('page', filters.page - 1)}
          >
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = Math.max(1, filters.page - 2) + i;
              if (pageNum > totalPages) return null;
              
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === filters.page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange('page', pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            disabled={filters.page >= totalPages}
            onClick={() => handleFilterChange('page', filters.page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default FarmerSearchAndFilter;