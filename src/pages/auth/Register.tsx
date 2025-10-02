
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { authService, RegisterData } from '@/services/auth';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { DocumentUpload } from '@/components/ui/DocumentUpload';

// Kenya counties and sub-counties
const kenyaLocations = {
  "Nairobi": ["Dagoretti North", "Dagoretti South", "Embakasi Central", "Embakasi East", "Embakasi North", "Embakasi South", "Embakasi West", "Kamukunji", "Kasarani", "Kibra", "Langata", "Makadara", "Mathare", "Roysambu", "Ruaraka", "Starehe", "Westlands"],
  "Kiambu": ["Gatundu North", "Gatundu South", "Juja", "Thika Town", "Ruiru", "Githunguri", "Kiambu", "Kiambaa", "Kabete", "Kikuyu", "Limuru", "Lari"],
  "Nakuru": ["Nakuru Town East", "Nakuru Town West", "Bahati", "Gilgil", "Naivasha", "Kuresoi North", "Kuresoi South", "Subukia", "Rongai", "Molo", "Njoro"],
  "Machakos": ["Machakos Town", "Yatta", "Kangundo", "Matungulu", "Kathiani", "Mavoko", "Masinga", "Mwala"],
  "Kakamega": ["Lugari", "Likuyani", "Malava", "Lurambi", "Navakholo", "Mumias West", "Mumias East", "Matungu", "Butere", "Khwisero", "Shinyalu", "Ikolomani"],
  "Kisumu": ["Kisumu East", "Kisumu West", "Kisumu Central", "Seme", "Nyando", "Muhoroni", "Nyakach"],
  "Uasin Gishu": ["Turbo", "Moiben", "Soy", "Kapseret", "Kesses", "Ainabkoi"],
  "Meru": ["Igembe South", "Igembe Central", "Igembe North", "Tigania West", "Tigania East", "North Imenti", "Buuri", "Central Imenti", "South Imenti"],
  "Nyeri": ["Tetu", "Kieni", "Mathira", "Othaya", "Mukurweini", "Nyeri Town"],
  "Embu": ["Manyatta", "Runyenjes", "Mbeere South", "Mbeere North"]
};

// Farming options
const farmingTypes = ['crop', 'mixed', 'aquaculture', 'apiary'];
const cropTypes = ['maize', 'beans', 'rice', 'wheat', 'vegetables', 'fruits', 'coffee', 'tea', 'sugarcane', 'cotton', 'sunflower', 'sorghum', 'millet'];
const farmingMethods = ['organic', 'conventional', 'permaculture', 'hydroponics', 'agroforestry', 'conservation_agriculture', 'precision_farming', 'sustainable_agriculture'];

const formSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phoneNumber: z.string().min(10, { message: 'Phone number must be at least 10 characters.' }),
  password: z.string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
  role: z.enum(['farmer', 'adopter', 'expert'], {
    required_error: 'Please select your role.',
  }),
  // Farmer-specific fields (optional for non-farmers)
  farmName: z.string().optional(),
  description: z.string().optional(),
  county: z.string().optional(),
  subCounty: z.string().optional(),
  village: z.string().optional(),
  farmSize: z.string().optional(),
  farmSizeUnit: z.enum(['acres', 'hectares']).optional(),
  establishedYear: z.string().optional(),
  farmingType: z.array(z.string()).optional(),
  cropTypes: z.array(z.string()).optional(),
  farmingMethods: z.array(z.string()).optional(),
  website: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  // Validate farmer-specific fields only if role is farmer
  if (data.role === 'farmer') {
    return !!(data.farmName && data.description && data.county && data.subCounty && data.farmSize && data.farmingType?.length);
  }
  return true;
}, {
  message: "All farm details are required for farmers",
  path: ["farmName"],
});

const Register = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedFarmingTypes, setSelectedFarmingTypes] = useState<string[]>([]);
  const [selectedCropTypes, setSelectedCropTypes] = useState<string[]>([]);
  const [selectedFarmingMethods, setSelectedFarmingMethods] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<{ url: string; publicId?: string } | null>(null);
  const [expertDocuments, setExpertDocuments] = useState<any[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      role: undefined,
      // Farmer fields
      farmName: '',
      description: '',
      county: '',
      subCounty: '',
      village: '',
      farmSize: '',
      farmSizeUnit: 'acres',
      establishedYear: '',
      farmingType: [],
      cropTypes: [],
      farmingMethods: [],
      website: '',
      facebook: '',
      twitter: '',
      instagram: '',
    },
  });

  const watchedRole = form.watch('role');
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      console.log('Starting registration process...', { 
        email: values.email, 
        role: values.role,
        firstName: values.firstName,
        lastName: values.lastName 
      });
      
      // Prepare base signup data
      const signupData: Record<string, unknown> = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        password: values.password,
        role: values.role,
      };

      // Add profile image if provided
      if (profileImage) {
        signupData.profileImage = profileImage;
      }

      // Add farmer profile data if role is farmer
      if (values.role === 'farmer') {
        if (!values.farmName || !values.description || !values.county || !values.subCounty || !values.farmSize || !values.farmingType?.length) {
          toast({
            title: "Validation Error",
            description: "Please fill in all required farm details.",
            variant: "destructive",
          });
          return;
        }

        signupData.farmerProfile = {
          farmName: values.farmName,
          description: values.description,
          location: {
            county: values.county,
            subCounty: values.subCounty,
            village: values.village || '',
          },
          farmSize: {
            value: Number(values.farmSize),
            unit: values.farmSizeUnit || 'acres',
          },
          establishedYear: values.establishedYear ? Number(values.establishedYear) : undefined,
          farmingType: values.farmingType || [],
          cropTypes: values.cropTypes || [],
          farmingMethods: values.farmingMethods || [],
          contactInfo: {
            phone: values.phoneNumber,
            email: values.email,
            website: values.website || '',
          },
          socialMedia: {
            facebook: values.facebook || '',
            twitter: values.twitter || '',
            instagram: values.instagram || '',
          },
        };
      }
      
      // Use AuthContext signUp method
      const result = await signUp(signupData as RegisterData);
      
      console.log('Registration successful:', result);
      
      // Show success toast
      toast({
        title: "Registration Successful",
        description: values.role === 'farmer' 
          ? "Welcome! Your farm profile has been created and is pending admin approval. You'll be notified once verified."
          : values.role === 'expert'
          ? "Welcome! Your expert profile has been created and is pending admin approval. Please ensure you've uploaded verification documents."
          : "Welcome! You're being redirected to your dashboard.",
        variant: "default",
      });
      
      // Navigate based on user role after successful registration
      if (values.role === 'farmer') {
        navigate('/farmer/dashboard', { replace: true });
      } else if (values.role === 'adopter') {
        navigate('/adopter/dashboard', { replace: true });
      } else if (values.role === 'expert') {
        navigate('/expert/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
      
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
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArrayFieldToggle = (
    value: string,
    currentArray: string[],
    setter: (arr: string[]) => void,
    formField: string
  ) => {
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    setter(newArray);
    if (formField === 'farmingType') {
      form.setValue('farmingType', newArray);
    } else if (formField === 'cropTypes') {
      form.setValue('cropTypes', newArray);
    } else if (formField === 'farmingMethods') {
      form.setValue('farmingMethods', newArray);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>
            {watchedRole === 'farmer' 
              ? 'Set up your farmer profile to connect with adopters' 
              : 'Join our community and start supporting farmers'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[70vh] overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+254 712 345 678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>I am a</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="adopter">Adopter (Support farmers)</SelectItem>
                          <SelectItem value="farmer">Farmer (Get supported)</SelectItem>
                          <SelectItem value="expert">Expert (Provide guidance)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormDescription>
                          At least 6 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Farmer-specific fields */}
              {watchedRole === 'farmer' && (
                <>
                  {/* Farm Information */}
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-medium">Farm Information</h3>
                    
                    <FormField
                      control={form.control}
                      name="farmName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Farm Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Sunshine Organic Farm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Farm Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell adopters about your farm, what you grow, your farming practices, and what makes your farm special..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This will be shown to potential adopters. Be descriptive and highlight what makes your farm unique.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Profile Image Upload */}
                    <ImageUpload
                      label="Farm Profile Picture (Optional)"
                      description="Upload a representative image of your farm or yourself"
                      currentImage={profileImage?.url}
                      onImageUpload={setProfileImage}
                      onImageRemove={() => setProfileImage(null)}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="county"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>County</FormLabel>
                            <Select onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedCounty(value);
                              form.setValue('subCounty', ''); // Reset sub-county when county changes
                            }} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select county" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.keys(kenyaLocations).map((county) => (
                                  <SelectItem key={county} value={county}>
                                    {county}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subCounty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sub-County</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select sub-county" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {selectedCounty && kenyaLocations[selectedCounty as keyof typeof kenyaLocations]?.map((subCounty) => (
                                  <SelectItem key={subCounty} value={subCounty}>
                                    {subCounty}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="village"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Village/Area (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Kiganjo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="farmSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Farm Size</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1"
                                min="0.1"
                                placeholder="2.5" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="farmSizeUnit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="acres">Acres</SelectItem>
                                <SelectItem value="hectares">Hectares</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="establishedYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Established Year</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min="1900"
                                max={new Date().getFullYear()}
                                placeholder="2020" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Farming Details */}
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-medium">Farming Details</h3>
                    
                    <FormField
                      control={form.control}
                      name="farmingType"
                      render={() => (
                        <FormItem>
                          <FormLabel>Farming Type</FormLabel>
                          <FormDescription>Select all that apply to your farm</FormDescription>
                          <div className="flex flex-wrap gap-2">
                            {farmingTypes.map((type) => (
                              <Badge
                                key={type}
                                variant={selectedFarmingTypes.includes(type) ? "default" : "outline"}
                                className="cursor-pointer capitalize"
                                onClick={() => handleArrayFieldToggle(type, selectedFarmingTypes, setSelectedFarmingTypes, 'farmingType')}
                              >
                                {type}
                              </Badge>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cropTypes"
                      render={() => (
                        <FormItem>
                          <FormLabel>Crop Types (Optional)</FormLabel>
                          <FormDescription>What crops do you grow or plan to grow?</FormDescription>
                          <div className="flex flex-wrap gap-2">
                            {cropTypes.map((crop) => (
                              <Badge
                                key={crop}
                                variant={selectedCropTypes.includes(crop) ? "default" : "outline"}
                                className="cursor-pointer capitalize"
                                onClick={() => handleArrayFieldToggle(crop, selectedCropTypes, setSelectedCropTypes, 'cropTypes')}
                              >
                                {crop}
                              </Badge>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="farmingMethods"
                      render={() => (
                        <FormItem>
                          <FormLabel>Farming Methods (Optional)</FormLabel>
                          <FormDescription>What farming methods do you use?</FormDescription>
                          <div className="flex flex-wrap gap-2">
                            {farmingMethods.map((method) => (
                              <Badge
                                key={method}
                                variant={selectedFarmingMethods.includes(method) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => handleArrayFieldToggle(method, selectedFarmingMethods, setSelectedFarmingMethods, 'farmingMethods')}
                              >
                                {method.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Contact & Social Media */}
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-medium">Online Presence (Optional)</h3>
                    
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://your-farm-website.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="facebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook</FormLabel>
                            <FormControl>
                              <Input placeholder="facebook.com/yourfarm" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Twitter</FormLabel>
                            <FormControl>
                              <Input placeholder="@yourfarm" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram</FormLabel>
                            <FormControl>
                              <Input placeholder="@yourfarm" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Expert-specific fields */}
              {watchedRole === 'expert' && (
                <>
                  {/* Expert Information */}
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-medium">Expert Profile Information</h3>
                    
                    {/* Profile Image Upload */}
                    <ImageUpload
                      label="Profile Picture (Optional)"
                      description="Upload a professional photo of yourself"
                      currentImage={profileImage?.url}
                      onImageUpload={setProfileImage}
                      onImageRemove={() => setProfileImage(null)}
                    />

                    {/* Document Upload */}
                    <DocumentUpload
                      onDocumentsUpload={setExpertDocuments}
                      currentDocuments={expertDocuments}
                      onDocumentRemove={(index) => {
                        setExpertDocuments(prev => prev.filter((_, i) => i !== index));
                      }}
                    />

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Your expert profile will be pending approval. Please upload relevant documents such as:
                        <br />• Educational certificates/degrees
                        <br />• Professional certifications
                        <br />• Professional licenses
                        <br />• ID documents
                        <br />• Other verification documents
                      </p>
                    </div>
                  </div>
                </>
              )}
              
              <Button type="submit" className="w-full" disabled={isSubmitting || form.formState.isSubmitting}>
                {isSubmitting || form.formState.isSubmitting 
                  ? 'Creating account...' 
                  : watchedRole === 'farmer' 
                    ? 'Create Farm Profile' 
                    : 'Create Account'
                }
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-farmer-primary hover:underline">
              Sign in
            </Link>
          </div>
          <Link to="/" className="text-center text-sm text-gray-500 hover:underline">
            Back to home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
