
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageLoader } from '@/components/ui/loading';
import { MapPin, Users, Wallet, Loader2, Heart, Star, Phone, Mail, Calendar, MessageCircle, Leaf } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { farmerService, FarmerProfile } from '@/services/farmer';
import { adoptionService, Adoption } from '@/services/adoption';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

// Component starts here
const DiscoverFarmers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [farmingTypeFilter, setFarmingTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [myAdoptions, setMyAdoptions] = useState<string[]>([]);

  // Fetch farmers data
  const { 
    data: farmersResponse, 
    isLoading: isLoadingFarmers,
    error: farmersError 
  } = useQuery({
    queryKey: ['farmers', page, searchTerm, locationFilter, farmingTypeFilter],
    queryFn: async () => {
      const params: Record<string, string | number | boolean> = {
        page,
        limit: 12,
        isActive: true
      };
      
      if (searchTerm) params.search = searchTerm;
      if (locationFilter !== 'all') params.location = locationFilter;
      if (farmingTypeFilter !== 'all') params.farmingType = farmingTypeFilter;
      
      return await farmerService.getFarmers(params);
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch my adoptions to check which farmers are already adopted
  const { data: adoptionsResponse } = useQuery({
    queryKey: ['my-adoptions'],
    queryFn: () => adoptionService.getMyAdoptions(),
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  useEffect(() => {
    if (adoptionsResponse?.data) {
      // Handle the actual backend response structure
      const responseData = adoptionsResponse.data as { farmersData?: { adoption: Adoption; farmerProfile: unknown }[] };
      const adoptionsArray = responseData.farmersData || [];
      
      const adoptedFarmerIds = adoptionsArray
        .filter(item => item.adoption && item.adoption.status === 'active')
        .map(item => item.adoption.farmer._id);
      setMyAdoptions(adoptedFarmerIds);
    }
  }, [adoptionsResponse]);

  const farmers = useMemo(() => {
    return farmersResponse?.data?.farmers || [];
  }, [farmersResponse]);

  const total = farmersResponse?.data?.total || 0;

  // Get unique locations and farming types
  const uniqueLocations = useMemo(() => {
    const locations = farmers.map(farmer => farmer.location?.county || '').filter(Boolean);
    return [...new Set(locations)].sort();
  }, [farmers]);

  const uniqueFarmingTypes = useMemo(() => {
    const types = farmers.flatMap(farmer => farmer.farmingType || []);
    return [...new Set(types)].sort();
  }, [farmers]);

  // Filter farmers for client-side filtering
  const filteredFarmers = useMemo(() => {
    return farmers.filter(farmer => {
      const matchesSearch = searchTerm === '' || 
        farmer.farmName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${farmer.user?.firstName || ''} ${farmer.user?.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.location?.county?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.location?.subCounty?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [farmers, searchTerm]);

  // Separate adopted and non-adopted farmers based on current user
  const { availableFarmers, adoptedFarmers } = useMemo(() => {
    const available = filteredFarmers.filter(farmer => !farmer.isAdoptedByCurrentUser);
    const adopted = filteredFarmers.filter(farmer => farmer.isAdoptedByCurrentUser);
    return { availableFarmers: available, adoptedFarmers: adopted };
  }, [filteredFarmers]);

  const handleAdoptFarmer = async (farmerId: string, contributionAmount: number, currency: string, message?: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to adopt a farmer",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await adoptionService.createAdoption({
        farmerId,
        monthlyContribution: contributionAmount,
        currency,
        message
      });
      
      if (result.success) {
        if (result.paymentUrl) {
          // Redirect to Paystack payment page
          toast({
            title: "Redirecting to Payment",
            description: "You will be redirected to complete your payment...",
          });
          
          // Wait a moment then redirect
          setTimeout(() => {
            window.location.href = result.paymentUrl!;
          }, 1500);
        } else {
          // Direct adoption without payment (if applicable)
          setMyAdoptions(prev => [...prev, farmerId]);
          
          toast({
            title: "Adoption Successful!",
            description: "You have successfully adopted this farmer. You'll receive regular updates on their progress.",
          });
        }
      } else {
        toast({
          title: "Adoption Failed",
          description: result.message || "Failed to create adoption. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error: unknown) {
      console.error('Failed to adopt farmer:', error);
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      let errorMessage = "Failed to adopt farmer. Please try again.";
      
      if (err?.response?.status === 404) {
        errorMessage = "Adoption service is currently unavailable. Please contact support.";
      } else if (err?.response?.status === 400) {
        errorMessage = err?.response?.data?.message || "Invalid adoption request.";
      }
      
      toast({
        title: "Adoption Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  if (isLoadingFarmers && page === 1) {
    return <PageLoader text="Loading farmers..." />;
  }

  if (farmersError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <p className="text-lg font-medium">Failed to load farmers</p>
          <p className="text-sm">Please check your connection and try again</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Search by name, farm, or location..."
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
              <Select value={farmingTypeFilter} onValueChange={setFarmingTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by farming type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Farming Types</SelectItem>
                  {uniqueFarmingTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-600">
            Showing {availableFarmers.length} available farmer{availableFarmers.length !== 1 ? 's' : ''} for adoption
            {adoptedFarmers.length > 0 && (
              <span className="text-gray-500"> • {adoptedFarmers.length} already adopted</span>
            )}
          </p>
        </div>
      </div>

      {/* Available Farmers Section */}
      {availableFarmers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-900">Available Farmers</h2>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {availableFarmers.length} Available
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableFarmers.map((farmer) => (
              <FarmerCard 
                key={farmer._id} 
                farmer={farmer} 
                isAdopted={false}
                onAdopt={handleAdoptFarmer}
              />
            ))}
          </div>
        </div>
      )}

      {/* Adopted Farmers Section */}
      {adoptedFarmers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-600">Already Adopted</h2>
            <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
              {adoptedFarmers.length} Adopted
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
            {adoptedFarmers.map((farmer) => (
              <FarmerCard 
                key={farmer._id} 
                farmer={farmer} 
                isAdopted={true}
                onAdopt={handleAdoptFarmer}
              />
            ))}
          </div>
        </div>
      )}

      {/* No farmers found */}
      {availableFarmers.length === 0 && adoptedFarmers.length === 0 && (
        <div className="text-center py-12">
          <Leaf className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No farmers found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or check back later for new farmers.</p>
        </div>
      )}
      {availableFarmers.length === 0 && adoptedFarmers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No farmers found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || locationFilter !== 'all' || farmingTypeFilter !== 'all'
              ? 'Try adjusting your search or filters' 
              : 'No farmers are currently available for adoption'}
          </p>
          {(searchTerm || locationFilter !== 'all' || farmingTypeFilter !== 'all') && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setLocationFilter('all');
                setFarmingTypeFilter('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || isLoadingFarmers}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 py-2 text-sm text-gray-600">
            Page {page} of {Math.ceil(total / 12)}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / 12) || isLoadingFarmers}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

// Enhanced FarmerCard component
const FarmerCard = ({ 
  farmer, 
  isAdopted, 
  onAdopt
}: { 
  farmer: FarmerProfile; 
  isAdopted: boolean;
  onAdopt: (farmerId: string, amount: number, currency: string, message?: string) => Promise<void>;
}) => {
  const [adoptionAmount, setAdoptionAmount] = useState(1000);
  const [selectedCurrency, setSelectedCurrency] = useState('KES');
  const [adoptionMessage, setAdoptionMessage] = useState('');
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fundingProgress = farmer.fundingGoal > 0 ? (farmer.fundingRaised / farmer.fundingGoal) * 100 : 0;
  const defaultImage = "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80";

  const handleAdoptClick = async () => {
    setIsProcessing(true);
    try {
      await onAdopt(farmer._id, adoptionAmount, selectedCurrency, adoptionMessage);
      setShowAdoptModal(false);
    } catch (error) {
      // Error is handled in parent component
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const locale = currency === 'KES' ? 'en-KE' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${isAdopted ? 'opacity-75 border-gray-300' : ''}`}>
      <div className="relative h-48">
        <img 
          src={farmer.media?.profileImage?.url || farmer.farmImages?.[0] || '/placeholder.svg'} 
          alt={farmer.farmName}
          className="w-full h-full object-cover rounded-t-lg"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          {isAdopted && (
            <Badge 
              className="text-white bg-orange-600"
            >
              <Heart className="h-3 w-3 mr-1" />
              Adopted
            </Badge>
          )}
          <Badge 
            className="text-white bg-green-600"
          >
            {Array.isArray(farmer.farmingType) ? farmer.farmingType.join(', ') : farmer.farmingType}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{farmer.farmName}</CardTitle>
          {isAdopted && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              <Heart className="h-3 w-3 mr-1 fill-current" />
              Adopted
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-700">
            {farmer.user?.firstName} {farmer.user?.lastName}
          </p>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-1" />
            {farmer.location?.subCounty}, {farmer.location?.county}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-3">{farmer.description}</p>

        {/* Crops */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Crops:</p>
          <div className="flex flex-wrap gap-1">
            {farmer.cropTypes.slice(0, 3).map((crop, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                {crop}
              </Badge>
            ))}
            {farmer.cropTypes.length > 3 && (
              <Badge variant="outline" className="text-xs bg-gray-50">
                +{farmer.cropTypes.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Farm Details */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Farm Size:</span>
            <p className="font-medium">{farmer.farmSize?.value} {farmer.farmSize?.unit || 'acres'}</p>
          </div>
          <div>
            <span className="text-gray-500">Experience:</span>
            <p className="font-medium">{farmer.farmingExperience} years</p>
          </div>
        </div>

        {/* Funding Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Funding Progress</span>
            <span className="text-green-600 font-medium">
              {formatCurrency(farmer.fundingRaised, 'KES')} / {formatCurrency(farmer.fundingGoal, 'KES')}
            </span>
          </div>
          <Progress value={fundingProgress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {farmer.adoptionStats?.totalAdopters || farmer.adoptionStats?.currentAdoptions || 0} adopters
            </div>
            <span>{Math.round(fundingProgress)}% funded</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          {isAdopted ? (
            <>
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1 bg-orange-50 text-orange-700 border-orange-200 cursor-not-allowed"
                disabled
              >
                <Heart className="mr-2 h-4 w-4 fill-current" />
                Already Adopted
              </Button>
              <Link to={`/adopter/messages?farmer=${farmer._id}`}>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message
                </Button>
              </Link>
            </>
          ) : (
            <Dialog open={showAdoptModal} onOpenChange={setShowAdoptModal}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Adopt Farmer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Adopt {farmer.farmName}</DialogTitle>
                  <DialogDescription>
                    Support {farmer.user.firstName} {farmer.user.lastName} with monthly contributions to help grow their farming operations and impact their community.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={farmer.media?.profileImage?.url || farmer.user?.avatar || '/placeholder.svg'} 
                      alt={farmer.farmName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{farmer.user.firstName} {farmer.user.lastName}</h3>
                      <p className="text-sm text-gray-500">{farmer.farmName}</p>
                      <p className="text-xs text-gray-400">{farmer.location.subCounty}, {farmer.location.county}</p>
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

                  <div>
                    <Label htmlFor="message">Message to Farmer (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Share why you want to support this farmer..."
                      value={adoptionMessage}
                      onChange={(e) => setAdoptionMessage(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-700 mb-2">Your Impact</h4>
                    <ul className="text-sm text-green-600 space-y-1">
                      <li>• Direct support for {farmer.user.firstName}'s farming activities</li>
                      <li>• Regular updates on farm progress and harvests</li>
                      <li>• Option to visit the farm and meet {farmer.user.firstName}</li>
                      <li>• Contribution to sustainable agriculture in {farmer.location.county}</li>
                    </ul>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAdoptModal(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAdoptClick} 
                      className="bg-green-600 hover:bg-green-700"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Adopt for ${formatCurrency(adoptionAmount, selectedCurrency)}/month`
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscoverFarmers;
