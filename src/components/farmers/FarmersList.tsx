
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Users, Leaf } from 'lucide-react';

interface Farmer {
  id: number;
  name: string;
  location: string;
  image: string;
  description: string;
  fundingGoal: number;
  fundingRaised: number;
  supporters: number;
  crops: string[];
  featured?: boolean;
}

interface FarmersListProps {
  farmers: Farmer[];
  isLoading: boolean;
}

const FarmersList = ({ farmers, isLoading }: FarmersListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-farmer-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-600">Loading farmers...</p>
        </div>
      </div>
    );
  }

  if (farmers.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <h3 className="text-2xl font-semibold mb-4">No farmers found</h3>
        <p className="text-gray-600 mb-8">Try adjusting your filters or check back later for more farmers</p>
        <img src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" 
             alt="No farmers found" 
             className="mx-auto rounded-lg max-w-md" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {farmers.map((farmer) => (
        <Card key={farmer.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
          <div className="relative h-48">
            <img 
              src={farmer.image} 
              alt={farmer.name} 
              className="object-cover w-full h-full"
            />
            {farmer.featured && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-farmer-primary hover:bg-farmer-primary">Featured</Badge>
              </div>
            )}
          </div>
          
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold">{farmer.name}</h3>
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
          
          <CardContent className="pb-2 flex-grow">
            <p className="text-gray-600 text-sm line-clamp-3">{farmer.description}</p>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Funding Progress</span>
                <span className="font-medium">{Math.round((farmer.fundingRaised / farmer.fundingGoal) * 100)}%</span>
              </div>
              <Progress value={(farmer.fundingRaised / farmer.fundingGoal) * 100} className="h-2" />
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
          
          <CardFooter className="pt-0 mt-auto">
            <Link to={`/farmers/${farmer.id}`} className="w-full">
              <Button className="w-full bg-farmer-primary hover:bg-farmer-primary/90">
                View Profile
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default FarmersList;
