import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  User, MapPin, Phone, Mail, Camera, Edit, Save, 
  Upload, Star, Award, Tractor, Wheat, Users 
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { farmerService } from '@/services/farmer';

interface FarmProfile {
  id: string;
  farmer_id: number;
  farm_name: string;
  description: string;
  location: string;
  originalLocation?: { county: string; subCounty: string; village?: string }; // Add original backend location
  farm_size: number;
  farm_size_unit: 'acres' | 'hectares';
  crop_types: string[];
  farming_type?: 'crop' | 'livestock' | 'mixed' | 'aquaculture' | 'apiary';
  farming_methods: string[];
  certifications: string[];
  established_year: number;
  profile_image: string;
  cover_image: string;
  contact_phone: string;
  contact_email: string;
  website_url?: string;
  social_media: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  public_visibility: boolean;
  allow_visits: boolean;
  operating_hours: string;
  specialties: string[];
  achievements: string[];
  sustainability_practices: string[];
  updated_at: string;
}

interface ProfileStats {
  total_adopters: number;
  total_visits: number;
  profile_views: number;
  rating: number;
  total_earnings: number;
}

const FarmProfileManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Fetch farm profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['farm-profile', user?.id],
    queryFn: async (): Promise<FarmProfile> => {
      try {
        const response = await apiCall<{data: any}>('GET', '/farmers/dashboard');
        // Transform the backend response to match our interface
        if (response.data && response.data.farmer) {
          const farmer = response.data.farmer;
          return {
            id: farmer._id,
            farmer_id: farmer.user._id,
            farm_name: farmer.farmName || '',
            description: farmer.description || farmer.bio || '',
            location: farmer.location ? `${farmer.location.county}, ${farmer.location.subCounty}${farmer.location.village ? ', ' + farmer.location.village : ''}` : '',
            originalLocation: farmer.location || null, // Store original backend location object
            farm_size: farmer.farmSize?.value || 0,
            farm_size_unit: farmer.farmSize?.unit || 'acres',
            crop_types: farmer.cropTypes || [],
            farming_type: Array.isArray(farmer.farmingType) ? (farmer.farmingType[0] || 'crop') : 'crop',
            farming_methods: farmer.farmingMethods || [],
            certifications: farmer.certifications || [],
            established_year: farmer.establishedYear || new Date().getFullYear(),
            profile_image: farmer.media?.profileImage?.url || farmer.user?.avatar || '',
            cover_image: farmer.media?.farmImages?.[0]?.url || '',
            contact_phone: farmer.contactInfo?.phone || '',
            contact_email: farmer.contactInfo?.email || farmer.user?.email || '',
            website_url: farmer.socialMedia?.website,
            social_media: farmer.socialMedia || {},
            public_visibility: farmer.isActive !== false,
            allow_visits: true,
            operating_hours: '',
            specialties: [],
            achievements: [],
            sustainability_practices: [],
            updated_at: farmer.updatedAt
          };
        }
        throw new Error('No farmer profile found');
      } catch (error) {
        console.error('Error fetching farmer profile:', error);
        throw error; // Let React Query handle the error state
      }
    },
    enabled: !!user
  });

  // Fetch profile stats
  const { data: stats } = useQuery({
    queryKey: ['profile-stats', user?.id],
    queryFn: async (): Promise<ProfileStats> => {
      try {
        const response = await apiCall<{data: any}>('GET', '/farmers/dashboard');
        if (response.data && response.data.stats) {
          const backendStats = response.data.stats;
          return {
            total_adopters: backendStats.totalAdopters || 0,
            total_visits: 0, // This would need to be added to backend
            profile_views: 0, // This would need to be added to backend
            rating: 4.5, // This would need to be calculated from reviews
            total_earnings: backendStats.totalEarnings || 0
          };
        }
        // Return default stats if no data found
        return {
          total_adopters: 0,
          total_visits: 0,
          profile_views: 0,
          rating: 0,
          total_earnings: 0
        };
      } catch (error) {
        console.error('Error fetching profile stats:', error);
        // Return default stats on error
        return {
          total_adopters: 0,
          total_visits: 0,
          profile_views: 0,
          rating: 0,
          total_earnings: 0
        };
      }
    },
    enabled: !!user
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<FarmProfile>) => {
      const payload: any = {};
      if (profileData.farm_name && profileData.farm_name.trim()) payload.farmName = profileData.farm_name.trim();
      if (profileData.description && profileData.description.trim()) payload.description = profileData.description.trim();
      // Only allow backend enum values for farmingType
      const allowedFarmingTypes = ['crop', 'livestock', 'mixed', 'aquaculture', 'apiary'];
      if ((profileData as any).farming_type && allowedFarmingTypes.includes((profileData as any).farming_type)) {
        payload.farmingType = [(profileData as any).farming_type];
      } else if (Array.isArray(profileData.crop_types) && profileData.crop_types.length > 0) {
        const type = 'crop';
        if (allowedFarmingTypes.includes(type)) payload.farmingType = [type];
      }

      // Prefer structured location fields from the form
      if ((profileData as any).location_county || (profileData as any).location_subCounty || (profileData as any).location_village) {
        const loc: any = {};
        const county = ((profileData as any).location_county || '').toString().trim();
        const subCounty = ((profileData as any).location_subCounty || '').toString().trim();
        const village = ((profileData as any).location_village || '').toString().trim();
        if (county) loc.county = county;
        if (subCounty) loc.subCounty = subCounty;
        if (village) loc.village = village;
        if (Object.keys(loc).length > 0) payload.location = loc;
      } else if (profileData.location && profileData.location.includes(',')) {
        // Backward compatibility: parse a single string "County, Sub-County"
        const [countyRaw, subCountyRaw] = profileData.location.split(',');
        const county = countyRaw?.trim();
        const subCounty = subCountyRaw?.trim();
        const loc: any = {};
        if (county) loc.county = county;
        if (subCounty) loc.subCounty = subCounty;
        if (Object.keys(loc).length > 0) payload.location = loc;
      }

      if (typeof profileData.farm_size === 'number') {
        payload.farmSize = payload.farmSize || {};
        payload.farmSize.value = profileData.farm_size;
      }
      if (profileData.farm_size_unit) {
        payload.farmSize = payload.farmSize || {};
        payload.farmSize.unit = profileData.farm_size_unit;
      }
      if (typeof profileData.established_year === 'number') payload.establishedYear = profileData.established_year;
      if (profileData.contact_phone || profileData.contact_email) {
        payload.contactInfo = {};
        if (profileData.contact_phone) payload.contactInfo.phone = profileData.contact_phone;
        if (profileData.contact_email) payload.contactInfo.email = profileData.contact_email;
      }
      if (profileData.social_media) payload.socialMedia = profileData.social_media;
      
      // Add crop types and farming methods to payload
      if (Array.isArray(profileData.crop_types) && profileData.crop_types.length > 0) {
        payload.cropTypes = profileData.crop_types;
      }
      if (Array.isArray(profileData.farming_methods) && profileData.farming_methods.length > 0) {
        payload.farmingMethods = profileData.farming_methods;
      }
      if (Array.isArray(profileData.certifications)) payload.certifications = profileData.certifications;
      // Map settings booleans and hours to backend
      if (typeof (profileData as any).public_visibility === 'boolean') payload.isActive = (profileData as any).public_visibility;
      if (typeof (profileData as any).allow_visits === 'boolean') payload.allowVisits = (profileData as any).allow_visits;
      if ((profileData as any).operating_hours) payload.operatingHours = (profileData as any).operating_hours;

      return await apiCall('PATCH', '/farmers/profile', payload);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Farm profile updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['farm-profile'] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  });

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: 'profile' | 'cover' }) => {
      const formData = new FormData();
      formData.append('images', file); // Backend expects 'images' not 'file'
      
      if (type === 'profile') {
        // For profile images, we'll use the images endpoint
        return await apiCall('POST', '/farmers/images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // For cover images, also use the images endpoint 
        return await apiCall('POST', '/farmers/images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['farm-profile'] });
    },
    onError: (error: any) => {
      console.error('Image upload error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to upload image",
        variant: "destructive",
      });
    }
  });

  const handleImageUpload = (file: File, type: 'profile' | 'cover') => {
    uploadImageMutation.mutate({ file, type });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  if (isLoading) {
    return <div>Loading farm profile...</div>;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Farm Profile Manager</h2>
          <p className="text-muted-foreground">Manage your public farm profile</p>
        </div>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          className="mt-4 md:mt-0 bg-farmer-primary hover:bg-farmer-primary/90"
        >
          {isEditing ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      {/* Profile Header Card */}
      <Card>
        <div className="relative">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-farmer-primary to-farmer-secondary rounded-t-lg relative overflow-hidden">
            {profile.cover_image && (
              <img 
                src={profile.cover_image} 
                alt="Farm cover"
                className="w-full h-full object-cover"
              />
            )}
            {isEditing && (
              <div className="absolute top-4 right-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, 'cover');
                  }}
                  className="hidden"
                  id="cover-upload"
                />
                <Button asChild size="sm" variant="secondary">
                  <Label htmlFor="cover-upload" className="cursor-pointer">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Cover
                  </Label>
                </Button>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
              {/* Profile Avatar */}
              <div className="relative -mt-16 mb-4 md:mb-0">
                <Avatar className="w-32 h-32 border-4 border-white">
                  <AvatarImage src={profile.profile_image} />
                  <AvatarFallback className="text-2xl">
                    {profile.farm_name?.charAt(0) || user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="absolute bottom-0 right-0">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'profile');
                      }}
                      className="hidden"
                      id="profile-upload"
                    />
                    <Button asChild size="sm" className="rounded-full">
                      <Label htmlFor="profile-upload" className="cursor-pointer">
                        <Camera className="h-4 w-4" />
                      </Label>
                    </Button>
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{profile.farm_name}</h1>
                <div className="flex items-center text-gray-600 mt-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {profile.location}
                </div>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>{stats?.rating || 0} rating</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-500 mr-1" />
                    <span>{stats?.total_adopters || 0} adopters</span>
                  </div>
                  <div className="flex items-center">
                    <Tractor className="h-4 w-4 text-gray-500 mr-1" />
                    <span>{profile.farm_size} {profile.farm_size_unit}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 md:mt-0">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-farmer-primary">{stats.total_adopters}</p>
                    <p className="text-sm text-gray-500">Adopters</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-farmer-primary">{stats.total_visits}</p>
                    <p className="text-sm text-gray-500">Visits</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-farmer-primary">{stats.profile_views}</p>
                    <p className="text-sm text-gray-500">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-farmer-primary">{formatCurrency(stats.total_earnings)}</p>
                    <p className="text-sm text-gray-500">Earned</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Details Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Farm Details</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <FarmDetailsForm 
            profile={profile} 
            isEditing={isEditing}
            onUpdate={(data) => updateProfileMutation.mutate(data)}
            isLoading={updateProfileMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <ContactInfoForm 
            profile={profile} 
            isEditing={isEditing}
            onUpdate={(data) => updateProfileMutation.mutate(data)}
            isLoading={updateProfileMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <ProfileSettingsForm 
            profile={profile} 
            isEditing={isEditing}
            onUpdate={(data) => updateProfileMutation.mutate(data)}
            isLoading={updateProfileMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <AchievementsSection profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Farm Details Form Component
const FarmDetailsForm = ({ 
  profile, 
  isEditing, 
  onUpdate, 
  isLoading 
}: {
  profile: FarmProfile;
  isEditing: boolean;
  onUpdate: (data: Partial<FarmProfile>) => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState({
    farm_name: profile.farm_name || '',
    description: profile.description || '',
    farm_size: profile.farm_size || 0,
    farm_size_unit: profile.farm_size_unit || 'acres',
    crop_types: profile.crop_types || [],
    farming_type: profile.farming_type || 'crop',
    farming_methods: profile.farming_methods || [],
    established_year: profile.established_year || new Date().getFullYear(),
    specialties: profile.specialties || [],
    sustainability_practices: profile.sustainability_practices || [],
    // new structured location fields (pre-fill best effort)
    location_county: '',
    location_subCounty: '',
    location_village: ''
  });

  // Pre-fill structured location fields from original backend location object
  React.useEffect(() => {
    if (profile.originalLocation) {
      setFormData((prev) => ({
        ...prev,
        location_county: profile.originalLocation.county || '',
        location_subCounty: profile.originalLocation.subCounty || '',
        location_village: profile.originalLocation.village || '',
      }));
    } else if (profile.location && typeof profile.location === 'string' && profile.location.includes(',')) {
      // Fallback to parsing string if no original location object
      const parts = profile.location.split(',').map(s => s.trim());
      setFormData((prev) => ({
        ...prev,
        location_county: parts[0] || '',
        location_subCounty: parts[1] || '',
        location_village: parts[2] || '',
      }));
    }
  }, [profile.originalLocation, profile.location]);

  // Sync form data when profile changes (important for arrays that might be updated)
  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      farm_name: profile.farm_name || prev.farm_name,
      description: profile.description || prev.description,
      farm_size: profile.farm_size || prev.farm_size,
      farm_size_unit: profile.farm_size_unit || prev.farm_size_unit,
      crop_types: profile.crop_types || [],
      farming_methods: profile.farming_methods || [],
      established_year: profile.established_year || prev.established_year,
    }));
  }, [profile.farm_name, profile.description, profile.farm_size, profile.farm_size_unit, profile.crop_types, profile.farming_methods, profile.established_year]);

  const cropOptions = [
    'Maize', 'Beans', 'Rice', 'Wheat', 'Vegetables', 'Fruits', 'Coffee', 'Tea', 
    'Sugarcane', 'Cotton', 'Sunflower', 'Sorghum', 'Millet'
  ];

  const farmingMethodOptions = [
    'Organic', 'Conventional', 'Permaculture', 'Hydroponics', 'Agroforestry', 
    'Conservation Agriculture', 'Precision Farming', 'Sustainable Agriculture'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Client-side validation
    const errors: string[] = [];
    if (formData.description && formData.description.trim().length > 0 && formData.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters if provided.');
    }
    if (typeof formData.farm_size === 'number' && formData.farm_size !== 0 && formData.farm_size < 0.1) {
      errors.push('Farm size must be at least 0.1 if provided.');
    }
    // If county is set, recommend sub-county (not hard block, but guidance)
    if (formData.location_county && !formData.location_subCounty) {
      errors.push('Please provide Sub-County when setting County.');
    }
    if (errors.length > 0) {
      // eslint-disable-next-line no-alert
      alert(errors.join('\n'));
      return;
    }
    onUpdate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wheat className="h-5 w-5 mr-2" />
          Farm Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location_county">County</Label>
              <Input
                id="location_county"
                value={formData.location_county}
                onChange={(e) => setFormData({ ...formData, location_county: e.target.value })}
                disabled={!isEditing}
                placeholder="e.g., Nairobi"
              />
            </div>
            <div>
              <Label htmlFor="location_subCounty">Sub-County</Label>
              <Input
                id="location_subCounty"
                value={formData.location_subCounty}
                onChange={(e) => setFormData({ ...formData, location_subCounty: e.target.value })}
                disabled={!isEditing}
                placeholder="e.g., Westlands"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location_village">Village (Optional)</Label>
            <Input
              id="location_village"
              value={formData.location_village}
              onChange={(e) => setFormData({ ...formData, location_village: e.target.value })}
              disabled={!isEditing}
              placeholder="e.g., Kitisuru"
            />
          </div>

          <Separator className="my-2" />

          <div className="text-sm text-muted-foreground">
            Tip: For partial updates, leave fields blank to keep existing values.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="farm_name">Farm Name</Label>
              <Input
                id="farm_name"
                value={formData.farm_name}
                onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                disabled={!isEditing}
                required
              />
            </div>
            <div>
              <Label htmlFor="established_year">Established Year</Label>
              <Input
                id="established_year"
                type="number"
                value={formData.established_year}
                onChange={(e) => setFormData({ ...formData, established_year: parseInt(e.target.value) || 0 })}
                disabled={!isEditing}
                min={1900}
                max={new Date().getFullYear()
}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Farm Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={!isEditing}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="farm_size">Farm Size</Label>
              <Input
                id="farm_size"
                type="number"
                value={formData.farm_size}
                onChange={(e) => setFormData({ ...formData, farm_size: parseFloat(e.target.value) || 0 })}
                disabled={!isEditing}
                min={0}
                step={0.1}
              />
            </div>
            <div>
              <Label htmlFor="farm_size_unit">Unit</Label>
              <Select 
                value={formData.farm_size_unit} 
                onValueChange={(value: 'acres' | 'hectares') => setFormData({ ...formData, farm_size_unit: value })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acres">Acres</SelectItem>
                  <SelectItem value="hectares">Hectares</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="farming_type">Farming Type</Label>
            <Select 
              value={formData.farming_type}
              onValueChange={(value: 'crop' | 'livestock' | 'mixed' | 'aquaculture' | 'apiary') => setFormData({ ...formData, farming_type: value })}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select farming type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="crop">Crop</SelectItem>
                <SelectItem value="livestock">Livestock</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
                <SelectItem value="aquaculture">Aquaculture</SelectItem>
                <SelectItem value="apiary">Apiary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Crop Types</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {cropOptions.map((crop) => (
                <Badge
                  key={crop}
                  variant={formData.crop_types.includes(crop) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    formData.crop_types.includes(crop) ? 'bg-farmer-primary' : ''
                  }`}
                  onClick={() => {
                    if (!isEditing) return;
                    const newCrops = formData.crop_types.includes(crop)
                      ? formData.crop_types.filter(c => c !== crop)
                      : [...formData.crop_types, crop];
                    setFormData({ ...formData, crop_types: newCrops });
                  }}
                >
                  {crop}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Farming Methods</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {farmingMethodOptions.map((method) => (
                <Badge
                  key={method}
                  variant={formData.farming_methods.includes(method) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    formData.farming_methods.includes(method) ? 'bg-farmer-primary' : ''
                  }`}
                  onClick={() => {
                    if (!isEditing) return;
                    const newMethods = formData.farming_methods.includes(method)
                      ? formData.farming_methods.filter(m => m !== method)
                      : [...formData.farming_methods, method];
                    setFormData({ ...formData, farming_methods: newMethods });
                  }}
                >
                  {method}
                </Badge>
              ))}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-farmer-primary hover:bg-farmer-primary/90"
              >
                {isLoading ? "Saving..." : "Save Farm Details"}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

// Contact Info Form Component
const ContactInfoForm = ({ 
  profile, 
  isEditing, 
  onUpdate, 
  isLoading 
}: {
  profile: FarmProfile;
  isEditing: boolean;
  onUpdate: (data: Partial<FarmProfile>) => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState({
    contact_phone: profile.contact_phone,
    contact_email: profile.contact_email,
    website_url: profile.website_url || '',
    social_media: profile.social_media
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Phone className="h-5 w-5 mr-2" />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_phone">Phone Number</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="contact_email">Email Address</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="website_url">Website URL (Optional)</Label>
            <Input
              id="website_url"
              type="url"
              value={formData.website_url}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              disabled={!isEditing}
              placeholder="https://yourfarm.com"
            />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Social Media Links</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={formData.social_media.facebook || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    social_media: { ...formData.social_media, facebook: e.target.value }
                  })}
                  disabled={!isEditing}
                  placeholder="https://facebook.com/yourfarm"
                />
              </div>
              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={formData.social_media.twitter || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    social_media: { ...formData.social_media, twitter: e.target.value }
                  })}
                  disabled={!isEditing}
                  placeholder="https://twitter.com/yourfarm"
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={formData.social_media.instagram || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    social_media: { ...formData.social_media, instagram: e.target.value }
                  })}
                  disabled={!isEditing}
                  placeholder="https://instagram.com/yourfarm"
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-farmer-primary hover:bg-farmer-primary/90"
              >
                {isLoading ? "Saving..." : "Save Contact Info"}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

// Profile Settings Form Component
const ProfileSettingsForm = ({ 
  profile, 
  isEditing, 
  onUpdate, 
  isLoading 
}: {
  profile: FarmProfile;
  isEditing: boolean;
  onUpdate: (data: Partial<FarmProfile>) => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState({
    public_visibility: profile.public_visibility,
    allow_visits: profile.allow_visits,
    operating_hours: profile.operating_hours
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Public Visibility</Label>
              <p className="text-sm text-gray-500">Make your farm profile visible to the public</p>
            </div>
            <Switch
              checked={formData.public_visibility}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, public_visibility: checked })
              }
              disabled={!isEditing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Allow Farm Visits</Label>
              <p className="text-sm text-gray-500">Allow adopters to schedule farm visits</p>
            </div>
            <Switch
              checked={formData.allow_visits}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, allow_visits: checked })
              }
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="operating_hours">Operating Hours</Label>
            <Input
              id="operating_hours"
              value={formData.operating_hours}
              onChange={(e) => setFormData({ ...formData, operating_hours: e.target.value })}
              disabled={!isEditing}
              placeholder="e.g., Monday - Friday: 8:00 AM - 5:00 PM"
            />
          </div>

          {isEditing && (
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-farmer-primary hover:bg-farmer-primary/90"
              >
                {isLoading ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

// Achievements Section Component
const AchievementsSection = ({ profile }: { profile: FarmProfile }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Certifications & Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Certifications</h4>
              <div className="flex flex-wrap gap-2">
                {profile.certifications.map((cert) => (
                  <Badge key={cert} className="bg-green-100 text-green-800">
                    {cert}
                  </Badge>
                ))}
                {profile.certifications.length === 0 && (
                  <p className="text-gray-500">No certifications added yet</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Achievements</h4>
              <div className="flex flex-wrap gap-2">
                {profile.achievements.map((achievement) => (
                  <Badge key={achievement} className="bg-yellow-100 text-yellow-800">
                    <Award className="h-3 w-3 mr-1" />
                    {achievement}
                  </Badge>
                ))}
                {profile.achievements.length === 0 && (
                  <p className="text-gray-500">No achievements added yet</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Sustainability Practices</h4>
              <div className="flex flex-wrap gap-2">
                {profile.sustainability_practices.map((practice) => (
                  <Badge key={practice} className="bg-blue-100 text-blue-800">
                    {practice}
                  </Badge>
                ))}
                {profile.sustainability_practices.length === 0 && (
                  <p className="text-gray-500">No sustainability practices added yet</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmProfileManager;