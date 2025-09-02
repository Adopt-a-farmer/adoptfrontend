import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Smartphone, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface USSDPaymentProps {
  amount: number;
  reference: string;
  onSuccess?: (data: { reference: string; phoneNumber: string }) => void;
  onCancel?: () => void;
}

const USSDPayment: React.FC<USSDPaymentProps> = ({
  amount,
  reference,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState<'mpesa' | 'airtel' | 'equitel'>('mpesa');
  const [step, setStep] = useState<'input' | 'ussd' | 'confirm'>('input');
  const [isProcessing, setIsProcessing] = useState(false);

  const providerCodes = {
    mpesa: '*334#',
    airtel: '*334#',
    equitel: '*334#'
  };

  const providerNames = {
    mpesa: 'M-Pesa',
    airtel: 'Airtel Money',
    equitel: 'Equitel'
  };

  const handleInitiateUSSD = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate USSD initiation - in real implementation, this would call your USSD gateway
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStep('ussd');
      
      toast({
        title: "USSD Code Sent",
        description: `Please dial ${providerCodes[provider]} on your phone to complete payment`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate USSD payment",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPayment = () => {
    setStep('confirm');
    // Simulate payment verification
    setTimeout(() => {
      onSuccess?.({ reference, phoneNumber });
    }, 3000);
  };

  const copyUSSDCode = async () => {
    try {
      await navigator.clipboard.writeText(providerCodes[provider]);
      toast({
        title: "Copied!",
        description: "USSD code copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy USSD code",
        variant: "destructive"
      });
    }
  };

  if (step === 'input') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            USSD Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-900">Amount to Pay</p>
              <p className="text-2xl font-bold text-blue-600">KES {amount.toLocaleString()}</p>
            </div>
          </div>

          <div>
            <Label htmlFor="provider">Select Payment Provider</Label>
            <Select value={provider} onValueChange={(value: 'mpesa' | 'airtel' | 'equitel') => setProvider(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mpesa">M-Pesa (Safaricom)</SelectItem>
                <SelectItem value="airtel">Airtel Money</SelectItem>
                <SelectItem value="equitel">Equitel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="254712345678"
              maxLength={12}
            />
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You will receive a USSD prompt on your phone to complete the payment.
            </AlertDescription>
          </Alert>

          <div className="flex space-x-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
            <Button 
              onClick={handleInitiateUSSD}
              disabled={isProcessing || !phoneNumber}
              className="flex-1"
            >
              {isProcessing ? "Sending..." : "Send USSD Code"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'ussd') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Complete Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="bg-green-50 p-6 rounded-lg">
            <Smartphone className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              USSD Code Sent!
            </h3>
            <p className="text-green-700 mb-4">
              Dial the following code on your {providerNames[provider]} line:
            </p>
            <div className="bg-white p-4 rounded border-2 border-dashed border-green-300">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-mono font-bold">{providerCodes[provider]}</span>
                <Button size="sm" variant="ghost" onClick={copyUSSDCode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              1. Dial {providerCodes[provider]} on your phone
            </p>
            <p className="text-sm text-gray-600">
              2. Follow the prompts to pay KES {amount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              3. Enter your PIN to confirm
            </p>
            <p className="text-sm text-gray-600">
              4. Click "I've Paid" below once complete
            </p>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setStep('input')} className="flex-1">
              Back
            </Button>
            <Button onClick={handleConfirmPayment} className="flex-1">
              I've Paid
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Payment Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Verifying Payment...
          </h3>
          <p className="text-blue-700">
            Please wait while we confirm your payment
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This usually takes a few seconds. Please don't close this window.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default USSDPayment;