import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { contributionService } from '@/services/contribution';
import { toast } from 'sonner';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [paymentDetails, setPaymentDetails] = useState<{ payment?: { amount?: number; status?: string } } | null>(null);

  const reference = searchParams.get('reference');
  const trxref = searchParams.get('trxref');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference && !trxref) {
        setStatus('failed');
        toast.error('No payment reference found');
        return;
      }

      try {
        const paymentRef = reference || trxref;
        console.log('Verifying payment with reference:', paymentRef);

        const response = await contributionService.verifyContribution(paymentRef!);
        
        if (response.success && response.data?.verified) {
          setStatus('success');
          setPaymentDetails(response.data);
          toast.success('Payment successful! Your contribution has been processed.');
        } else {
          setStatus('failed');
          toast.error('Payment verification failed. Please contact support.');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('failed');
        toast.error('Failed to verify payment. Please contact support.');
      }
    };

    verifyPayment();
  }, [reference, trxref]);

  const handleContinue = () => {
    if (status === 'success') {
      navigate('/adopter/my-farmers');
    } else {
      navigate('/adopter/discover');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-16 w-16 text-green-600" />
            )}
            {status === 'failed' && (
              <XCircle className="h-16 w-16 text-red-600" />
            )}
          </div>
          <CardTitle className="text-xl">
            {status === 'loading' && 'Processing Payment...'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'failed' && 'Payment Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <p className="text-gray-600">
              Please wait while we verify your payment...
            </p>
          )}
          
          {status === 'success' && (
            <>
              <p className="text-gray-600">
                Your contribution has been successfully processed and the farmer has been notified.
              </p>
              {paymentDetails && (
                <div className="bg-green-50 p-4 rounded-lg text-left">
                  <h4 className="font-medium text-green-800 mb-2">Payment Details</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span>KES {paymentDetails.payment?.amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reference:</span>
                      <span className="font-mono text-xs">{reference || trxref}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="capitalize">{paymentDetails.payment?.status}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {status === 'failed' && (
            <>
              <p className="text-gray-600">
                There was an issue processing your payment. Please try again or contact support if the problem persists.
              </p>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-700">
                  Reference: {reference || trxref || 'N/A'}
                </p>
              </div>
            </>
          )}
          
          <Button 
            onClick={handleContinue}
            className={`w-full ${
              status === 'success' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
            disabled={status === 'loading'}
          >
            {status === 'success' ? 'View My Farmers' : 'Back to Discovery'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCallback;
