
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Wallet, MessageCircle, Edit, Loader2 } from 'lucide-react';
import { useAdopterDashboard } from '@/hooks/useAdopterDashboard';
import { formatDistanceToNow, format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MyFarmers = () => {
  const { adoptedFarmers, stats, updateContribution, isUpdatingContribution, isLoading } = useAdopterDashboard();
  const [editingContribution, setEditingContribution] = useState<{ id: string; amount: number } | null>(null);

  const handleUpdateContribution = (adoptionId: string, newAmount: number) => {
    updateContribution({ adoptionId, newAmount });
    setEditingContribution(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-16 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
                <p className="text-2xl font-bold text-gray-900">{stats?.adoptedFarmers || 0}</p>
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
                <p className="text-2xl font-bold text-gray-900">KES {stats?.totalContributions?.toLocaleString() || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-farmer-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Monthly</p>
                <p className="text-2xl font-bold text-gray-900">KES {Math.round(stats?.averageContribution || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Farmers List */}
      {adoptedFarmers && adoptedFarmers.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {adoptedFarmers.map((farmer) => (
            <Card key={farmer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={farmer.farmer_image} 
                      alt={farmer.farmer_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <CardTitle className="text-lg">{farmer.farmer_name}</CardTitle>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {farmer.farmer_location}
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-farmer-primary capitalize">{farmer.status}</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Crops */}
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Crops</p>
                  <div className="flex flex-wrap gap-1">
                    {farmer.farmer_crops.map((crop, index) => (
                      <Badge key={index} variant="outline" className="bg-farmer-secondary/10 text-farmer-primary border-farmer-secondary">
                        {crop}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Adoption Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Contributed</p>
                    <p className="font-semibold text-gray-900">KES {farmer.total_contributed.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600">Monthly Support</p>
                      <p className="font-semibold text-gray-900">KES {farmer.monthly_contribution.toLocaleString()}</p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="p-1 h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Monthly Contribution</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div>
                            <Label htmlFor="amount">Monthly Amount (KES)</Label>
                            <Input
                              id="amount"
                              type="number"
                              defaultValue={farmer.monthly_contribution}
                              onChange={(e) => setEditingContribution({ 
                                id: farmer.id, 
                                amount: parseInt(e.target.value) || 0 
                              })}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              onClick={() => editingContribution && handleUpdateContribution(editingContribution.id, editingContribution.amount)}
                              disabled={isUpdatingContribution}
                            >
                              {isUpdatingContribution && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Update
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Adoption Date */}
                <div className="text-sm">
                  <p className="text-gray-600">Adopted on</p>
                  <p className="font-semibold text-gray-900">
                    {format(new Date(farmer.adoption_date), 'PPP')}
                  </p>
                </div>

                {/* Last Update */}
                {farmer.last_update && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-600 mb-1">Latest Update</p>
                    <p className="text-sm text-gray-800">{farmer.last_update.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(farmer.last_update.created_at), { addSuffix: true })}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <Button size="sm" className="flex-1 bg-farmer-primary hover:bg-farmer-primary/90">
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-farmer-primary text-farmer-primary hover:bg-farmer-primary hover:text-white">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No adopted farmers yet</h3>
          <p className="text-gray-500 mb-6">Start your journey by adopting your first farmer</p>
          <Link to="/adopter/discover">
            <Button className="bg-farmer-primary hover:bg-farmer-primary/90">
              <Users className="mr-2 h-4 w-4" />
              Discover Farmers
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyFarmers;
