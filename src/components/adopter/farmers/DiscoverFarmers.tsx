
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Users, Wallet } from 'lucide-react';

const DiscoverFarmers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [practiceFilter, setPracticeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Mock data - in real app this would come from API
  const availableFarmers = [
    {
      id: 4,
      name: "Grace Muthoni",
      location: "Kiambu, Kenya",
      crops: ["Coffee", "Bananas"],
      practice: "Organic",
      category: "Horticulture",
      description: "Specializing in high-quality coffee and sustainable banana farming using organic methods.",
      amountNeeded: 1000,
      amountRaised: 400,
      supporters: 8,
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 5,
      name: "Samuel Kiprop",
      location: "Eldoret, Kenya",
      crops: ["Dairy Cows", "Maize"],
      practice: "Regenerative",
      category: "Livestock",
      description: "Mixed farming approach focusing on dairy production and maize cultivation with regenerative practices.",
      amountNeeded: 1500,
      amountRaised: 600,
      supporters: 12,
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 6,
      name: "Agnes Nyong'o",
      location: "Machakos, Kenya",
      crops: ["Chicken", "Vegetables"],
      practice: "Organic",
      category: "Livestock",
      description: "Free-range poultry farming combined with organic vegetable production for local markets.",
      amountNeeded: 800,
      amountRaised: 200,
      supporters: 5,
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 7,
      name: "David Otieno",
      location: "Homa Bay, Kenya",
      crops: ["Tilapia", "Catfish"],
      practice: "Sustainable",
      category: "Aquaculture",
      description: "Sustainable fish farming focusing on tilapia and catfish production for regional distribution.",
      amountNeeded: 1200,
      amountRaised: 950,
      supporters: 18,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 8,
      name: "Ruth Wambui",
      location: "Nyeri, Kenya",
      crops: ["Tea", "Potatoes"],
      practice: "Organic",
      category: "Horticulture",
      description: "Small-scale tea farming and potato cultivation using traditional organic farming methods.",
      amountNeeded: 900,
      amountRaised: 300,
      supporters: 7,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    }
  ];

  const filteredFarmers = availableFarmers.filter(farmer => {
    return (
      farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (locationFilter === '' || farmer.location.includes(locationFilter)) &&
      (practiceFilter === '' || farmer.practice === practiceFilter) &&
      (categoryFilter === '' || farmer.category === categoryFilter)
    );
  });

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Locations</SelectItem>
                  <SelectItem value="Kiambu">Kiambu</SelectItem>
                  <SelectItem value="Eldoret">Eldoret</SelectItem>
                  <SelectItem value="Machakos">Machakos</SelectItem>
                  <SelectItem value="Nyeri">Nyeri</SelectItem>
                  <SelectItem value="Homa Bay">Homa Bay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={practiceFilter} onValueChange={setPracticeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Practice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Practices</SelectItem>
                  <SelectItem value="Organic">Organic</SelectItem>
                  <SelectItem value="Regenerative">Regenerative</SelectItem>
                  <SelectItem value="Sustainable">Sustainable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="Horticulture">Horticulture</SelectItem>
                  <SelectItem value="Livestock">Livestock</SelectItem>
                  <SelectItem value="Aquaculture">Aquaculture</SelectItem>
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
          <Card key={farmer.id} className="hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              <img 
                src={farmer.image} 
                alt={farmer.name}
                className="w-full h-full object-cover rounded-t-lg"
              />
              <div className="absolute top-4 right-4">
                <Badge className="bg-farmer-primary">{farmer.practice}</Badge>
              </div>
            </div>
            
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{farmer.name}</CardTitle>
                <Badge variant="outline" className="bg-farmer-secondary/10 text-farmer-primary border-farmer-secondary">
                  {farmer.category}
                </Badge>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                {farmer.location}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-3">{farmer.description}</p>

              {/* Crops */}
              <div>
                <div className="flex flex-wrap gap-1">
                  {farmer.crops.map((crop, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                      {crop}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Funding Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Funding Progress</span>
                  <span className="text-farmer-primary font-medium">
                    ${farmer.amountRaised} / ${farmer.amountNeeded}
                  </span>
                </div>
                <Progress value={(farmer.amountRaised / farmer.amountNeeded) * 100} className="h-2" />
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {farmer.supporters} supporters
                  </div>
                  <span>{Math.round((farmer.amountRaised / farmer.amountNeeded) * 100)}% funded</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <Button size="sm" className="flex-1 bg-farmer-primary hover:bg-farmer-primary/90">
                  <Wallet className="mr-2 h-4 w-4" />
                  Adopt Farmer
                </Button>
                <Button size="sm" variant="outline" className="border-farmer-primary text-farmer-primary hover:bg-farmer-primary hover:text-white">
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFarmers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No farmers found matching your criteria.</p>
          <p className="text-gray-400 mt-2">Try adjusting your filters to see more results.</p>
        </div>
      )}
    </div>
  );
};

export default DiscoverFarmers;
