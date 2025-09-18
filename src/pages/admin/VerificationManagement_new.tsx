import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Loader2,
  RefreshCw,
  Filter,
  UserCheck,
  Building,
  Award
} from 'lucide-react';
import { adminService, VerificationUser, VerificationStats } from '@/services/admin';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

const VerificationManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users for verification using the new unified endpoint
  const { data: verificationData, isLoading, refetch } = useQuery({
    queryKey: ['admin-verification', searchTerm, statusFilter, typeFilter, page],
    queryFn: () => adminService.getAllForVerification({
      search: searchTerm || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      type: typeFilter !== 'all' ? typeFilter : undefined,
      page,
      limit: 20
    }),
    keepPreviousData: true
  });

  const users: VerificationUser[] = verificationData?.data?.users || [];
  const stats: VerificationStats = verificationData?.data?.stats || {
    total: 0,
    farmers: 0,
    experts: 0,
    pending: { farmers: 0, experts: 0 },
    verified: { farmers: 0, experts: 0 },
    rejected: { farmers: 0, experts: 0 }
  };
  const pagination = verificationData?.data?.pagination;

  // Mutation for individual verification
  const verifyMutation = useMutation({
    mutationFn: async ({ userId, userType, status }: { userId: string; userType: 'farmer' | 'expert'; status: string }) => {
      if (userType === 'farmer') {
        return adminService.verifyFarmer(userId, { status });
      } else {
        return adminService.verifyExpert(userId, { status });
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-verification'] });
      toast({
        title: 'Success',
        description: `${variables.userType.charAt(0).toUpperCase() + variables.userType.slice(1)} ${variables.status === 'verified' ? 'approved' : 'rejected'} successfully`,
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update verification status',
        variant: 'destructive',
      });
    }
  });

  // Mutation for bulk verification
  const bulkVerifyMutation = useMutation({
    mutationFn: async (userIds: Array<{ id: string; type: 'farmer' | 'expert' }>) => {
      const promises = userIds.map(({ id, type }) => {
        if (type === 'farmer') {
          return adminService.verifyFarmer(id, { status: 'verified' });
        } else {
          return adminService.verifyExpert(id, { status: 'verified' });
        }
      });
      return Promise.all(promises);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-verification'] });
      toast({
        title: 'Success',
        description: `Successfully verified ${variables.length} users`,
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Some users could not be verified',
        variant: 'destructive',
      });
    }
  });

  const handleVerifyUser = (userId: string, userType: 'farmer' | 'expert', status: string) => {
    verifyMutation.mutate({ userId, userType, status });
  };

  const handleBulkVerify = () => {
    const pendingUsers = users
      .filter(user => user.verificationStatus === 'pending')
      .map(user => ({ id: user._id, type: user.type }));
    
    if (pendingUsers.length === 0) {
      toast({
        title: 'No pending users',
        description: 'There are no pending users to verify',
        variant: 'destructive',
      });
      return;
    }

    bulkVerifyMutation.mutate(pendingUsers);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'verified':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Verified</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const UserCard = ({ user }: { user: VerificationUser }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${user.type === 'farmer' ? 'bg-green-100' : 'bg-blue-100'}`}>
              {user.type === 'farmer' ? (
                <User className={`h-5 w-5 ${user.type === 'farmer' ? 'text-green-600' : 'text-blue-600'}`} />
              ) : (
                <GraduationCap className={`h-5 w-5 ${user.type === 'farmer' ? 'text-green-600' : 'text-blue-600'}`} />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{user.fullName}</h3>
              <p className="text-sm text-muted-foreground capitalize">{user.type}</p>
            </div>
          </div>
          {getStatusBadge(user.verificationStatus)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {user.type === 'farmer' ? (
            <>
              <div className="flex items-center text-sm text-muted-foreground">
                <Building className="h-4 w-4 mr-2" />
                <span>{user.farmName || 'Unknown Farm'}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{user.location?.city || 'Unknown'}, {user.location?.state || 'Unknown'}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Award className="h-4 w-4 mr-2" />
                <span>{user.farmingType || 'Unknown Type'}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center text-sm text-muted-foreground">
                <Award className="h-4 w-4 mr-2" />
                <span>{user.specializations?.join(', ') || 'No specializations'}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{user.experience || 0} years experience</span>
              </div>
              {user.hourlyRate && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <span className="mr-2">💰</span>
                  <span>${user.hourlyRate}/hour</span>
                </div>
              )}
            </>
          )}
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="h-4 w-4 mr-2" />
            <span>{user.user?.email || 'No email'}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Phone className="h-4 w-4 mr-2" />
            <span>{user.user?.phone || 'No phone'}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        {user.verificationNotes && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Notes:</strong> {user.verificationNotes}
            </p>
          </div>
        )}

        {user.verificationStatus === 'pending' && (
          <div className="flex space-x-2">
            <Button
              onClick={() => handleVerifyUser(user._id, user.type, 'verified')}
              disabled={verifyMutation.isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {verifyMutation.isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Approve
            </Button>
            <Button
              onClick={() => handleVerifyUser(user._id, user.type, 'rejected')}
              disabled={verifyMutation.isLoading}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}

        {user.verificationStatus !== 'pending' && (
          <div className="text-center py-2">
            <span className="text-sm text-muted-foreground">
              {user.verificationStatus === 'verified' ? 'Already verified' : 'Verification rejected'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Verification Management</h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleBulkVerify}
            disabled={bulkVerifyMutation.isLoading || users.filter(u => u.verificationStatus === 'pending').length === 0}
          >
            {bulkVerifyMutation.isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <UserCheck className="h-4 w-4 mr-2" />
            )}
            Verify All Pending ({users.filter(u => u.verificationStatus === 'pending').length})
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.farmers} farmers, {stats.experts} experts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending.farmers + stats.pending.experts}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.pending.farmers} farmers, {stats.pending.experts} experts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.verified.farmers + stats.verified.experts}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.verified.farmers} farmers, {stats.verified.experts} experts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.rejected.farmers + stats.rejected.experts}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.rejected.farmers} farmers, {stats.rejected.experts} experts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="farmers">Farmers</SelectItem>
                  <SelectItem value="experts">Experts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Quick Filters</label>
              <div className="flex gap-1">
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('pending')}
                >
                  Pending
                </Button>
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-3">Loading verification data...</span>
        </div>
      ) : users.length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Verification Results ({pagination?.total || users.length} total)
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <UserCard key={user._id} user={user} />
            ))}
          </div>
          
          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-2 py-4">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={!pagination.hasPrev}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.current} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasNext}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No users found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters or search criteria'
                : 'No users available for verification'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VerificationManagement;