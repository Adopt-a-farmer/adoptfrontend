
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth';

// Google OAuth types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              width?: number;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleUser {
  sub: string; // Google ID
  email: string;
  email_verified: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const Login = () => {
  const { signIn, user, loading: isLoading, isAuthenticated } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const redirectTo = queryParams.get('redirect');
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Decode JWT token to get user info
  const decodeJwt = (token: string): GoogleUser | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };

  // Handle Google Sign-In response
  const handleGoogleResponse = useCallback(async (response: { credential: string }) => {
    setIsGoogleLoading(true);
    setErrorMessage(null);

    try {
      const userData = decodeJwt(response.credential);
      
      if (!userData) {
        throw new Error('Failed to decode Google credentials');
      }

      console.log('Google user data:', {
        email: userData.email,
        name: userData.name,
        hasAvatar: !!userData.picture
      });

      // Call backend Google auth endpoint
      const authResponse = await authService.googleAuth({
        googleId: userData.sub,
        email: userData.email,
        firstName: userData.given_name || userData.name.split(' ')[0],
        lastName: userData.family_name || userData.name.split(' ').slice(1).join(' ') || '',
        avatar: userData.picture
      });

      if (authResponse.success) {
        // Store auth data
        const { token, refreshToken, user: authUser } = authResponse.data;
        localStorage.setItem('token', token);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(authUser));

        toast({
          title: authResponse.data.isNewUser ? 'Account Created!' : 'Welcome Back!',
          description: authResponse.data.requiresPhoneNumber 
            ? 'Please update your profile with your phone number.'
            : 'You have been signed in successfully.',
        });

        // Redirect based on role
        if (redirectTo) {
          navigate(redirectTo);
        } else if (authUser.role === 'farmer') {
          navigate('/farmer');
        } else if (authUser.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (authUser.role === 'expert') {
          navigate('/expert');
        } else {
          navigate('/adopter');
        }

        // Force page reload to update auth state
        window.location.reload();
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      const apiError = error as { response?: { data?: { message?: string } } };
      setErrorMessage(apiError?.response?.data?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  }, [navigate, redirectTo, toast]);

  // Initialize Google Sign-In
  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!googleClientId) {
      console.log('Google Client ID not configured - Google Sign-In disabled');
      return;
    }

    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleResponse,
        });

        const buttonContainer = document.getElementById('google-signin-button');
        if (buttonContainer) {
          window.google.accounts.id.renderButton(buttonContainer, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            width: 400,
          });
        }
      }
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [handleGoogleResponse]);

  // If already logged in, redirect appropriately
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        // Default redirect based on role
        if (user.role === 'farmer') {
          navigate('/farmer');
        } else if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/adopter');
        }
      }
    }
  }, [user, isLoading, isAuthenticated, navigate, redirectTo]);
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setErrorMessage(null);
    try {
      console.log('Attempting login with:', values.email);
      await signIn(values.email, values.password);
      
      // Navigation will be handled here since AuthContext doesn't navigate
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        console.log('Login successful, user role:', userData.role);
        
        // Navigate based on user role or redirect parameter
        if (redirectTo) {
          navigate(redirectTo);
        } else if (userData.role === 'farmer') {
          navigate('/farmer');
        } else if (userData.role === 'adopter') {
          navigate('/adopter');
        } else if (userData.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error: Error | unknown) {
      console.error('Login error:', error);
      
      // Check if error is for unverified email
      const apiError = error as { response?: { status?: number; data?: { requiresVerification?: boolean; token?: string; email?: string; message?: string } } };
      
      if (apiError?.response?.status === 403 && apiError?.response?.data?.requiresVerification) {
        // Redirect to email verification page with token
        const token = apiError.response.data.token;
        const email = apiError.response.data.email || values.email;
        
        toast({
          title: 'Email Verification Required',
          description: 'Please verify your email to continue. Check your inbox for the verification code.',
          variant: 'default'
        });
        
        navigate(`/auth/verify-email?email=${encodeURIComponent(email)}&token=${token}`);
        return;
      }
      
      const errorMessage = apiError?.response?.data?.message || (error instanceof Error ? error.message : 'An error occurred during login');
      setErrorMessage(errorMessage);
    }
  };

  // Don't show login form if already logged in
  if (isAuthenticated && user && !isLoading) {
    return null; // Component will redirect via useEffect
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-farmer-primary">Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="text-right">
                <Link 
                  to="/auth/forgot-password" 
                  className="text-sm text-farmer-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-farmer-primary hover:bg-farmer-primary/90" 
                disabled={form.formState.isSubmitting || isLoading}
              >
                {form.formState.isSubmitting || isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </Form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <div className="flex justify-center">
            {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
              <div id="google-signin-button" className="w-full flex justify-center">
                {isGoogleLoading && (
                  <Button variant="outline" className="w-full" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in with Google...
                  </Button>
                )}
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="w-full" 
                disabled
                title="Google Sign-In not configured"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google (Not Configured)
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-farmer-primary hover:underline">
              Sign up
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

export default Login;
