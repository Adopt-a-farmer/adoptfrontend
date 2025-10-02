
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

// Kenya counties data
const counties = [
  "All Counties", "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Nyeri", 
  "Machakos", "Kiambu", "Kakamega", "Kisii", "Uasin Gishu"
];

// Crop types
const cropTypes = [
  "All Crops", "Coffee", "Tea", "Maize", "Wheat", "Rice", 
  "Vegetables", "Fruits"
];

interface FarmerFiltersProps {
  onFilterChange: (filters: any) => void;
}

const FarmerFilters = ({ onFilterChange }: FarmerFiltersProps) => {
  const [filters, setFilters] = useState({
    county: 'all',
    cropType: 'all',
    fundingProgress: 'any',
    fundingAmount: [0, 2000] // Min and max funding in USD
  });

  const handleFilterUpdate = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      county: 'all',
      cropType: 'all',
      fundingProgress: 'any',
      fundingAmount: [0, 2000]
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Farmers</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* County Filter */}
          <div className="space-y-2">
            <Label htmlFor="county">Location</Label>
            <Select 
              onValueChange={(value) => handleFilterUpdate('county', value)}
              value={filters.county}
            >
              <SelectTrigger id="county">
                <SelectValue placeholder="Select county" />
              </SelectTrigger>
              <SelectContent>
                {counties.map((county) => (
                  <SelectItem key={county} value={county === "All Counties" ? "all" : county}>
                    {county}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Crop Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="cropType">Crop Type</Label>
            <Select 
              onValueChange={(value) => handleFilterUpdate('cropType', value)}
              value={filters.cropType}
            >
              <SelectTrigger id="cropType">
                <SelectValue placeholder="Select crop" />
              </SelectTrigger>
              <SelectContent>
                {cropTypes.map((crop) => (
                  <SelectItem key={crop} value={crop === "All Crops" ? "all" : crop}>
                    {crop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Funding Progress Filter */}
          <div className="space-y-2">
            <Label htmlFor="fundingProgress">Funding Progress</Label>
            <Select 
              onValueChange={(value) => handleFilterUpdate('fundingProgress', value)}
              value={filters.fundingProgress}
            >
              <SelectTrigger id="fundingProgress">
                <SelectValue placeholder="Select progress level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Progress</SelectItem>
                <SelectItem value="low">Low (0-30%)</SelectItem>
                <SelectItem value="medium">Medium (30-70%)</SelectItem>
                <SelectItem value="high">High (70-100%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            <Button type="submit" className="bg-farmer-primary hover:bg-farmer-primary/90">
              Apply Filters
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleReset}
              className="border-farmer-primary text-farmer-primary hover:bg-farmer-primary/10"
            >
              Reset Filters
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FarmerFilters;
