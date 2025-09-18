import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Phone, 
  Lock, 
  User, 
  UserCheck, 
  Upload, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { authService } from '@/services/auth';

interface SignupData {
  // Basic details
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'farmer' | 'expert' | 'adopter';
  
  // OTP verification
  otp: string;
  
  // Personal details
  firstName: string;
  lastName: string;
  
  // Farmer specific
  farmName?: string;
  farmingType?: string;
  farmSize?: number;
  location?: {
    city: string;
    state: string;
    address: string;
  };
  
  // Expert specific
  specializations?: string[];
  bio?: string;
  experience?: number;
  hourlyRate?: number;
  
  // Documents
  documents?: File[];
}

const SignupFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [signupData, setSignupData] = useState<SignupData>({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'farmer',
    otp: '',
    firstName: '',
    lastName: '',
    location: { city: '', state: '', address: '' },
    specializations: [],
    documents: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const steps = [
    { number: 1, title: 'Basic Details', description: 'Email, phone and password' },
    { number: 2, title: 'Verify Email', description: 'Enter OTP sent to your email' },
    { number: 3, title: 'Personal Info', description: 'Complete your profile' },
    { number: 4, title: 'Role Details', description: 'Role-specific information' },
    { number: 5, title: 'Documents', description: 'Upload verification documents' }
  ];

  const updateSignupData = (field: keyof SignupData, value: string | number | string[] | File[]) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
  };

  const updateLocationData = (field: string, value: string) => {
    setSignupData(prev => ({
      ...prev,
      location: { ...prev.location!, [field]: value }
    }));
  };

  const validateStep1 = () => {
    const { firstName, lastName, email, phone, password, confirmPassword, role } = signupData;
    
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword || !role) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return false;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match',
        variant: 'destructive'
      });
      return false;
    }
    
    if (password.length < 8) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive'
      });
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return false;
    }
    
    return true;
  };

  const sendOTP = async () => {
    if (!validateStep1()) return;
    
    console.log('🚀 Sending OTP with user data:', {
      firstName: signupData.firstName,
      lastName: signupData.lastName,
      email: signupData.email,
      phone: signupData.phone,
      role: signupData.role,
      passwordLength: signupData.password ? signupData.password.length : 0
    });
    
    setIsLoading(true);
    try {
      const userData = {
        email: signupData.email,
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        phone: signupData.phone,
        password: signupData.password,
        role: signupData.role
      };
      
      console.log('📧 Making OTP request to backend...');
      const response = await authService.sendOTP(userData.email, userData);
      
      console.log('✅ OTP Response received:', response);
      
      setVerificationToken(response.token);
      setOtpSent(true);
      setCurrentStep(2);
      
      toast({
        title: 'OTP Sent Successfully!',
        description: `Verification code sent to ${signupData.email}. Please check your email.`,
      });
      
      console.log('🎯 Redirected to OTP verification step');
    } catch (error: unknown) {
      console.error('❌ OTP sending failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
      const apiError = error as { response?: { data?: { message?: string } } };
      const finalMessage = apiError?.response?.data?.message || errorMessage;
      
      console.error('📧 Email sending error details:', {
        errorMessage,
        apiError: apiError?.response?.data,
        finalMessage
      });
      
      toast({
        title: 'Email Sending Failed',
        description: finalMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!signupData.otp || signupData.otp.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter the 6-digit verification code',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await authService.verifyOTP(signupData.email, signupData.otp, verificationToken);
      setCurrentStep(3);
      
      toast({
        title: 'Email Verified',
        description: 'Your email has been successfully verified',
      });
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Verification Failed',
        description: apiError?.response?.data?.message || 'Invalid OTP',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completeRegistration = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      
      // Add basic data
      Object.keys(signupData).forEach(key => {
        if (key === 'documents') return;
        if (key === 'location') {
          formData.append('location', JSON.stringify(signupData.location));
        } else if (key === 'specializations') {
          formData.append('specializations', JSON.stringify(signupData.specializations));
        } else {
          const value = signupData[key as keyof SignupData];
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        }
      });
      
      // Add documents
      signupData.documents?.forEach((file, index) => {
        formData.append(`documents`, file);
      });
      
      const response = await authService.completeSignup(formData);
      
      toast({
        title: 'Registration Complete',
        description: 'Your account has been created successfully. Please wait for verification.',
      });
      
      // Navigate based on role and status
      if (signupData.role === 'adopter') {
        navigate('/adopter/dashboard');
      } else if (signupData.role === 'farmer') {
        navigate('/farmer/dashboard');
      } else {
        navigate('/expert/dashboard');
      }
      
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Registration Failed',
        description: apiError?.response?.data?.message || 'Failed to complete registration',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Create Your Account</h2>
        <p className="text-gray-600 mt-2">Let's start with your personal information</p>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={signupData.firstName}
                onChange={(e) => updateSignupData('firstName', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={signupData.lastName}
                onChange={(e) => updateSignupData('lastName', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
        
        <div>
          <Label htmlFor="role">I want to register as:</Label>
          <Select value={signupData.role} onValueChange={(value: 'farmer' | 'expert' | 'adopter') => updateSignupData('role', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="farmer">Farmer</SelectItem>
              <SelectItem value="expert">Agricultural Expert</SelectItem>
              <SelectItem value="adopter">Adopter</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="email">Email Address</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={signupData.email}
              onChange={(e) => updateSignupData('email', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative mt-1">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={signupData.phone}
              onChange={(e) => updateSignupData('phone', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={signupData.password}
              onChange={(e) => updateSignupData('password', e.target.value)}
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={signupData.confirmPassword}
              onChange={(e) => updateSignupData('confirmPassword', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>
      
      <Button 
        onClick={sendOTP} 
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold">Verify Your Email</h2>
        <p className="text-gray-600 mt-2">
          We've sent a 6-digit verification code to<br />
          <span className="font-medium">{signupData.email}</span>
        </p>
      </div>
      
      <div>
        <Label htmlFor="otp">Verification Code</Label>
        <Input
          id="otp"
          type="text"
          placeholder="Enter 6-digit code"
          value={signupData.otp}
          onChange={(e) => updateSignupData('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="text-center text-lg tracking-widest font-mono mt-1"
          maxLength={6}
        />
      </div>
      
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(1)}
          className="flex-1"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={verifyOTP} 
          className="flex-1"
          disabled={isLoading || signupData.otp.length !== 6}
        >
          {isLoading ? 'Verifying...' : 'Verify Email'}
          <ShieldCheck className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="text-center">
        <button
          onClick={sendOTP}
          className="text-sm text-blue-600 hover:underline"
          disabled={isLoading}
        >
          Didn't receive the code? Resend
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">Personal Information</h2>
        <p className="text-gray-600 mt-2">Tell us a bit about yourself</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="John"
            value={signupData.firstName}
            onChange={(e) => updateSignupData('firstName', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Doe"
            value={signupData.lastName}
            onChange={(e) => updateSignupData('lastName', e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="123 Main Street"
          value={signupData.location?.address}
          onChange={(e) => updateLocationData('address', e.target.value)}
          className="mt-1"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="New York"
            value={signupData.location?.city}
            onChange={(e) => updateLocationData('city', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            placeholder="NY"
            value={signupData.location?.state}
            onChange={(e) => updateLocationData('state', e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(2)}
          className="flex-1"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={() => setCurrentStep(4)} 
          className="flex-1"
          disabled={!signupData.firstName || !signupData.lastName}
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => {
    if (signupData.role === 'adopter') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <UserCheck className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold">Almost Done!</h2>
            <p className="text-gray-600 mt-2">As an adopter, you're ready to start supporting farmers</p>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(3)}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              onClick={completeRegistration} 
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
              <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            {signupData.role === 'farmer' ? 'Farm Information' : 'Expert Details'}
          </h2>
          <p className="text-gray-600 mt-2">
            {signupData.role === 'farmer' 
              ? 'Tell us about your farming operation' 
              : 'Share your expertise and experience'
            }
          </p>
        </div>
        
        {signupData.role === 'farmer' ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="farmName">Farm Name</Label>
              <Input
                id="farmName"
                placeholder="Green Valley Farm"
                value={signupData.farmName}
                onChange={(e) => updateSignupData('farmName', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="farmingType">Type of Farming</Label>
              <Select value={signupData.farmingType} onValueChange={(value) => updateSignupData('farmingType', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select farming type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crop">Crop Farming</SelectItem>
                  <SelectItem value="livestock">Livestock</SelectItem>
                  <SelectItem value="dairy">Dairy Farming</SelectItem>
                  <SelectItem value="poultry">Poultry</SelectItem>
                  <SelectItem value="mixed">Mixed Farming</SelectItem>
                  <SelectItem value="organic">Organic Farming</SelectItem>
                  <SelectItem value="aquaculture">Aquaculture</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="farmSize">Farm Size (acres)</Label>
              <Input
                id="farmSize"
                type="number"
                placeholder="50"
                value={signupData.farmSize}
                onChange={(e) => updateSignupData('farmSize', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="specializations">Specializations</Label>
              <Select 
                value={signupData.specializations?.[0] || ''} 
                onValueChange={(value) => updateSignupData('specializations', [value])}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crop_management">Crop Management</SelectItem>
                  <SelectItem value="livestock_care">Livestock Care</SelectItem>
                  <SelectItem value="soil_health">Soil Health</SelectItem>
                  <SelectItem value="pest_control">Pest Control</SelectItem>
                  <SelectItem value="irrigation">Irrigation</SelectItem>
                  <SelectItem value="organic_farming">Organic Farming</SelectItem>
                  <SelectItem value="sustainable_practices">Sustainable Practices</SelectItem>
                  <SelectItem value="marketing">Agricultural Marketing</SelectItem>
                  <SelectItem value="financial_planning">Financial Planning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                placeholder="10"
                value={signupData.experience}
                onChange={(e) => updateSignupData('experience', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
              <Input
                id="hourlyRate"
                type="number"
                placeholder="50"
                value={signupData.hourlyRate}
                onChange={(e) => updateSignupData('hourlyRate', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about your expertise and experience..."
                value={signupData.bio}
                onChange={(e) => updateSignupData('bio', e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
        )}
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(3)}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={() => setCurrentStep(5)} 
            className="flex-1"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Upload className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold">Upload Documents</h2>
        <p className="text-gray-600 mt-2">
          {signupData.role === 'adopter' 
            ? 'No documents required for adopters' 
            : 'Upload verification documents (ID, certificates, etc.)'
          }
        </p>
      </div>
      
      {signupData.role !== 'adopter' && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">Drop files here or click to browse</p>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              updateSignupData('documents', files);
            }}
            className="hidden"
            id="documents"
          />
          <label htmlFor="documents">
            <Button variant="outline" className="cursor-pointer">
              Choose Files
            </Button>
          </label>
          
          {signupData.documents && signupData.documents.length > 0 && (
            <div className="mt-4 text-left">
              <p className="font-medium mb-2">Selected files:</p>
              {signupData.documents.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{file.name}</span>
                  <Badge variant="secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(4)}
          className="flex-1"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={completeRegistration} 
          className="flex-1"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Complete Registration'}
          <CheckCircle className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.slice(0, signupData.role === 'adopter' ? 4 : 5).map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step.number 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }`}>
                  {currentStep > step.number ? <CheckCircle className="h-4 w-4" /> : step.number}
                </div>
                {index < (signupData.role === 'adopter' ? 3 : 4) && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-center">
            <p className="text-sm font-medium text-gray-900">
              {steps[currentStep - 1]?.title}
            </p>
            <p className="text-xs text-gray-500">
              {steps[currentStep - 1]?.description}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl">
          <CardContent className="p-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button 
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:underline font-medium"
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupFlow;