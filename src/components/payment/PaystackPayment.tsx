import React, { useState } from 'react';
import { PaystackButton } from 'react-paystack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CreditCard, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { contributionService } from '@/services/contribution';
import { useAuth } from '@/hooks/useAuth';

interface PaystackPaymentProps {
  farmerId: string;
  farmerName: string;
  adoptionId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialAmount?: number;
  contributionType?: 'additional' | 'monthly' | 'one-time';
}

const PaystackPayment: React.FC<PaystackPaymentProps> = ({
  farmerId,
  farmerName,
  adoptionId,
  onSuccess,
  onCancel,
  initialAmount = 1000,
  contributionType = 'additional'
}) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState(initialAmount);
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile_money'>('card');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_37f717185e6526135feb678cb7099a3ececd1912';

  const handlePaymentSuccess = async (reference: { reference: string; message: string; status: string }) => {
    setIsLoading(true);
    try {
      console.log('Payment successful:', reference);
      
      // Verify the payment
      const verificationResponse = await contributionService.verifyContribution(reference.reference);
      
      if (verificationResponse.success) {
        toast.success('Payment successful! Your contribution has been processed.');
        onSuccess?.();
      } else {
        toast.error('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Payment verification failed. Please contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentClose = () => {
    console.log('Payment closed');
    onCancel?.();
  };

  const handleContributionClick = async () => {
    if (!user) {
      toast.error('Please log in to make a contribution');
      return;
    }

    if (amount < 100) {
      toast.error('Minimum contribution amount is KES 100');
      return;
    }

    if (paymentMethod === 'mobile_money' && !phoneNumber) {
      toast.error('Please enter your phone number for M-Pesa payment');
      return;
    }

    setIsLoading(true);
    try {
      const contributionData = {
        farmerId,
        adoptionId,
        amount,
        currency: 'KES',
        contributionType,
        message: message.trim() || undefined,
        paymentMethod
      };

      const response = await contributionService.makeContribution(contributionData);
      
      if (response.success && response.data?.payment?.authorization_url) {
        // For mobile money, redirect to Paystack page
        if (paymentMethod === 'mobile_money') {
          window.location.href = response.data.payment.authorization_url;
          return;
        }
        
        // For card payments, we'll use the PaystackButton component
        toast.success('Payment initialized. Complete the payment process.');
      } else {
        toast.error(response.message || 'Failed to initialize payment');
      }
    } catch (error) {
      console.error('Contribution error:', error);
      toast.error('Failed to process contribution. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const componentProps = {
    email: user?.email || '',
    amount: amount * 100, // Paystack expects amount in kobo
    currency: 'KES',
    publicKey,
    text: 'Pay Now',
    onSuccess: handlePaymentSuccess,
    onClose: handlePaymentClose,
    metadata: {
      farmerId,
      adoptionId,
      contributionType,
      custom_fields: [
        {
          display_name: 'Farmer',
          variable_name: 'farmer_name',
          value: farmerName
        },
        {
          display_name: 'Contribution Type',
          variable_name: 'contribution_type',
          value: contributionType
        }
      ]
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Support {farmerName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="amount">Amount (KES)</Label>
          <Input
            id="amount"
            type="number"
            min="100"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Enter amount"
            className="text-lg font-semibold"
          />
          <p className="text-sm text-gray-600 mt-1">Minimum: KES 100</p>
        </div>

        <div>
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Select value={paymentMethod} onValueChange={(value: 'card' | 'mobile_money') => setPaymentMethod(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="card">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Card Payment
                </div>
              </SelectItem>
              <SelectItem value="mobile_money">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  M-Pesa / Mobile Money
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {paymentMethod === 'mobile_money' && (
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="254712345678"
              className="text-lg"
            />
            <p className="text-sm text-gray-600 mt-1">Enter your M-Pesa number</p>
          </div>
        )}

        <div>
          <Label htmlFor="message">Message (Optional)</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a personal message to the farmer..."
            rows={3}
          />
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Amount:</span>
            <span>KES {amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Processing fee:</span>
            <span>KES {Math.ceil(amount * 0.025)}</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 border-t">
            <span>Total:</span>
            <span>KES {(amount + Math.ceil(amount * 0.025)).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {paymentMethod === 'card' ? (
            <PaystackButton
              {...componentProps}
              className="flex-1 bg-farmer-primary hover:bg-farmer-primary/90 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
              disabled={isLoading || amount < 100}
            />
          ) : (
            <Button
              onClick={handleContributionClick}
              disabled={isLoading || amount < 100 || !phoneNumber}
              className="flex-1 bg-farmer-primary hover:bg-farmer-primary/90"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Pay with M-Pesa
            </Button>
          )}
          
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center">
          Payments are processed securely by Paystack
        </p>
      </CardContent>
    </Card>
  );
};

export default PaystackPayment;
