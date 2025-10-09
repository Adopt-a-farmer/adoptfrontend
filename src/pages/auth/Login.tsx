
import React, { useEffect, useState } from 'react';
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

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const Login = () => {
  const { signIn, user, loading: isLoading, isAuthenticated } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/auth/register" className="text-farmer-primary hover:underline">
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
