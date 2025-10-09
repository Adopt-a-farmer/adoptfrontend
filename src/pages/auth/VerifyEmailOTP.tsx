import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { authService } from '@/services/auth';

// Resend OTP Button with Countdown Timer
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
      setCountdown(60); // Start 60 second countdown
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

const VerifyEmailOTP = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const initialToken = searchParams.get('token') || '';
  
  const [otp, setOtp] = useState('');
  const [token, setToken] = useState(initialToken);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      await authService.verifyOTP(email, otp, token);
      
      toast({
        title: 'Email Verified!',
        description: 'Your email has been successfully verified. You can now sign in.',
      });
      
      // Redirect to login after 1 second
      setTimeout(() => {
        navigate('/auth/login');
      }, 1000);
      
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      setErrorMessage(apiError?.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const response = await authService.resendOTP(email, token);
      
      // Update token if backend sends a new one
      if (response.token) {
        setToken(response.token);
      }
      
      toast({
        title: 'Code Resent',
        description: 'A new verification code has been sent to your email',
      });
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Resend Failed',
        description: apiError?.response?.data?.message || 'Failed to resend verification code',
        variant: 'destructive'
      });
    }
  };

  if (!email || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-600">Invalid Verification Link</CardTitle>
            <CardDescription>
              This verification link is invalid or incomplete
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Please try logging in again or request a new verification code.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/auth/login" className="w-full">
              <Button className="w-full bg-farmer-primary hover:bg-farmer-primary/90">
                Go to Sign In
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-farmer-primary">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to<br />
            <span className="font-medium">{email}</span>
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleVerify}>
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

            <Button 
              type="submit"
              className="w-full bg-farmer-primary hover:bg-farmer-primary/90" 
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Email
                  <ShieldCheck className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="text-center pt-2">
              <ResendButton onResend={handleResend} disabled={isLoading} />
            </div>
          </CardContent>
        </form>
        
        <CardFooter className="flex flex-col space-y-2">
          <Link 
            to="/auth/login" 
            className="flex items-center justify-center text-sm text-gray-500 hover:text-farmer-primary w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmailOTP;
