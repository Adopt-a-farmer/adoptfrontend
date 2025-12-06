import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Users, 
  UserPlus, 
  Trash2, 
  AlertCircle, 
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  UserCheck,
  Tractor,
  GraduationCap,
  Heart
} from 'lucide-react';
import { adminService, User } from '@/services/admin';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const UsersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state for new user
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'adopter' as 'farmer' | 'adopter' | 'expert',
    // Farmer-specific fields
    farmName: '',
    farmDescription: '',
    county: '',
    subCounty: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: usersData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users', currentPage, searchTerm, roleFilter],
    queryFn: () => adminService.getAllUsers({
      page: currentPage,
      limit: 20,
      search: searchTerm || undefined,
      role: roleFilter !== 'all' ? roleFilter : undefined
    }),
  });

  // Fetch dashboard stats for counts
  const { data: dashboardStats } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => adminService.getDashboardStats(),
  });

  const users = usersData?.data?.users || [];
  const pagination = usersData?.data?.pagination;

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (userData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: string;
      phone?: string;
      profileData?: Record<string, unknown>;
    }) => adminService.createUser(userData),
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: data.message || 'User created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      setShowAddModal(false);
      resetForm();
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to create user',
        variant: 'destructive',
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(userId),
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: data.message || 'User deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-farmers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-adopters'] });
      queryClient.invalidateQueries({ queryKey: ['admin-experts'] });
      setShowDeleteDialog(false);
      setSelectedUser(null);
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to delete user',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      role: 'adopter',
      farmName: '',
      farmDescription: '',
      county: '',
      subCounty: ''
    });
  };

  const handleCreateUser = async () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (!newUser.phone) {
      toast({
        title: 'Validation Error',
        description: 'Phone number is required',
        variant: 'destructive',
      });
      return;
    }

    let profileData: Record<string, unknown> | undefined;
    
    if (newUser.role === 'farmer') {
      if (!newUser.farmName) {
        toast({
          title: 'Validation Error',
          description: 'Farm name is required for farmers',
          variant: 'destructive',
        });
        return;
      }
      profileData = {
        farmName: newUser.farmName,
        description: newUser.farmDescription || 'New farm profile',
        location: {
          county: newUser.county || 'Not specified',
          subCounty: newUser.subCounty || 'Not specified'
        },
        farmSize: { value: 1, unit: 'acres' },
        farmingType: ['crop']
      };
    } else if (newUser.role === 'adopter') {
      profileData = {
        adopterType: 'individual',
        location: { country: 'Kenya' },
        interests: { farmingTypes: ['crop'] }
      };
    } else if (newUser.role === 'expert') {
      profileData = {
        bio: '',
        specializations: [],
        experience: {
          yearsOfExperience: 0,
          education: [],
          certifications: []
        },
        availability: {
          isAvailable: true,
          maxMentorships: 10
        }
      };
    }

    createUserMutation.mutate({
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      password: newUser.password,
      phone: newUser.phone,
      role: newUser.role,
      profileData
    });
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser._id);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'farmer':
        return <Tractor className="h-4 w-4" />;
      case 'adopter':
        return <Heart className="h-4 w-4" />;
      case 'expert':
        return <GraduationCap className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'farmer':
        return 'bg-green-100 text-green-800';
      case 'adopter':
        return 'bg-blue-100 text-blue-800';
      case 'expert':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Users</h3>
            <p className="text-muted-foreground mb-4">Failed to load users data</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground">Add, manage, and delete users in the system</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-green-600 hover:bg-green-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Add New User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{dashboardStats?.users?.total || 0}</p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Farmers</p>
                <p className="text-2xl font-bold text-green-600">{dashboardStats?.users?.farmers || 0}</p>
              </div>
              <Tractor className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Adopters</p>
                <p className="text-2xl font-bold text-blue-600">{dashboardStats?.users?.adopters || 0}</p>
              </div>
              <Heart className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Experts</p>
                <p className="text-2xl font-bold text-purple-600">{dashboardStats?.users?.experts || 0}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="farmer">Farmers</SelectItem>
                <SelectItem value="adopter">Adopters</SelectItem>
                <SelectItem value="expert">Experts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {pagination?.total || 0} users total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        <span className="flex items-center gap-1">
                          {getRoleIcon(user.role)}
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {user.role !== 'admin' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteClick(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {pagination.current} of {pagination.pages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new farmer, adopter, or expert account
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label>User Role <span className="text-red-500">*</span></Label>
              <Select 
                value={newUser.role} 
                onValueChange={(value: 'farmer' | 'adopter' | 'expert') => setNewUser({...newUser, role: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="farmer">
                    <span className="flex items-center gap-2">
                      <Tractor className="h-4 w-4" />
                      Farmer
                    </span>
                  </SelectItem>
                  <SelectItem value="adopter">
                    <span className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Adopter
                    </span>
                  </SelectItem>
                  <SelectItem value="expert">
                    <span className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Expert
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name <span className="text-red-500">*</span></Label>
                <Input
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name <span className="text-red-500">*</span></Label>
                <Input
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email <span className="text-red-500">*</span></Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Phone Number <span className="text-red-500">*</span></Label>
              <Input
                type="tel"
                value={newUser.phone}
                onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                placeholder="0712345678"
              />
            </div>

            <div className="space-y-2">
              <Label>Password <span className="text-red-500">*</span></Label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                placeholder="••••••••"
              />
            </div>

            {/* Farmer-specific fields */}
            {newUser.role === 'farmer' && (
              <>
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Tractor className="h-4 w-4" />
                    Farm Details
                  </h4>
                </div>
                
                <div className="space-y-2">
                  <Label>Farm Name <span className="text-red-500">*</span></Label>
                  <Input
                    value={newUser.farmName}
                    onChange={(e) => setNewUser({...newUser, farmName: e.target.value})}
                    placeholder="Green Valley Farm"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Farm Description</Label>
                  <Textarea
                    value={newUser.farmDescription}
                    onChange={(e) => setNewUser({...newUser, farmDescription: e.target.value})}
                    placeholder="Describe the farm..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>County</Label>
                    <Input
                      value={newUser.county}
                      onChange={(e) => setNewUser({...newUser, county: e.target.value})}
                      placeholder="Nairobi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sub-County</Label>
                    <Input
                      value={newUser.subCounty}
                      onChange={(e) => setNewUser({...newUser, subCounty: e.target.value})}
                      placeholder="Westlands"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateUser}
              disabled={createUserMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {createUserMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>?
              <br /><br />
              This will permanently remove:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>User account and profile</li>
                {selectedUser?.role === 'farmer' && <li>Farm profile and all adoptions</li>}
                {selectedUser?.role === 'adopter' && <li>Adopter profile and adoption records</li>}
                {selectedUser?.role === 'expert' && <li>Expert profile and mentorships</li>}
              </ul>
              <br />
              <span className="text-red-600 font-medium">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersManagement;
