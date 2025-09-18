
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Users, CheckCircle, Clock, AlertCircle, Eye, MapPin } from 'lucide-react';
import { adminService, FarmerProfile } from '@/services/admin';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

const FarmersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerProfile | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { toast } = useToast();
  
  // Fetch farmers data using admin service
  const { data: farmersData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-farmers', currentPage, searchTerm, statusFilter],
    queryFn: () => adminService.getAllFarmers({
      page: currentPage,
      limit: 20,
      search: searchTerm || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined
    }),
    keepPreviousData: true
  });

  // Fetch dashboard stats for better counts
  const { data: dashboardStats } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => adminService.getDashboardStats(),
  });

  const farmers = Array.isArray(farmersData?.data) ? farmersData.data : [];
  const totalPages = farmersData?.totalPages || 1;

  const handleViewFarmer = async (farmerId: string) => {
    try {
      const response = await adminService.getFarmerById(farmerId);
      setSelectedFarmer(response.data.farmer);
      setShowDetailModal(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load farmer details',
        variant: 'destructive',
      });
    }
  };

  const handleVerifyFarmer = async (farmerId: string, status: string) => {
    try {
      await adminService.verifyFarmer(farmerId, { status });
      refetch();
      toast({
        title: 'Success',
        description: `Farmer ${status === 'verified' ? 'verified' : 'rejected'} successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update farmer status',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Farmers Management</h1>
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Farmers</h3>
            <p className="text-muted-foreground mb-4">
              Unable to load farmer data. Please try again.
            </p>
            <Button onClick={() => refetch()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Farmers Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.farmers?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Verified farmers only</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.farmers?.verified || 0}</div>
            <p className="text-xs text-muted-foreground">Verified farmers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.farmers?.pending || 0}</div>
            <p className="text-xs text-muted-foreground">Pending verification</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.farmers?.rejected || 0}</div>
            <p className="text-xs text-muted-foreground">Rejected applications</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Farmers</CardTitle>
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search farmers..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-60 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : farmers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Farmers Found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'No farmers match your search criteria.' : 'No farmers have registered yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {farmers.map((farmer) => (
                <Card key={farmer._id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Users className="h-8 w-8 text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{farmer.farmName}</h3>
                            <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                              farmer.verificationStatus === 'verified'
                                ? 'bg-green-100 text-green-800'
                                : farmer.verificationStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {farmer.verificationStatus.charAt(0).toUpperCase() + farmer.verificationStatus.slice(1)}
                            </span>
                            {!farmer.isActive && (
                              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <p><strong>Owner:</strong> {farmer.user?.firstName} {farmer.user?.lastName}</p>
                              <p><strong>Email:</strong> {farmer.user?.email}</p>
                              <p><strong>Phone:</strong> {farmer.user?.phone || 'Not provided'}</p>
                            </div>
                            <div>
                              <p><strong>Location:</strong> {farmer.location?.village ? `${farmer.location.village}, ` : ''}{farmer.location?.subCounty}, {farmer.location?.county}</p>
                              <p><strong>Farm Size:</strong> {farmer.farmSize?.value} {farmer.farmSize?.unit}</p>
                              <p><strong>Farming Type:</strong> {farmer.farmingType?.join(', ')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 min-w-[120px]">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewFarmer(farmer._id)}
                          className="mb-2"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        {farmer.verificationStatus === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleVerifyFarmer(farmer._id, 'verified')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerifyFarmer(farmer._id, 'rejected')}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {farmer.verificationStatus === 'verified' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerifyFarmer(farmer._id, 'pending')}
                          >
                            Unverify
                          </Button>
                        )}
                        {farmer.verificationStatus === 'rejected' && (
                          <Button
                            size="sm"
                            onClick={() => handleVerifyFarmer(farmer._id, 'verified')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Verify Now
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        <strong>Description:</strong> {farmer.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-blue-900">Adoption Stats</p>
                          <p className="text-xs text-blue-700">Adopters: {farmer.adoptionStats?.totalAdopters || 0}</p>
                          <p className="text-xs text-blue-700">Funding: ${farmer.adoptionStats?.totalFunding || 0}</p>
                          <p className="text-xs text-blue-700">Current: {farmer.adoptionStats?.currentAdoptions || 0}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-green-900">Rating</p>
                          <p className="text-xs text-green-700">Average: {farmer.rating?.average || 0}/5</p>
                          <p className="text-xs text-green-700">Reviews: {farmer.rating?.count || 0}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-purple-900">Account</p>
                          <p className="text-xs text-purple-700">Status: {farmer.isActive ? 'Active' : 'Inactive'}</p>
                          <p className="text-xs text-purple-700">Joined: {new Date(farmer.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {farmer.cropTypes?.map((crop, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                          >
                            {crop}
                          </span>
                        ))}
                      </div>
                      
                      {farmer.verificationNotes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <p className="text-sm"><strong>Verification Notes:</strong> {farmer.verificationNotes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Farmer Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>{selectedFarmer?.farmName}</span>
              <Badge variant={
                selectedFarmer?.verificationStatus === 'verified' ? 'default' :
                selectedFarmer?.verificationStatus === 'pending' ? 'secondary' : 'destructive'
              }>
                {selectedFarmer?.verificationStatus}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          {selectedFarmer && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Full Name:</span>
                      <span className="font-medium">{selectedFarmer.user?.firstName} {selectedFarmer.user?.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Email:</span>
                      <span className="font-medium">{selectedFarmer.user?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Phone:</span>
                      <span className="font-medium">{selectedFarmer.user?.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Joined:</span>
                      <span className="font-medium">{new Date(selectedFarmer.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Location & Farm Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">County:</span>
                      <span className="font-medium">{selectedFarmer.location?.county}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Sub-County:</span>
                      <span className="font-medium">{selectedFarmer.location?.subCounty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Village:</span>
                      <span className="font-medium">{selectedFarmer.location?.village || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Farm Size:</span>
                      <span className="font-medium">{selectedFarmer.farmSize?.value} {selectedFarmer.farmSize?.unit}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Farm Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{selectedFarmer.description}</p>
                </CardContent>
              </Card>

              {/* Farming Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Farming Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground block mb-2">Farming Types:</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedFarmer.farmingType?.map((type, index) => (
                          <Badge key={index} variant="outline">{type}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground block mb-2">Crop Types:</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedFarmer.cropTypes?.map((crop, index) => (
                          <Badge key={index} variant="secondary">{crop}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Adopters:</span>
                      <span className="font-medium">{selectedFarmer.adoptionStats?.totalAdopters || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Funding:</span>
                      <span className="font-medium">${selectedFarmer.adoptionStats?.totalFunding || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current Adoptions:</span>
                      <span className="font-medium">{selectedFarmer.adoptionStats?.currentAdoptions || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Rating:</span>
                      <span className="font-medium">{selectedFarmer.rating?.average || 0}/5 ({selectedFarmer.rating?.count || 0} reviews)</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Verification Actions */}
              {selectedFarmer.verificationStatus === 'pending' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Verification Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <Button
                        onClick={() => {
                          handleVerifyFarmer(selectedFarmer._id, 'verified');
                          setShowDetailModal(false);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify Farmer
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleVerifyFarmer(selectedFarmer._id, 'rejected');
                          setShowDetailModal(false);
                        }}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Reject Application
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Verification Notes */}
              {selectedFarmer.verificationNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Verification Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{selectedFarmer.verificationNotes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FarmersManagement;
