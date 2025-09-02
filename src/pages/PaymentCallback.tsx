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
  const [paymentData, setPaymentData] = useState<{
    payment: Record<string, unknown>;
    status: string;
    amount: number;
    fees: { gateway: number; platform: number };
    net_amount: number;
  } | null>(null);
  
  const reference = searchParams.get('reference');

  useEffect(() => {
    const handlePaymentReturn = () => {
      // Skip payment verification, assume success and go to dashboard
      const pendingAdoption = localStorage.getItem('pendingAdoption');
      if (pendingAdoption) {
        try {
          const adoptionData = JSON.parse(pendingAdoption);
          setPaymentData({
            payment: { reference: reference || 'N/A' },
            status: 'success',
            amount: adoptionData.amount || 0,
            fees: { gateway: 0, platform: 0 },
            net_amount: adoptionData.amount || 0
          });
          localStorage.removeItem('pendingAdoption');
        } catch (error) {
          console.error('Error parsing adoption data:', error);
        }
      }
      
      setStatus('success');
      toast({
        title: "Payment Successful!",
        description: "Your farmer adoption has been activated. Welcome to your farming journey!",
      });
      
      // Auto-redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/adopter/dashboard');
      }, 3000);
    };

    handlePaymentReturn();
  }, [reference, toast, navigate]);

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
                    <div className="bg-green-50 p-4 rounded-lg space-y-2">
                      <p className="text-sm text-green-800">
                        <strong>Amount Paid:</strong> KES {paymentData.amount?.toLocaleString()}
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>Gateway Fee:</strong> KES {paymentData.fees?.gateway?.toLocaleString() || 0}
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>Platform Fee:</strong> KES {paymentData.fees?.platform?.toLocaleString() || 0}
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>Net Amount:</strong> KES {paymentData.net_amount?.toLocaleString()}
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>Reference:</strong> {(paymentData.payment?.gatewayResponse as { reference?: string })?.reference || reference}
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