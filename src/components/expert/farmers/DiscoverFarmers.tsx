import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageLoader } from '@/components/ui/loading';
import { MapPin, Users, Wallet, Loader2, Heart, Star, Phone, Mail, Calendar, MessageCircle, Eye, BookOpen, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { farmerService, FarmerProfile } from '@/services/farmer';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { FarmerAvailabilityScheduler } from './FarmerAvailabilityScheduler';

const ExpertDiscoverFarmers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [farmingTypeFilter, setFarmingTypeFilter] = useState('all');
  const [page, setPage] = useState(1);

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

  const farmers = useMemo(() => {
    return farmersResponse?.data?.farmers || [];
  }, [farmersResponse]);

  const total = farmersResponse?.data?.total || farmersResponse?.data?.pagination?.total || 0;  // Get unique locations and farming types
  const uniqueLocations = useMemo(() => {
    const locations = farmers.map(farmer => farmer.location?.county || '').filter(Boolean);
    return [...new Set(locations)].sort();
  }, [farmers]);

  const uniqueFarmingTypes = useMemo(() => {
    const types = farmers.map(farmer => {
      if (Array.isArray(farmer.farmingType)) {
        return farmer.farmingType.join(', ');
      }
      return farmer.farmingType || '';
    }).filter(Boolean);
    return [...new Set(types)].sort();
  }, [farmers]);

  // Filter farmers for client-side filtering
  const filteredFarmers = useMemo(() => {
    return farmers.filter(farmer => {
      const matchesSearch = searchTerm === '' || 
        farmer.farmName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.location?.county?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.location?.subCounty?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [farmers, searchTerm]);

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
    <div className="min-h-screen bg-gray-50 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Discover Farmers</h1>
        <p className="text-gray-600 mt-1">Connect with farmers to provide expert guidance and mentorship</p>
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
                  {uniqueLocations.map((location: string) => (
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
      <div>
        <p className="text-gray-600">
          Showing {filteredFarmers.length} of {total} farmer{total !== 1 ? 's' : ''} available for mentorship
        </p>
      </div>

      {/* Farmers Grid */}
      {filteredFarmers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFarmers.map((farmer) => (
            <ExpertFarmerCard 
              key={farmer._id} 
              farmer={farmer} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No farmers found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || locationFilter !== 'all' || farmingTypeFilter !== 'all'
              ? 'Try adjusting your search or filters' 
              : 'No farmers are currently available for mentorship'}
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

// Enhanced ExpertFarmerCard component
const ExpertFarmerCard = ({ 
  farmer
}: { 
  farmer: FarmerProfile; 
}) => {
  const { toast } = useToast();
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  
  const defaultImage = "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80";

  const formatCurrency = (amount: number, currency: string = 'KES') => {
    const locale = currency === 'KES' ? 'en-KE' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleMentorClick = () => {
    toast({
      title: "Mentorship Request",
      description: "Mentorship feature will be available soon. You can contact the farmer directly for now.",
    });
  };

  const handleContactClick = () => {
    setShowContactDialog(true);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <img 
          src={farmer.farmImages?.[0] || defaultImage} 
          alt={farmer.farmName}
          className="w-full h-full object-cover rounded-t-lg"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <Badge 
            className="text-white bg-blue-600"
          >
            {Array.isArray(farmer.farmingType) ? farmer.farmingType.join(', ') : farmer.farmingType}
          </Badge>
          {farmer.verificationStatus === 'verified' && (
            <Badge className="text-white bg-green-600">
              Verified
            </Badge>
          )}
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{farmer.farmName}</CardTitle>
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
        <p className="text-sm text-gray-600 line-clamp-3">{farmer.bio || farmer.description}</p>

        {/* Crops */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Crops:</p>
          <div className="flex flex-wrap gap-1">
            {farmer.cropTypes?.slice(0, 3).map((crop, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                {crop}
              </Badge>
            ))}
            {farmer.cropTypes && farmer.cropTypes.length > 3 && (
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
              {formatCurrency(farmer.fundingRaised || 0, 'KES')} / {formatCurrency(farmer.fundingGoal || 0, 'KES')}
            </span>
          </div>
          <Progress value={(farmer.fundingGoal > 0 ? (farmer.fundingRaised / farmer.fundingGoal) * 100 : 0)} className="h-2" />
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {farmer.adoptionStats?.currentAdoptions || 0} adopters
            </div>
            <span>{Math.round(farmer.fundingGoal > 0 ? (farmer.fundingRaised / farmer.fundingGoal) * 100 : 0)}% funded</span>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-1 text-xs text-gray-500">
          {farmer.user?.phone && (
            <div className="flex items-center">
              <Phone className="h-3 w-3 mr-1" />
              <span>{farmer.user.phone}</span>
            </div>
          )}
          <div className="flex items-center">
            <Mail className="h-3 w-3 mr-1" />
            <span>{farmer.user?.email}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button 
            size="sm" 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={handleMentorClick}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Offer Mentorship
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => setShowScheduleDialog(true)}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Visit
          </Button>
        </div>

        {/* Second Row of Action Buttons */}
        <div className="flex space-x-2">
          <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Contact {farmer.farmName}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="flex items-center space-x-4">
                  <img 
                    src={farmer.farmImages[0] || defaultImage} 
                    alt={farmer.farmName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{farmer.user?.firstName} {farmer.user?.lastName}</h3>
                    <p className="text-sm text-gray-500">{farmer.farmName}</p>
                    <p className="text-xs text-gray-400">{farmer.location?.subCounty}, {farmer.location?.county}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Contact Information:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <a href={`mailto:${farmer.user?.email}`} className="text-blue-600 hover:underline">
                        {farmer.user?.email}
                      </a>
                    </div>
                    {farmer.user?.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <a href={`tel:${farmer.user.phone}`} className="text-blue-600 hover:underline">
                          {farmer.user.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-700 mb-2">As an Expert, you can:</h4>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>• Offer agricultural expertise and mentorship</li>
                    <li>• Provide farming best practices guidance</li>
                    <li>• Help with crop management strategies</li>
                    <li>• Share knowledge on sustainable farming</li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setShowContactDialog(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Farm Visit Scheduler */}
        <FarmerAvailabilityScheduler
          open={showScheduleDialog}
          onOpenChange={setShowScheduleDialog}
          farmerId={farmer._id}
          farmerName={farmer.farmName}
          farmerLocation={`${farmer.location?.subCounty}, ${farmer.location?.county}`}
        />
      </CardContent>
    </Card>
  );
};

export default ExpertDiscoverFarmers;