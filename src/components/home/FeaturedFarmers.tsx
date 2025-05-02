
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { MapPin, Users, Leaf } from 'lucide-react';

// Mock data for featured farmers
const featuredFarmers = [
  {
    id: 1,
    name: "John Kamau",
    location: "Nyeri County",
    image: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    description: "Coffee farmer with 5 years experience seeking support for irrigation system",
    fundingGoal: 1200,
    fundingRaised: 850,
    supporters: 12,
    crops: ["Coffee", "Maize"],
    featured: true
  },
  {
    id: 2,
    name: "Sarah Wanjiku",
    location: "Nakuru County",
    image: "https://images.unsplash.com/photo-1508440767412-59ce0b206bbc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    description: "Vegetable farmer specializing in organic farming practices and local market sales",
    fundingGoal: 800,
    fundingRaised: 720,
    supporters: 8,
    crops: ["Kale", "Tomatoes", "Onions"],
    featured: true
  },
  {
    id: 3,
    name: "David Ochieng",
    location: "Kisumu County",
    image: "https://images.unsplash.com/photo-1536657464919-892534f79d9f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    description: "Fish farmer looking for support to expand pond system and increase production",
    fundingGoal: 1500,
    fundingRaised: 520,
    supporters: 5,
    crops: ["Tilapia", "Catfish"],
    featured: true
  },
  {
    id: 4,
    name: "Grace Mutua",
    location: "Machakos County",
    image: "https://images.unsplash.com/photo-1569072712109-6206fa3505b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    description: "Poultry farmer seeking support for sustainable free-range egg production",
    fundingGoal: 1000,
    fundingRaised: 300,
    supporters: 3,
    crops: ["Eggs", "Poultry"],
    featured: true
  }
];

const FeaturedFarmers = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Featured Farmers</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Meet some of our farmers who are looking for support to grow their agricultural businesses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredFarmers.map((farmer) => (
            <Card key={farmer.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-48">
                <img 
                  src={farmer.image} 
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
                    {farmer.location}
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
                <p className="text-gray-600 text-sm">{farmer.description}</p>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Funding Progress</span>
                    <span className="font-medium">{Math.round((farmer.fundingRaised / farmer.fundingGoal) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-farmer-primary h-2 rounded-full" 
                      style={{ width: `${(farmer.fundingRaised / farmer.fundingGoal) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>${farmer.fundingRaised} raised</span>
                    <span>Goal: ${farmer.fundingGoal}</span>
                  </div>
                </div>
                
                <div className="flex items-center mt-4 text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{farmer.supporters} supporters</span>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0">
                <Link to={`/farmers/${farmer.id}`} className="w-full">
                  <Button className="w-full bg-farmer-primary hover:bg-farmer-primary/90">
                    View Profile
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
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
