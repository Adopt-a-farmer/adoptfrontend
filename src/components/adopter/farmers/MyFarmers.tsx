
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Wallet, MessageCircle, Edit, Loader2, PlusCircle, Eye } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adoptionService, Adoption } from '@/services/adoption';
import { contributionService } from '@/services/contribution';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import ContributionDialog from '@/components/payment/ContributionDialog';

const MyFarmers = () => {
  const [editingContribution, setEditingContribution] = useState<{ id: string; amount: number } | null>(null);
  const [isUpdatingContribution, setIsUpdatingContribution] = useState(false);
  const queryClient = useQueryClient();

  // Fetch adopted farmers using the actual API
  const { data: adoptedFarmersResponse, isLoading, refetch } = useQuery({
    queryKey: ['adopted-farmers'],
    queryFn: () => adoptionService.getMyAdoptions(),
  });

  // Handle the API response structure - ensure we have an array
  const adoptions = Array.isArray(adoptedFarmersResponse?.data) 
    ? adoptedFarmersResponse.data as Adoption[]
    : [];

  // Calculate stats from the actual data
  const stats = {
    adoptedFarmers: adoptions.length,
    totalContributions: adoptions.reduce((sum: number, adoption: Adoption) => 
      sum + (adoption.monthlyContribution || 0), 0),
    averageContribution: adoptions.length > 0 
      ? adoptions.reduce((sum: number, adoption: Adoption) => 
          sum + (adoption.monthlyContribution || 0), 0) / adoptions.length
      : 0
  };

  const handleUpdateContribution = async (adoptionId: string, newAmount: number) => {
    setIsUpdatingContribution(true);
    try {
      const response = await contributionService.updateMonthlyContribution(adoptionId, newAmount);
      if (response.success) {
        toast.success('Monthly contribution updated successfully!');
        setEditingContribution(null);
        // Refresh the data
        queryClient.invalidateQueries({ queryKey: ['adopted-farmers'] });
        refetch();
      } else {
        toast.error(response.message || 'Failed to update contribution');
      }
    } catch (error) {
      console.error('Failed to update contribution:', error);
      toast.error('Failed to update contribution. Please try again.');
    } finally {
      setIsUpdatingContribution(false);
    }
  };

  const handleContributionSuccess = () => {
    // Refresh the adopted farmers data to show updated contribution amounts
    queryClient.invalidateQueries({ queryKey: ['adopted-farmers'] });
    refetch();
    toast.success('Additional contribution successful!');
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
      {adoptions && adoptions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {adoptions.map((adoption) => (
            <Card key={adoption._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={adoption.farmer?.avatar || '/placeholder.svg'} 
                      alt={`${adoption.farmer?.firstName} ${adoption.farmer?.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <CardTitle className="text-lg">
                        {adoption.farmer?.firstName} {adoption.farmer?.lastName}
                      </CardTitle>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        Location Available
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-farmer-primary capitalize">{adoption.status}</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Adoption Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Contributed</p>
                    <p className="font-semibold text-gray-900">KES {adoption.totalContributed?.toLocaleString() || 0}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600">Monthly Support</p>
                      <p className="font-semibold text-gray-900">KES {adoption.monthlyContribution?.toLocaleString() || 0}</p>
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
                              defaultValue={adoption.monthlyContribution || 0}
                              onChange={(e) => setEditingContribution({ 
                                id: adoption._id, 
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
                    {format(new Date(adoption.startDate || adoption.createdAt), 'PPP')}
                  </p>
                </div>

                {/* Message */}
                {adoption.message && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-600 mb-1">Message</p>
                    <p className="text-sm text-gray-800">{adoption.message}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <ContributionDialog
                    farmerId={adoption.farmer._id}
                    farmerName={`${adoption.farmer.firstName} ${adoption.farmer.lastName}`}
                    adoptionId={adoption._id}
                    contributionType="additional"
                    buttonText="Add Funds"
                    buttonVariant="default"
                    buttonSize="sm"
                    className="flex-1 bg-farmer-primary hover:bg-farmer-primary/90"
                    onSuccess={handleContributionSuccess}
                  />
                  <Button size="sm" variant="outline" className="flex-1 border-farmer-primary text-farmer-primary hover:bg-farmer-primary hover:text-white">
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                  <Link 
                    to={`/adopter/messages?farmer=${adoption.farmer._id}`}
                    className="flex-1"
                  >
                    <Button size="sm" variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                  </Link>
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
