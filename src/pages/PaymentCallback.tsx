import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { apiCall } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [paymentData, setPaymentData] = useState<unknown>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference');
      
      if (!reference) {
        setStatus('failed');
        return;
      }

      try {
        const response = await apiCall<{ success: boolean; data: { status: string; amount: number; payment: Record<string, unknown> } }>('POST', '/payments/verify', {
          reference
        });

        if (response.success && response.data.status === 'success') {
          setStatus('success');
          setPaymentData(response.data);
          toast({
            title: "Payment Successful!",
            description: "Your farmer adoption has been activated.",
          });
        } else {
          setStatus('failed');
          toast({
            title: "Payment Failed",
            description: "Your payment could not be processed.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('failed');
        toast({
          title: "Payment Verification Failed",
          description: "Unable to verify payment status.",
          variant: "destructive",
        });
      }
    };

    verifyPayment();
  }, [searchParams, toast]);

  const handleContinue = () => {
    if (status === 'success') {
      navigate('/adopter/dashboard');
    } else {
      navigate('/adopter/farmers');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>
                {status === 'loading' && (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin text-farmer-primary" />
                    <span>Verifying Payment...</span>
                  </div>
                )}
                {status === 'success' && (
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <CheckCircle className="h-6 w-6" />
                    <span>Payment Successful!</span>
                  </div>
                )}
                {status === 'failed' && (
                  <div className="flex items-center justify-center space-x-2 text-red-600">
                    <XCircle className="h-6 w-6" />
                    <span>Payment Failed</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              {status === 'loading' && (
                <p className="text-gray-600">
                  Please wait while we verify your payment...
                </p>
              )}
              
              {status === 'success' && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Your payment has been successfully processed. Thank you for supporting our farmers!
                  </p>
                  {paymentData && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-800">
                        Amount: KES {(paymentData as { amount?: number })?.amount?.toLocaleString()}
                      </p>
                      <p className="text-sm text-green-800">
                        Reference: {(paymentData as { reference?: string })?.reference}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {status === 'failed' && (
                <p className="text-gray-600">
                  We couldn't process your payment. Please try again or contact support.
                </p>
              )}
              
              <Button 
                onClick={handleContinue}
                className="w-full bg-farmer-primary hover:bg-farmer-primary/90"
              >
                {status === 'success' ? 'Continue Browsing' : 'Go Home'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentCallback;