
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Farmer } from '@/types';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users, Calendar, Leaf } from 'lucide-react';
import SupportFarmerForm from '@/components/farmers/SupportFarmerForm';
import FarmerUpdates from '@/components/farmers/FarmerUpdates';

const FarmerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFarmer = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('farmers')
          .select('*')
          .eq('id', parseInt(id))
          .single();
          
        if (error) {
          console.error('Error fetching farmer:', error);
        } else {
          setFarmer(data);
        }
      } catch (error) {
        console.error('Error in fetchFarmer:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarmer();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-farmer-primary border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading farmer details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Farmer Not Found</h1>
            <p className="text-gray-600">The farmer you're looking for doesn't exist.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const fundingPercentage = (farmer.fundingraised / farmer.fundinggoal) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <Card>
              <CardContent className="p-0">
                <div className="relative h-64 md:h-80">
                  <img
                    src={farmer.image_url || 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'}
                    alt={farmer.name}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                  {farmer.featured && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-farmer-primary hover:bg-farmer-primary">Featured Farmer</Badge>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{farmer.name}</h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{farmer.location}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{farmer.description}</p>
                </div>
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
                    <h3 className="font-semibold text-gray-900 mb-2">Crops Grown</h3>
                    <div className="flex flex-wrap gap-2">
                      {farmer.crops.map((crop, index) => (
                        <Badge key={index} variant="outline" className="bg-farmer-secondary/10 text-farmer-primary border-farmer-secondary">
                          <Leaf className="h-3 w-3 mr-1" />
                          {crop}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Experience</h3>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{farmer.farming_experience_years || 'N/A'} years of farming</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Updates Section */}
            <FarmerUpdates farmerId={farmer.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Funding Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Funding Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">${farmer.fundingraised}</span>
                    <span className="text-gray-500">of ${farmer.fundinggoal} goal</span>
                  </div>
                  <Progress value={fundingPercentage} className="h-3" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{Math.round(fundingPercentage)}% funded</span>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{farmer.supporters} supporters</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Form */}
            <SupportFarmerForm farmer={farmer} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FarmerDetail;
