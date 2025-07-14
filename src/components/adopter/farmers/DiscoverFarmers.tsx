
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MapPin, Users, Wallet, Loader2, Heart, Star } from 'lucide-react';
import { useFarmerAdoptions } from '@/hooks/useFarmerAdoptions';
import { useFarmerCategories } from '@/hooks/useFarmerCategories';
import { FarmerWithAdoptionInfo } from '@/types';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const DiscoverFarmers = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  
  const { 
    farmersWithAdoptionInfo, 
    myAdoptions, 
    isLoadingFarmers 
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

  const handleAdoptFarmer = async (farmerId: number, contributionAmount = 1000, currency = 'KES') => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to adopt a farmer",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Initialize Paystack payment
      const { data, error } = await supabase.functions.invoke('create-paystack-payment', {
        body: {
          amount: contributionAmount,
          farmerId: farmerId,
          email: user.email,
          currency: currency
        }
      });

      if (error) throw error;

      // Open Paystack checkout in new tab
      window.open(data.authorization_url, '_blank');
      
      toast({
        title: "Payment Initiated",
        description: "Complete your payment to adopt this farmer. The page will open in a new tab.",
      });
    } catch (error: any) {
      console.error('Failed to initialize payment:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
            onAdopt={(amount, currency) => handleAdoptFarmer(farmer.id, amount, currency)}
            loading={loading}
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

// Enhanced FarmerCard component with Paystack payment integration
const FarmerCard = ({ 
  farmer, 
  isAdopted, 
  onAdopt,
  loading 
}: { 
  farmer: FarmerWithAdoptionInfo; 
  isAdopted: boolean;
  onAdopt: (contributionAmount?: number, currency?: string) => void;
  loading?: boolean;
}) => {
  const [adoptionAmount, setAdoptionAmount] = useState(1000);
  const [selectedCurrency, setSelectedCurrency] = useState('KES');
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  
  const fundingProgress = (farmer.fundingraised / farmer.fundinggoal) * 100;
  const defaultImage = "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80";

  const handleAdoptClick = () => {
    onAdopt(adoptionAmount, selectedCurrency);
    setShowAdoptModal(false);
  };

  const formatCurrency = (amount: number, currency: string) => {
    const locale = currency === 'KES' ? 'en-KE' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

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
              {formatCurrency(farmer.fundingraised, 'KES')} / {formatCurrency(farmer.fundinggoal, 'KES')}
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
          {isAdopted ? (
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 bg-green-50 text-green-700 border-green-200"
              disabled
            >
              <Heart className="mr-2 h-4 w-4" />
              Already Adopted
            </Button>
          ) : (
            <Dialog open={showAdoptModal} onOpenChange={setShowAdoptModal}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  className="flex-1 bg-farmer-primary hover:bg-farmer-primary/90"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Adopt Farmer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adopt {farmer.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={farmer.image_url || defaultImage} 
                      alt={farmer.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{farmer.name}</h3>
                      <p className="text-sm text-gray-500">{farmer.location}</p>
                      {farmer.category_name && (
                        <Badge className="mt-1" style={{ backgroundColor: farmer.category_color || '#10b981' }}>
                          {farmer.category_name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contribution">Monthly Contribution</Label>
                      <Input
                        id="contribution"
                        type="number"
                        value={adoptionAmount}
                        onChange={(e) => setAdoptionAmount(parseInt(e.target.value) || 1000)}
                        min={selectedCurrency === 'USD' ? 10 : 500}
                        step={selectedCurrency === 'USD' ? 5 : 100}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KES">KES (Kenyan Shilling)</SelectItem>
                          <SelectItem value="USD">USD (US Dollar)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Recommended: {selectedCurrency === 'USD' ? 'USD 15' : 'KES 1,000'}/month. Your contribution helps with farming inputs, tools, and training.
                  </p>

                  <div className="bg-farmer-secondary/10 p-4 rounded-lg">
                    <h4 className="font-medium text-farmer-primary mb-2">Your Impact</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Direct support for {farmer.name}'s farming activities</li>
                      <li>• Regular updates on farm progress and harvests</li>
                      <li>• Option to visit the farm and meet {farmer.name}</li>
                      <li>• Contribution to sustainable agriculture in {farmer.location}</li>
                    </ul>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAdoptModal(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAdoptClick} 
                      className="bg-farmer-primary hover:bg-farmer-primary/90"
                      disabled={loading}
                    >
                      {loading ? "Processing..." : `Pay ${formatCurrency(adoptionAmount, selectedCurrency)} with Paystack`}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          <Button 
            size="sm" 
            variant="outline" 
            className="border-farmer-primary text-farmer-primary hover:bg-farmer-primary hover:text-white"
          >
            <Star className="mr-2 h-4 w-4" />
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscoverFarmers;
