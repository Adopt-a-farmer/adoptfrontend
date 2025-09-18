import React, { useState } from 'react';
import { adminService } from '@/services/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, Mail, Phone, AlertCircle, UserCheck, CreditCard, Calendar, MapPin, Wheat, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

const AdoptersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedAdopters, setExpandedAdopters] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  const { data: adoptersData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-adopters-with-farmers', currentPage, searchTerm],
    queryFn: () => adminService.getAllAdoptersWithFarmers({
      page: currentPage,
      limit: 20,
      search: searchTerm || undefined
    }),
    keepPreviousData: true
  });

  const adopters = Array.isArray(adoptersData?.data?.adopters) ? adoptersData.data.adopters : [];

  const toggleExpanded = (adopterId: string) => {
    const newExpanded = new Set(expandedAdopters);
    if (newExpanded.has(adopterId)) {
      newExpanded.delete(adopterId);
    } else {
      newExpanded.add(adopterId);
    }
    setExpandedAdopters(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Adopters Management</h1>
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Adopters</h3>
            <p className="text-muted-foreground mb-4">Unable to load adopter data. Please try again.</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Adopters & Their Farmers</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Adopters</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adoptersData?.data?.pagination?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Registered adopters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Adopters</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {adopters.length > 0 ? adopters.filter(a => a.adopterInfo?.isActive).length : 0}
            </div>
            <p className="text-xs text-muted-foreground">Active adopters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Adoptions</CardTitle>
            <Wheat className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {adopters.reduce((sum, a) => sum + (a.totalAdoptions || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">All adoptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KES {adopters.reduce((sum, a) => sum + (a.totalAmountPaid || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total payments</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Adopters & Their Farmers</CardTitle>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search adopters..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-60 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : adopters.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Adopters Found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'No adopters match your search criteria.' : 'No adopters have registered yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {adopters.map((adopter) => (
                <Card key={adopter._id} className="overflow-hidden">
                  <CardContent className="p-6">
                    {/* Adopter Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Users className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">
                              {adopter.adopterInfo?.firstName} {adopter.adopterInfo?.lastName}
                            </h3>
                            {adopter.adopterInfo?.isVerified && (
                              <span className="px-3 py-1 text-sm rounded-full font-medium bg-blue-100 text-blue-800">
                                Verified
                              </span>
                            )}
                            {!adopter.adopterInfo?.isActive && (
                              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <p className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                {adopter.adopterInfo?.email}
                              </p>
                              <p className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                {adopter.adopterInfo?.phone || 'Not provided'}
                              </p>
                            </div>
                            <div>
                              <p className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Joined: {new Date(adopter.adopterInfo?.createdAt).toLocaleDateString()}
                              </p>
                              <p><strong>Role:</strong> {adopter.adopterInfo?.role}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Adopter Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-green-900">Adoption Overview</p>
                        <p className="text-xs text-green-700">Total: {adopter.totalAdoptions || 0}</p>
                        <p className="text-xs text-green-700">Active: {adopter.activeAdoptions || 0}</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">Financial</p>
                        <p className="text-xs text-blue-700">Total Paid: KES {(adopter.totalAmountPaid || 0).toLocaleString()}</p>
                        <p className="text-xs text-blue-700">Avg per Adoption: KES {adopter.totalAdoptions > 0 ? Math.round((adopter.totalAmountPaid || 0) / adopter.totalAdoptions).toLocaleString() : '0'}</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-900">Farmers</p>
                          <p className="text-xs text-purple-700">{adopter.adoptedFarmers?.length || 0} farmers</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(adopter._id)}
                          className="text-purple-700 hover:text-purple-900"
                        >
                          {expandedAdopters.has(adopter._id) ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                          }
                        </Button>
                      </div>
                    </div>

                    {/* Adopted Farmers List - Expandable */}
                    {expandedAdopters.has(adopter._id) && adopter.adoptedFarmers && adopter.adoptedFarmers.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Wheat className="h-5 w-5 text-green-600" />
                          Adopted Farmers ({adopter.adoptedFarmers.length})
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {adopter.adoptedFarmers.map((adoption) => (
                            <Card key={adoption.adoptionId} className="border-l-4 border-l-green-500">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h5 className="font-semibold text-gray-900">
                                      {adoption.farmer?.firstName} {adoption.farmer?.lastName}
                                    </h5>
                                    <p className="text-sm text-gray-600">{adoption.farmer?.email}</p>
                                    {adoption.farmerProfile?.farmName && (
                                      <p className="text-sm text-green-700 font-medium">
                                        Farm: {adoption.farmerProfile.farmName}
                                      </p>
                                    )}
                                  </div>
                                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(adoption.status)}`}>
                                    {adoption.status}
                                  </span>
                                </div>
                                
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Type:</span>
                                    <span className="font-medium capitalize">{adoption.adoptionType?.replace('_', ' ')}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Payment Plan:</span>
                                    <span className="font-medium">KES {(adoption.paymentPlan?.amount || 0).toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Total Paid:</span>
                                    <span className="font-medium text-green-600">KES {(adoption.paymentPlan?.totalPaid || 0).toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Started:</span>
                                    <span>{new Date(adoption.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  
                                  {adoption.farmerProfile?.location && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Location:</span>
                                      <span className="text-right">
                                        {adoption.farmerProfile.location.county}, {adoption.farmerProfile.location.subCounty}
                                      </span>
                                    </div>
                                  )}

                                  {/* ROI Information */}
                                  {(adoption.expectedReturns || adoption.actualReturns) && (
                                    <div className="mt-3 pt-3 border-t">
                                      <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium">Returns</span>
                                      </div>
                                      {adoption.expectedReturns && (
                                        <div className="text-xs space-y-1">
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Expected ROI:</span>
                                            <span>{adoption.expectedReturns.roi || 0}%</span>
                                          </div>
                                        </div>
                                      )}
                                      {adoption.actualReturns && (
                                        <div className="text-xs space-y-1">
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Actual ROI:</span>
                                            <span className="font-medium text-green-600">{adoption.actualReturns.actualRoi || 0}%</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No Farmers Message */}
                    {expandedAdopters.has(adopter._id) && (!adopter.adoptedFarmers || adopter.adoptedFarmers.length === 0) && (
                      <div className="border-t pt-4 text-center py-8">
                        <Wheat className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">This adopter hasn't adopted any farmers yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdoptersManagement;
