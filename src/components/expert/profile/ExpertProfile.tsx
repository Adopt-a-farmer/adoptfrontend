import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  Save, 
  Camera,
  FileText,
  Eye,
  Heart,
  Award,
  Calendar,
  Edit3
} from 'lucide-react';
import api from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

interface ExpertProfile {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: {
      url: string;
      publicId: string;
    };
    role: string;
    isVerified: boolean;
    createdAt: string;
  };
  profile: {
    _id: string;
    bio: string;
    specializations: string[];
    experience: {
      yearsOfExperience: number;
      education: Array<{
        institution: string;
        degree: string;
        field: string;
        year: number;
      }>;
      certifications: Array<{
        name: string;
        issuingOrganization: string;
        issueDate: string;
        expiryDate?: string;
        certificateUrl?: string;
      }>;
      previousWork: Array<{
        organization: string;
        position: string;
        startDate: string;
        endDate?: string;
        description: string;
      }>;
    };
    contact: {
      phone: string;
      whatsapp?: string;
      alternateEmail?: string;
      linkedIn?: string;
      website?: string;
    };
    availability: {
      isAvailable: boolean;
      maxMentorships: number;
      workingHours: {
        start: string;
        end: string;
      };
      workingDays: string[];
      consultationTypes: string[];
    };
    location: {
      county: string;
      subCounty: string;
      serviceRadius: number;
      officeAddress?: string;
    };
    statistics: {
      totalMentorships: number;
      activeMentorships: number;
      completedMentorships: number;
      averageRating: number;
      totalReviews: number;
      articlesPublished: number;
      totalViews: number;
      totalLikes: number;
    };
  };
  stats: {
    totalArticles: number;
    totalViews: number;
    totalLikes: number;
  };
}

const ExpertProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['expert-profile'],
    queryFn: async () => {
      try {
        const response = await api.get('/experts/profile');
        return response.data.data.expert;
      } catch (error) {
        // If 403, user is not an expert, return null
        if (error.response?.status === 403) {
          return null;
        }
        throw error;
      }
    },
    retry: false, // Don't retry on 403 errors
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.put('/experts/profile', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-profile'] });
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  });

  // Extract user and profile data from the response
  const user = profileData?.user;
  const expertProfile = profileData?.profile;
  const stats = profileData?.stats;

  const handleEdit = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || ''
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: '',
      lastName: '',
      phone: ''
    });
  };

  // Handle authentication errors
  const isAuthError = error && 'response' in error && (error as { response: { status: number } }).response?.status === 403;
  if (isAuthError || profileData === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Access Restricted</h3>
          <p className="text-yellow-700 mb-4">
            You need to be logged in as an expert to access this profile page.
          </p>
          <p className="text-sm text-yellow-600">
            Please contact an administrator if you believe you should have expert access.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  const profile = profileData as ExpertProfile;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Expert Profile</h1>
        <p className="text-gray-600 mt-2">
          Manage your profile information and view your impact
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Your personal information and contact details
                </CardDescription>
              </div>
              {!isEditing && (
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user?.avatar?.url} />
                    <AvatarFallback className="text-2xl">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-gray-600">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                    </Badge>
                    {user?.isVerified && (
                      <Badge className="bg-green-100 text-green-800">
                        <Award className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2 py-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{user?.firstName}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2 py-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{user?.lastName}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="flex items-center gap-2 py-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{user?.email}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <div className="flex items-center gap-2 py-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{user?.phone || 'Not provided'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={updateProfileMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>
                Your account information and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Member Since</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{new Date(user?.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Account Type</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Award className="h-4 w-4 text-gray-400" />
                    <span>Expert Account</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Impact</CardTitle>
              <CardDescription>
                Statistics about your contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {stats?.totalArticles || 0}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    Articles Published
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {(stats?.totalViews || 0).toLocaleString()}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Eye className="h-4 w-4" />
                    Total Views
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {(stats?.totalLikes || 0).toLocaleString()}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Heart className="h-4 w-4" />
                    Total Likes
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-center text-sm text-gray-500">
                    Keep sharing your expertise to help more farmers succeed!
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Create New Article
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View My Articles
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Award className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExpertProfile;