import React, { useState, useEffect } from 'react';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Mail, ShieldCheck, Lock, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { apiCall } from '@/services/api';

const emailSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

const otpSchema = z.object({
  otp: z.string().length(6, { message: 'OTP must be 6 digits.' }),
});

const passwordSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Resend OTP Button with Countdown
const ResendButton = ({ onResend, disabled }: { onResend: () => Promise<void>; disabled: boolean }) => {
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await onResend();
      setCountdown(60);
    } finally {
      setIsResending(false);
    }
  };

  if (countdown > 0) {
    return (
      <p className="text-sm text-gray-500">
        Resend code in <span className="font-semibold text-farmer-primary">{countdown}s</span>
      </p>
    );
  }

  return (
    <button
      onClick={handleResend}
      className="text-sm text-farmer-primary hover:underline disabled:text-gray-400 disabled:no-underline font-medium"
      disabled={disabled || isResending}
    >
      {isResending ? 'Sending...' : "Didn't receive the code? Resend"}
    </button>
  );
};

const ForgotPassword = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  // Step 1: Request password reset OTP
  const onSubmitEmail = async (values: z.infer<typeof emailSchema>) => {
    setErrorMessage(null);
    setIsLoading(true);
    
    try {
      const response = await apiCall<{ success: boolean; message: string; token: string }>('POST', '/auth/forgot-password', { 
        email: values.email 
      });
      
      setEmail(values.email);
      setOtpToken(response.token);
      setStep(2);
      
      toast({
        title: 'Code Sent',
        description: `A password reset code has been sent to ${values.email}`,
      });
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      setErrorMessage(apiError?.response?.data?.message || 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    
    try {
      const response = await apiCall<{ success: boolean; message: string; resetToken: string }>('POST', '/auth/verify-reset-otp', {
        email,
        otp,
        token: otpToken
      });
      
      setResetToken(response.resetToken);
      setStep(3);
      
      toast({
        title: 'Code Verified',
        description: 'Please enter your new password',
      });
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      setErrorMessage(apiError?.response?.data?.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password
  const onSubmitPassword = async (values: z.infer<typeof passwordSchema>) => {
    setErrorMessage(null);
    setIsLoading(true);
    
    try {
      await apiCall<{ success: boolean; message: string }>('POST', '/auth/reset-password', {
        resetToken,
        newPassword: values.password
      });
      
      toast({
        title: 'Password Reset Successful',
        description: 'You can now sign in with your new password',
      });
      
      setTimeout(() => {
        navigate('/auth/login');
      }, 1500);
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      setErrorMessage(apiError?.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    try {
      const response = await apiCall<{ success: boolean; message: string; token: string }>('POST', '/auth/forgot-password', { 
        email 
      });
      
      setOtpToken(response.token);
      
      toast({
        title: 'Code Resent',
        description: 'A new verification code has been sent to your email',
      });
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Resend Failed',
        description: apiError?.response?.data?.message || 'Failed to resend code',
        variant: 'destructive'
      });
    }
  };

  // Step 1: Enter Email
  if (step === 1) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-farmer-primary">Reset Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a verification code
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-farmer-primary hover:bg-farmer-primary/90" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Verification Code
                      <Mail className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Link 
              to="/auth/login" 
              className="flex items-center justify-center text-sm text-gray-500 hover:text-farmer-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Step 2: Verify OTP
  if (step === 2) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-farmer-primary">Enter Verification Code</CardTitle>
            <CardDescription>
              We've sent a 6-digit code to<br />
              <span className="font-medium">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            <div>
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-lg tracking-widest font-mono mt-1"
                maxLength={6}
                autoFocus
              />
            </div>

            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={handleVerifyOTP}
                className="flex-1 bg-farmer-primary hover:bg-farmer-primary/90" 
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </Button>
            </div>

            <div className="text-center pt-2">
              <ResendButton onResend={handleResendOTP} disabled={isLoading} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 3: Set New Password
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-farmer-primary">Set New Password</CardTitle>
          <CardDescription>
            Choose a strong password for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-farmer-primary hover:bg-farmer-primary/90" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    Reset Password
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;