import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MessageCircle, 
  Star, 
  CheckCircle,
  Calendar,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface Expert {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  specializations: string[];
  experience: number;
  consultationRate: number;
  rating: number;
  isAvailable: boolean;
  totalConsultations: number;
}

const FarmerAvailabilityAndExperts = () => {
  const queryClient = useQueryClient();
  const [isAvailable, setIsAvailable] = useState(false);

  // Fetch farmer profile with availability
  const { data: profileData } = useQuery({
    queryKey: ['farmerProfile'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/farmers/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsAvailable(response.data.data?.farmer?.isAvailable || false);
      return response.data;
    },
  });

  // Fetch available experts
  const { data: expertsData, isLoading: expertsLoading } = useQuery({
    queryKey: ['experts'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/experts?isAvailable=true&limit=6`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
  });

  const experts: Expert[] = expertsData?.data?.experts || [];

  // Update availability mutation
  const updateAvailabilityMutation = useMutation({
    mutationFn: async (available: boolean) => {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/farmers/profile/availability`,
        { isAvailable: available },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmerProfile'] });
      toast.success('Availability updated successfully');
    },
    onError: () => {
      toast.error('Failed to update availability');
      setIsAvailable(!isAvailable);
    },
  });

  const handleAvailabilityToggle = (checked: boolean) => {
    setIsAvailable(checked);
    updateAvailabilityMutation.mutate(checked);
  };

  const handleContactExpert = (expertId: string) => {
    // Navigate to messages with expert
    window.location.href = `/farmer/messages?expertId=${expertId}`;
  };

  return (
    <div className="space-y-6">
      {/* Availability Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Farm Availability</span>
            <Badge variant={isAvailable ? 'default' : 'secondary'}>
              {isAvailable ? 'Available for Adoption' : 'Not Available'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Accept new adopters
              </p>
              <p className="text-sm text-muted-foreground">
                Toggle to allow or prevent new farm adoptions
              </p>
            </div>
            <Switch
              checked={isAvailable}
              onCheckedChange={handleAvailabilityToggle}
              className="data-[state=checked]:bg-green-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Available Experts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Available Agricultural Experts
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <a href="/farmer/messages">View All</a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {expertsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : experts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No experts available at the moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {experts.map((expert) => (
                <div
                  key={expert._id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={expert.user.avatar} />
                      <AvatarFallback>
                        {expert.user.firstName[0]}
                        {expert.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">
                            {expert.user.firstName} {expert.user.lastName}
                          </h4>
                          {expert.isAvailable && (
                            <Badge variant="default" className="text-xs bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Available
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                            {expert.rating?.toFixed(1) || '0.0'}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="h-3 w-3 mr-1" />
                            {expert.totalConsultations || 0} consultations
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {expert.experience}+ yrs exp
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {expert.specializations?.slice(0, 3).map((spec, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {spec.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                        {expert.specializations?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{expert.specializations.length - 3} more
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-green-600 font-medium">
                        <DollarSign className="h-3 w-3" />
                        KES {expert.consultationRate}/hour
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleContactExpert(expert._id)}
                    className="ml-4"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Contact
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmerAvailabilityAndExperts;
