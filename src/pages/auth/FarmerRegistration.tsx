import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, MapPin, User, Briefcase, Image } from 'lucide-react';
import { apiCall } from '@/services/api';

const basicInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const farmDetailsSchema = z.object({
  farmName: z.string().min(2, 'Farm name is required'),
  description: z.string().min(50, 'Please provide a detailed description (at least 50 characters)'),
  farmSize: z.object({
    value: z.number().min(0.1, 'Farm size must be at least 0.1'),
    unit: z.enum(['acres', 'hectares']),
  }),
  farmingType: z.array(z.string()).min(1, 'Select at least one farming type'),
  cropTypes: z.array(z.string()).min(1, 'Select at least one crop type'),
  farmingMethods: z.array(z.string()).min(1, 'Select at least one farming method'),
  establishedYear: z.number().min(1900).max(new Date().getFullYear()),
});

const locationSchema = z.object({
  county: z.string().min(2, 'County is required'),
  subCounty: z.string().min(2, 'Sub-county is required'),
  village: z.string().min(2, 'Village is required'),
  coordinates: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
});

const contactSchema = z.object({
  contactPhone: z.string().min(10, 'Contact phone is required'),
  contactEmail: z.string().email('Valid email is required'),
  website: z.string().url().optional().or(z.literal('')),
  socialMedia: z.object({
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
  }).optional(),
});

const completeSchema = basicInfoSchema
  .and(farmDetailsSchema)
  .and(locationSchema)
  .and(contactSchema);

type FormData = z.infer<typeof completeSchema>;

interface UploadResponse {
  data: {
    url: string;
    secure_url: string;
  };
}

interface SignUpDataWithAvatar {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: 'farmer' | 'adopter' | 'expert';
  avatar: string;
}

const FarmerRegistration = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');

  const form = useForm<FormData>({
    resolver: zodResolver(completeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      farmName: '',
      description: '',
      farmSize: { value: 1, unit: 'acres' },
      farmingType: [],
      cropTypes: [],
      farmingMethods: [],
      establishedYear: new Date().getFullYear(),
      county: '',
      subCounty: '',
      village: '',
      contactPhone: '',
      contactEmail: '',
      website: '',
      socialMedia: { facebook: '', twitter: '', instagram: '' },
    },
  });

  const farmingTypeOptions = [
    { value: 'crop', label: 'Crop Farming' },
    { value: 'livestock', label: 'Livestock' },
    { value: 'mixed', label: 'Mixed Farming' },
    { value: 'aquaculture', label: 'Aquaculture' },
    { value: 'apiary', label: 'Beekeeping' },
  ];

  const cropTypeOptions = [
    { value: 'maize', label: 'Maize' },
    { value: 'beans', label: 'Beans' },
    { value: 'rice', label: 'Rice' },
    { value: 'wheat', label: 'Wheat' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'coffee', label: 'Coffee' },
    { value: 'tea', label: 'Tea' },
    { value: 'sugarcane', label: 'Sugarcane' },
    { value: 'cotton', label: 'Cotton' },
  ];

  const farmingMethodOptions = [
    { value: 'organic', label: 'Organic' },
    { value: 'conventional', label: 'Conventional' },
    { value: 'permaculture', label: 'Permaculture' },
    { value: 'hydroponics', label: 'Hydroponics' },
    { value: 'agroforestry', label: 'Agroforestry' },
    { value: 'sustainable_agriculture', label: 'Sustainable Agriculture' },
  ];

  const kenyanCounties = [
    'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 'Homa Bay',
    'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii',
    'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
    'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi',
    'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River',
    'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfileImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await apiCall('POST', '/upload/profile-image', formData, {
      'Content-Type': 'multipart/form-data',
    });
    
    return (response as UploadResponse).data.secure_url || (response as UploadResponse).data.url;
  };

  const validateStep = async (stepNumber: number): Promise<boolean> => {
    switch (stepNumber) {
      case 1:
        return await form.trigger(['firstName', 'lastName', 'email', 'phoneNumber', 'password', 'confirmPassword']);
      case 2:
        return await form.trigger(['farmName', 'description', 'farmSize', 'farmingType', 'cropTypes', 'farmingMethods', 'establishedYear']);
      case 3:
        return await form.trigger(['county', 'subCounty', 'village']);
      case 4:
        return await form.trigger(['contactPhone', 'contactEmail']);
      default:
        return true;
    }
  };

  const nextStep = async () => {
    const isValid = await validateStep(step);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const onSubmit = async (values: FormData) => {
    try {
      setIsSubmitting(true);

      // Upload profile image if provided
      let avatarUrl = '';
      if (profileImage) {
        avatarUrl = await uploadProfileImage(profileImage);
      }

      // Create user account
      const userResponse = await signUp({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        password: values.password,
        role: 'farmer',
        avatar: avatarUrl,
      } as SignUpDataWithAvatar);

      // Create detailed farmer profile
      const profileData = {
        farmName: values.farmName,
        description: values.description,
        farmSize: values.farmSize,
        farmingType: values.farmingType,
        cropTypes: values.cropTypes,
        farmingMethods: values.farmingMethods,
        establishedYear: values.establishedYear,
        location: {
          county: values.county,
          subCounty: values.subCounty,
          village: values.village,
          coordinates: values.coordinates,
        },
        contactInfo: {
          phone: values.contactPhone,
          email: values.contactEmail,
          website: values.website || '',
        },
        socialMedia: values.socialMedia,
        verificationStatus: 'pending',
        isActive: true,
      };

      await apiCall('PUT', '/farmers/me', profileData);

      toast({
        title: "Registration Successful!",
        description: "Welcome to our farming community. Your profile is now complete and ready for verification.",
      });

      navigate('/farmer/dashboard', { replace: true });

    } catch (error: unknown) {
      console.error('Registration failed:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      if (apiError.response?.data?.message) {
        errorMessage = apiError.response.data.message;
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (step / 5) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-farmer-primary">
              Farmer Registration
            </CardTitle>
            <CardDescription>
              Step {step} of 5 - Complete your farmer profile
            </CardDescription>
            <Progress value={progress} className="w-full mt-4" />
          </CardHeader>
          
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <User className="h-5 w-5 text-farmer-primary" />
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        {...form.register('firstName')}
                        placeholder="John"
                      />
                      {form.formState.errors.firstName && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        {...form.register('lastName')}
                        placeholder="Doe"
                      />
                      {form.formState.errors.lastName && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register('email')}
                      placeholder="john@example.com"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      {...form.register('phoneNumber')}
                      placeholder="+254 700 000 000"
                    />
                    {form.formState.errors.phoneNumber && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.phoneNumber.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      {...form.register('password')}
                      placeholder="••••••••"
                    />
                    {form.formState.errors.password && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...form.register('confirmPassword')}
                      placeholder="••••••••"
                    />
                    {form.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Farm Details */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Briefcase className="h-5 w-5 text-farmer-primary" />
                    <h3 className="text-lg font-semibold">Farm Details</h3>
                  </div>
                  
                  <div>
                    <Label htmlFor="farmName">Farm Name</Label>
                    <Input
                      id="farmName"
                      {...form.register('farmName')}
                      placeholder="Green Valley Farm"
                    />
                    {form.formState.errors.farmName && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.farmName.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Farm Description</Label>
                    <Textarea
                      id="description"
                      {...form.register('description')}
                      placeholder="Describe your farm, farming practices, and what makes it unique..."
                      rows={4}
                    />
                    {form.formState.errors.description && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="farmSizeValue">Farm Size</Label>
                      <Input
                        id="farmSizeValue"
                        type="number"
                        step="0.1"
                        min="0.1"
                        {...form.register('farmSize.value', { valueAsNumber: true })}
                        placeholder="5.0"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="farmSizeUnit">Unit</Label>
                      <Select 
                        onValueChange={(value) => form.setValue('farmSize.unit', value as 'acres' | 'hectares')}
                        defaultValue="acres"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="acres">Acres</SelectItem>
                          <SelectItem value="hectares">Hectares</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Farming Type (Select all that apply)</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {farmingTypeOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`farming-type-${option.value}`}
                            onCheckedChange={(checked) => {
                              const current = form.getValues('farmingType');
                              if (checked) {
                                form.setValue('farmingType', [...current, option.value]);
                              } else {
                                form.setValue('farmingType', current.filter(t => t !== option.value));
                              }
                            }}
                          />
                          <Label htmlFor={`farming-type-${option.value}`} className="text-sm">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {form.formState.errors.farmingType && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.farmingType.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label>Crop Types (Select all that apply)</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {cropTypeOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`crop-type-${option.value}`}
                            onCheckedChange={(checked) => {
                              const current = form.getValues('cropTypes');
                              if (checked) {
                                form.setValue('cropTypes', [...current, option.value]);
                              } else {
                                form.setValue('cropTypes', current.filter(t => t !== option.value));
                              }
                            }}
                          />
                          <Label htmlFor={`crop-type-${option.value}`} className="text-sm">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {form.formState.errors.cropTypes && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.cropTypes.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label>Farming Methods (Select all that apply)</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {farmingMethodOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`farming-method-${option.value}`}
                            onCheckedChange={(checked) => {
                              const current = form.getValues('farmingMethods');
                              if (checked) {
                                form.setValue('farmingMethods', [...current, option.value]);
                              } else {
                                form.setValue('farmingMethods', current.filter(t => t !== option.value));
                              }
                            }}
                          />
                          <Label htmlFor={`farming-method-${option.value}`} className="text-sm">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {form.formState.errors.farmingMethods && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.farmingMethods.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="establishedYear">Year Farm Established</Label>
                    <Input
                      id="establishedYear"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      {...form.register('establishedYear', { valueAsNumber: true })}
                      placeholder={new Date().getFullYear().toString()}
                    />
                    {form.formState.errors.establishedYear && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.establishedYear.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Location */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <MapPin className="h-5 w-5 text-farmer-primary" />
                    <h3 className="text-lg font-semibold">Farm Location</h3>
                  </div>
                  
                  <div>
                    <Label htmlFor="county">County</Label>
                    <Select onValueChange={(value) => form.setValue('county', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select county" />
                      </SelectTrigger>
                      <SelectContent>
                        {kenyanCounties.map((county) => (
                          <SelectItem key={county} value={county}>
                            {county}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.county && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.county.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="subCounty">Sub-County</Label>
                    <Input
                      id="subCounty"
                      {...form.register('subCounty')}
                      placeholder="Enter sub-county"
                    />
                    {form.formState.errors.subCounty && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.subCounty.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="village">Village/Area</Label>
                    <Input
                      id="village"
                      {...form.register('village')}
                      placeholder="Enter village or area name"
                    />
                    {form.formState.errors.village && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.village.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Contact Information */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Camera className="h-5 w-5 text-farmer-primary" />
                    <h3 className="text-lg font-semibold">Contact & Social</h3>
                  </div>
                  
                  <div>
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      {...form.register('contactPhone')}
                      placeholder="+254 700 000 000"
                    />
                    {form.formState.errors.contactPhone && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.contactPhone.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      {...form.register('contactEmail')}
                      placeholder="contact@farm.com"
                    />
                    {form.formState.errors.contactEmail && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.contactEmail.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                      id="website"
                      {...form.register('website')}
                      placeholder="https://yourfarm.com"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        {...form.register('socialMedia.facebook')}
                        placeholder="Facebook page"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        {...form.register('socialMedia.twitter')}
                        placeholder="@username"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        {...form.register('socialMedia.instagram')}
                        placeholder="@username"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Profile Picture */}
              {step === 5 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Image className="h-5 w-5 text-farmer-primary" />
                    <h3 className="text-lg font-semibold">Profile Picture</h3>
                  </div>
                  
                  <div className="text-center">
                    <div className="mb-4">
                      {profileImagePreview ? (
                        <img
                          src={profileImagePreview}
                          alt="Profile preview"
                          className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-farmer-primary"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full mx-auto bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                          <Camera className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="profile-upload"
                      />
                      <Label
                        htmlFor="profile-upload"
                        className="inline-flex items-center px-4 py-2 bg-farmer-primary text-white rounded-md cursor-pointer hover:bg-farmer-primary/90"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Profile Picture
                      </Label>
                    </div>
                    
                    <p className="text-sm text-gray-500 mt-2">
                      Upload a clear photo of yourself (optional). This helps adopters connect with you personally.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Ready to Launch!</h4>
                    <p className="text-green-700 text-sm">
                      Your complete farmer profile will be submitted for verification. Once approved, 
                      you'll be visible to potential adopters and can start receiving support.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                )}
                
                {step < 5 ? (
                  <Button type="button" onClick={nextStep} className="ml-auto">
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="ml-auto bg-farmer-primary hover:bg-farmer-primary/90"
                  >
                    {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-farmer-primary hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FarmerRegistration;