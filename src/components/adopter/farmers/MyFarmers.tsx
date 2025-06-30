
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Wallet } from 'lucide-react';

const MyFarmers = () => {
  // Mock data - in real app this would come from API
  const adoptedFarmers = [
    {
      id: 1,
      name: "John Kamau",
      location: "Nakuru, Kenya",
      crops: ["Maize", "Beans"],
      adoptionDate: "2024-01-15",
      totalContribution: 800,
      monthlyContribution: 50,
      nextPayment: "2024-12-15",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      progress: 75,
      lastUpdate: "New irrigation system installed successfully!",
      updateDate: "2 hours ago"
    },
    {
      id: 2,
      name: "Mary Wanjiku",
      location: "Meru, Kenya",
      crops: ["Tomatoes", "Kale"],
      adoptionDate: "2024-02-20",
      totalContribution: 1200,
      monthlyContribution: 75,
      nextPayment: "2024-12-20",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      progress: 60,
      lastUpdate: "First harvest of the season completed - 80% above target!",
      updateDate: "1 day ago"
    },
    {
      id: 3,
      name: "Peter Ochieng",
      location: "Kisumu, Kenya",
      crops: ["Fish", "Rice"],
      adoptionDate: "2024-03-10",
      totalContribution: 500,
      monthlyContribution: 40,
      nextPayment: "2024-12-10",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      progress: 45,
      lastUpdate: "Started construction of new fish ponds",
      updateDate: "3 days ago"
    }
  ];

  const totalContributions = adoptedFarmers.reduce((sum, farmer) => sum + farmer.totalContribution, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Farmers</h1>
          <p className="text-gray-600 mt-1">Manage and track your adopted farmers</p>
        </div>
        <Link to="/adopter/discover">
          <Button className="mt-4 md:mt-0 bg-farmer-primary hover:bg-farmer-primary/90">
            <Users className="mr-2 h-4 w-4" />
            Adopt New Farmer
          </Button>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-farmer-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Adopted Farmers</p>
                <p className="text-2xl font-bold text-gray-900">{adoptedFarmers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-farmer-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Contributions</p>
                <p className="text-2xl font-bold text-gray-900">${totalContributions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-farmer-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Since</p>
                <p className="text-2xl font-bold text-gray-900">Jan 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Farmers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {adoptedFarmers.map((farmer) => (
          <Card key={farmer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <img 
                    src={farmer.image} 
                    alt={farmer.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <CardTitle className="text-lg">{farmer.name}</CardTitle>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {farmer.location}
                    </div>
                  </div>
                </div>
                <Badge className="bg-farmer-primary">Active</Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Crops */}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Crops</p>
                <div className="flex flex-wrap gap-1">
                  {farmer.crops.map((crop, index) => (
                    <Badge key={index} variant="outline" className="bg-farmer-secondary/10 text-farmer-primary border-farmer-secondary">
                      {crop}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-600">Project Progress</span>
                  <span className="text-farmer-primary font-medium">{farmer.progress}%</span>
                </div>
                <Progress value={farmer.progress} className="h-2" />
              </div>

              {/* Contribution Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Contributed</p>
                  <p className="font-semibold text-gray-900">${farmer.totalContribution}</p>
                </div>
                <div>
                  <p className="text-gray-600">Monthly Support</p>
                  <p className="font-semibold text-gray-900">${farmer.monthlyContribution}</p>
                </div>
              </div>

              {/* Last Update */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-600 mb-1">Latest Update</p>
                <p className="text-sm text-gray-800">{farmer.lastUpdate}</p>
                <p className="text-xs text-gray-500 mt-1">{farmer.updateDate}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <Button size="sm" className="flex-1 bg-farmer-primary hover:bg-farmer-primary/90">
                  View Details
                </Button>
                <Button size="sm" variant="outline" className="flex-1 border-farmer-primary text-farmer-primary hover:bg-farmer-primary hover:text-white">
                  Message
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyFarmers;
