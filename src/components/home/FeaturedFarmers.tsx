
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { MapPin, Users, Leaf, Coffee, Wheat, TreePalm, TreeDeciduous } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useFarmers } from '@/hooks/useFarmers';

// Crop icon mapping
const getCropIcon = (crop: string) => {
  const cropLower = crop.toLowerCase();
  if (cropLower.includes('coffee')) return Coffee;
  if (cropLower.includes('tea')) return Leaf;
  if (cropLower.includes('wheat') || cropLower.includes('maize') || cropLower.includes('rice')) return Wheat;
  if (cropLower.includes('fruit') || cropLower.includes('mango') || cropLower.includes('avocado')) return TreePalm;
  return TreeDeciduous; // Default for other crops
};

const FeaturedFarmers = () => {
  const { farmers, isLoading } = useFarmers();
  
  // Filter only featured farmers
  const featuredFarmers = farmers.filter(farmer => farmer.featured);
  
  // Group farmers by crop type for accordion
  const farmersByCrop = React.useMemo(() => {
    const cropGroups: { [key: string]: typeof featuredFarmers } = {};
    
    featuredFarmers.forEach(farmer => {
      farmer.crops.forEach(crop => {
        const cropKey = crop.trim();
        if (!cropGroups[cropKey]) {
          cropGroups[cropKey] = [];
        }
        if (!cropGroups[cropKey].find(f => f.id === farmer.id)) {
          cropGroups[cropKey].push(farmer);
        }
      });
    });
    
    return cropGroups;
  }, [featuredFarmers]);

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Featured Farmers</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Meet some of our farmers who are looking for support to grow their agricultural businesses
            </p>
          </div>
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-farmer-primary border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading featured farmers...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (featuredFarmers.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Featured Farmers</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Meet some of our farmers who are looking for support to grow their agricultural businesses
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 mb-8">No featured farmers available at the moment. Check back soon!</p>
            <Link to="/browse-farmers">
              <Button variant="outline" className="border-farmer-primary text-farmer-primary hover:bg-farmer-primary hover:text-white">
                Browse All Farmers
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Featured Farmers</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Meet some of our farmers who are looking for support to grow their agricultural businesses
          </p>
        </div>

        {/* Crop Categories Accordion */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Browse by Crop Category</h3>
          <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
            {Object.entries(farmersByCrop).map(([crop, cropFarmers]) => {
              const CropIcon = getCropIcon(crop);
              return (
                <AccordionItem key={crop} value={crop} className="border rounded-lg mb-4">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <CropIcon className="h-5 w-5 text-farmer-primary" />
                      <span className="text-lg font-medium">{crop}</span>
                      <Badge variant="secondary" className="ml-2">
                        {cropFarmers.length} farmer{cropFarmers.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cropFarmers.map((farmer) => (
                        <Card key={farmer.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                          <div className="relative h-32">
                            <img 
                              src={farmer.image_url || 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'} 
                              alt={farmer.name} 
                              className="object-cover w-full h-full"
                            />
                          </div>
                          
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{farmer.name}</CardTitle>
                              <div className="flex items-center text-gray-500 text-xs">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span className="truncate max-w-[80px]">{farmer.location.split(',')[0]}</span>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pb-2">
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">{farmer.description}</p>
                            
                            <div className="mb-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span className="font-medium">{Math.round((farmer.fundingraised / farmer.fundinggoal) * 100)}%</span>
                              </div>
                              <Progress value={(farmer.fundingraised / farmer.fundinggoal) * 100} className="h-1.5" />
                              <div className="flex justify-between text-xs mt-1 text-gray-500">
                                <span>${farmer.fundingraised}</span>
                                <span>${farmer.fundinggoal}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-xs text-gray-500">
                                <Users className="h-3 w-3 mr-1" />
                                <span>{farmer.supporters} supporters</span>
                              </div>
                              <Link to={`/farmers/${farmer.id}`}>
                                <Button size="sm" className="bg-farmer-primary hover:bg-farmer-primary/90 text-xs px-3 py-1">
                                  View
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Featured Farmers Grid */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">All Featured Farmers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredFarmers.slice(0, 4).map((farmer) => (
              <Card key={farmer.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-48">
                  <img 
                    src={farmer.image_url || 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'} 
                    alt={farmer.name} 
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-farmer-primary hover:bg-farmer-primary">Featured</Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">{farmer.name}</CardTitle>
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      {farmer.location.split(',')[0]}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {farmer.crops.map((crop, index) => (
                      <Badge key={index} variant="outline" className="bg-farmer-secondary/10 text-farmer-primary border-farmer-secondary">
                        <Leaf className="h-3 w-3 mr-1" /> {crop}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <p className="text-gray-600 text-sm line-clamp-3">{farmer.description}</p>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Funding Progress</span>
                      <span className="font-medium">{Math.round((farmer.fundingraised / farmer.fundinggoal) * 100)}%</span>
                    </div>
                    <Progress value={(farmer.fundingraised / farmer.fundinggoal) * 100} className="h-2" />
                    <div className="flex justify-between text-sm mt-1">
                      <span>${farmer.fundingraised} raised</span>
                      <span>Goal: ${farmer.fundinggoal}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-4 text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{farmer.supporters} supporters</span>
                  </div>
                </CardContent>
                
                <CardContent className="pt-0">
                  <Link to={`/farmers/${farmer.id}`} className="w-full">
                    <Button className="w-full bg-farmer-primary hover:bg-farmer-primary/90">
                      View Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <Link to="/browse-farmers">
            <Button variant="outline" className="border-farmer-primary text-farmer-primary hover:bg-farmer-primary hover:text-white">
              View All Farmers
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedFarmers;
