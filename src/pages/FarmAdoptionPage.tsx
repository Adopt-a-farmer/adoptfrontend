import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Star,
  CheckCircle,
  Leaf,
  Heart,
  MessageCircle,
  Share2
} from 'lucide-react';
import { farmerService } from '@/services/farmer';
import { Farmer } from '@/types/api';
import PaymentForm from '@/components/payment/PaymentForm';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const FarmAdoptionPage: React.FC = () => {
  const { id: farmerId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch farmer details
  const { data: farmerData, isLoading, error } = useQuery({
    queryKey: ['farmer', farmerId],
    queryFn: async () => {
      if (!farmerId) throw new Error('Farmer ID is required');
      return await farmerService.getFarmer(farmerId);
    },
    enabled: !!farmerId,
  });

  const farmer = (farmerData as { data?: { farmer?: Farmer } })?.data?.farmer;

  const handlePaymentSuccess = (paymentData: { reference: string; paymentUrl: string }) => {
    toast({
      title: "Payment Initiated",
      description: "Redirecting to payment gateway...",
    });
    // Navigation will happen in PaymentForm component
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleContactFarmer = () => {
    // Navigate to messaging or contact form
    navigate(`/farmers/${farmerId}/contact`);
  };

  const handleShareFarm = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Adopt ${farmer?.farmName} - Farm Adoption Platform`,
          text: `Support ${farmer?.user?.firstName}'s farm through our adoption program`,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Farm link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Share Failed",
        description: "Could not share farm link",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !farmer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Farm Not Found</h2>
                <p className="text-gray-600 mb-6">
                  The farm you're looking for could not be found or is not available for adoption.
                </p>
                <Button onClick={() => navigate('/browse-farmers')}>
                  Browse Other Farms
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const farmerName = `${farmer.user?.firstName} ${farmer.user?.lastName}`;
  const locationText = `${farmer.location?.subCounty}, ${farmer.location?.county}`;
  const establishedYears = new Date().getFullYear() - (farmer.establishedYear || 2020);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Farmers
          </Button>

          {/* Hero Section */}
          <div className="mb-8">
            <div className="relative h-64 md:h-80 bg-gradient-to-r from-green-600 to-green-700 rounded-lg overflow-hidden">
              {farmer.media?.farmImages?.[0] && (
                <img
                  src={farmer.media.farmImages[0].url}
                  alt={farmer.farmName}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex items-end">
                <div className="p-6 text-white">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16 border-2 border-white">
                      <AvatarImage src={farmer.user?.avatar} alt={farmerName} />
                      <AvatarFallback className="text-lg">
                        {farmer.user?.firstName?.[0]}{farmer.user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        {farmer.farmName}
                      </h1>
                      <p className="text-lg text-green-100">
                        by {farmerName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{locationText}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{establishedYears} years experience</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Leaf className="h-4 w-4" />
                      <span>{farmer.farmSize?.value || 0} {farmer.farmSize?.unit || 'acres'}</span>
                    </div>
                    {farmer.verificationStatus === 'verified' && (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons Overlay */}
              <div className="absolute top-6 right-6 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleShareFarm}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleContactFarmer}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="packages">Packages</TabsTrigger>
                  <TabsTrigger value="updates">Updates</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Farm Description */}
                  <Card>
                    <CardHeader>
                      <CardTitle>About This Farm</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 leading-relaxed">
                        {farmer.description || farmer.bio || 'No description available'}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Farm Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Farm Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Farming Type</h4>
                          <div className="flex flex-wrap gap-2">
                            {farmer.farmingType?.map((type, index) => (
                              <Badge key={index} variant="outline">
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Crops Grown</h4>
                          <div className="flex flex-wrap gap-2">
                            {farmer.cropTypes?.map((crop, index) => (
                              <Badge key={index} variant="secondary">
                                {crop.charAt(0).toUpperCase() + crop.slice(1)}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Farm Size</h4>
                          <p className="text-lg font-semibold text-green-600">
                            {farmer.farmSize?.value || 0} {farmer.farmSize?.unit || 'acres'}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Experience</h4>
                          <p className="text-lg font-semibold text-green-600">
                            {establishedYears} years
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Farm Images */}
                  {farmer.media?.farmImages && farmer.media.farmImages.length > 1 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Farm Gallery</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {farmer.media.farmImages.slice(1).map((image, index) => (
                            <div key={index} className="aspect-square overflow-hidden rounded-lg">
                              <img
                                src={image.url}
                                alt={`${farmer.farmName} - Image ${index + 2}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="packages">
                  {farmer.adoptionPackages && farmer.adoptionPackages.length > 0 ? (
                    <div className="space-y-4">
                      {farmer.adoptionPackages.map((pkg, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle>{pkg.title || pkg.name}</CardTitle>
                              <Badge variant="outline">{pkg.type || 'Standard'}</Badge>
                            </div>
                            <CardDescription>{pkg.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-green-600">
                                  KES {pkg.price.toLocaleString()}
                                </span>
                                <span className="text-gray-600">
                                  {pkg.duration} months
                                </span>
                              </div>
                              
                              {pkg.benefits && pkg.benefits.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Benefits:</h4>
                                  <ul className="space-y-1">
                                    {pkg.benefits.map((benefit, i) => (
                                      <li key={i} className="flex items-center gap-2 text-sm">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        {benefit}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No Packages Available
                        </h3>
                        <p className="text-gray-600">
                          This farmer hasn't set up adoption packages yet. Check back soon!
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="updates">
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Updates Yet
                      </h3>
                      <p className="text-gray-600">
                        Farm updates will appear here once you adopt this farm.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews">
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Reviews Yet
                      </h3>
                      <p className="text-gray-600">
                        Be the first to adopt and review this farm!
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Adoption Form */}
            <div className="space-y-6">
              {/* Farm Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Farm Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Adopters</span>
                    <span className="font-semibold">
                      {farmer.statistics?.activeAdoptions || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-semibold text-green-600">
                      {Math.round(farmer.statistics?.rating * 20 || 95)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Projects Completed</span>
                    <span className="font-semibold">
                      {farmer.statistics?.completedProjects || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Adoption Form */}
              {farmer.adoptionPackages && farmer.adoptionPackages.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Adopt This Farm
                    </CardTitle>
                    <CardDescription>
                      Choose a package and support {farmerName}'s agricultural journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PaymentForm
                      farmerId={farmerId!}
                      farmerName={farmerName}
                      adoptionPackages={farmer.adoptionPackages?.map(pkg => ({
                        id: pkg._id,
                        type: pkg.type || pkg.name,
                        title: pkg.title || pkg.name,
                        description: pkg.description,
                        price: pkg.price,
                        duration: pkg.duration,
                        benefits: pkg.benefits || [],
                        deliverables: pkg.deliverables || []
                      })) || []}
                      onSuccess={handlePaymentSuccess}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Farmer</CardTitle>
                    <CardDescription>
                      Get in touch with {farmerName} for custom adoption options
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      onClick={handleContactFarmer}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact {farmer.user?.firstName}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FarmAdoptionPage;