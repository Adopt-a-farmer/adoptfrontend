
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Users, Calendar, Leaf, Phone, Mail, ArrowLeft } from 'lucide-react';

// Import mock farmers data
import { farmers } from '@/data/farmers';
import FarmerUpdates from '@/components/farmers/FarmerUpdates';
import SupportFarmerForm from '@/components/farmers/SupportFarmerForm';

const FarmerDetail = () => {
  const { id } = useParams<{id: string}>();
  const [farmer, setFarmer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch farmer details
    setTimeout(() => {
      const foundFarmer = farmers.find(f => f.id === parseInt(id || '0'));
      setFarmer(foundFarmer);
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-farmer-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-gray-600">Loading farmer profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-bold mb-4">Farmer Not Found</h1>
            <p className="mb-8 text-gray-600">We couldn't find the farmer you're looking for.</p>
            <Link to="/browse-farmers">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Farmers
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const progressPercentage = Math.round((farmer.fundingRaised / farmer.fundingGoal) * 100);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative h-64 md:h-80 bg-gray-900">
          <img 
            src={farmer.image} 
            alt={farmer.name} 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
            <div className="container mx-auto">
              <Link to="/browse-farmers" className="text-white flex items-center mb-2 hover:underline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Farmers
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{farmer.name}</h1>
              <div className="flex items-center text-white mt-2">
                <MapPin className="h-5 w-5 mr-1" />
                <span>{farmer.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="updates">Updates</TabsTrigger>
                </TabsList>
                
                {/* About Tab */}
                <TabsContent value="about">
                  <Card>
                    <CardHeader>
                      <CardTitle>About {farmer.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-700">{farmer.description}</p>
                      
                      <h3 className="text-xl font-semibold mt-6">Crops & Specialties</h3>
                      <div className="flex flex-wrap gap-2">
                        {farmer.crops.map((crop: string, index: number) => (
                          <Badge key={index} variant="outline" className="bg-farmer-secondary/10 text-farmer-primary border-farmer-secondary">
                            <Leaf className="h-4 w-4 mr-1" /> {crop}
                          </Badge>
                        ))}
                      </div>
                      
                      <h3 className="text-xl font-semibold mt-6">Farming Experience</h3>
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-farmer-primary" />
                        <span>5 years of farming experience in {farmer.location}</span>
                      </div>
                      
                      <h3 className="text-xl font-semibold mt-6">Contact Information</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 mr-2 text-farmer-primary" />
                          <span>+254 712 345 678</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 mr-2 text-farmer-primary" />
                          <span>{farmer.name.toLowerCase().replace(' ', '.')}@adoptafarmer.com</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Projects Tab */}
                <TabsContent value="projects">
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="border rounded-lg p-4">
                          <h3 className="text-lg font-semibold">Irrigation System Upgrade</h3>
                          <p className="text-gray-600 my-2">
                            Implementing a drip irrigation system to improve water efficiency and crop yields during dry seasons.
                          </p>
                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Funding Progress</span>
                              <span className="font-medium">{progressPercentage}%</span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                            <div className="flex justify-between text-sm mt-1">
                              <span>${farmer.fundingRaised} raised</span>
                              <span>Goal: ${farmer.fundingGoal}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h3 className="text-lg font-semibold">Organic Certification</h3>
                          <p className="text-gray-600 my-2">
                            Working towards obtaining organic certification to access premium markets and increase product value.
                          </p>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Planning Phase
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Updates Tab */}
                <TabsContent value="updates">
                  <FarmerUpdates farmerId={farmer.id} />
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Support Sidebar */}
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Support {farmer.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Funding Progress</span>
                      <span className="font-medium">{progressPercentage}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <div className="flex justify-between text-sm mt-1">
                      <span>${farmer.fundingRaised} raised</span>
                      <span>Goal: ${farmer.fundingGoal}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-4 text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{farmer.supporters} supporters</span>
                  </div>
                  
                  <SupportFarmerForm farmer={farmer} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Share This Farmer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Help {farmer.name} reach more supporters by sharing their profile
                  </p>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1">
                      Facebook
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Twitter
                    </Button>
                    <Button variant="outline" className="flex-1">
                      WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FarmerDetail;
