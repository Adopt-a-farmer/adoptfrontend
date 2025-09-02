import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CreditCard, Shield, Lock, CheckCircle, Smartphone } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { paymentService } from '@/services/payment';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import USSDPayment from './USSDPayment';

const paymentSchema = z.object({
  amount: z.number().min(100, 'Minimum amount is KES 100'),
  adoptionPackage: z.string().min(1, 'Please select an adoption package'),
  duration: z.number().min(1, 'Duration is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  agreedToTerms: z.boolean().refine(val => val === true, 'You must agree to terms and conditions')
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface AdoptionPackage {
  id: string;
  type: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  benefits: string[];
  deliverables: string[];
}

interface PaymentFormProps {
  farmerId: string;
  farmerName: string;
  adoptionPackages: AdoptionPackage[];
  onSuccess?: (paymentData: { reference: string; paymentUrl: string }) => void;
  onCancel?: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  farmerId,
  farmerName,
  adoptionPackages,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<AdoptionPackage | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'ussd'>('card');
  const [showUSSD, setShowUSSD] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      email: user?.email || '',
      phone: user?.phone || '',
      agreedToTerms: false
    }
  });

  const watchedPackage = watch('adoptionPackage');
  const watchedAmount = watch('amount');

  // Update selected package when package selection changes
  React.useEffect(() => {
    if (watchedPackage) {
      const pkg = adoptionPackages.find(p => p.id === watchedPackage);
      if (pkg) {
        setSelectedPackage(pkg);
        setValue('amount', pkg.price);
        setValue('duration', pkg.duration);
      }
    }
  }, [watchedPackage, adoptionPackages, setValue]);

  const onSubmit = async (data: PaymentFormData) => {
    if (!selectedPackage) {
      toast({
        title: "Error",
        description: "Please select an adoption package",
        variant: "destructive"
      });
      return;
    }

    if (paymentMethod === 'ussd') {
      setShowUSSD(true);
      return;
    }

    setIsProcessing(true);
    
    try {
      // Use the adoption service for integrated flow
      const { adoptionService } = await import('@/services/adoption');
      
      const adoptionData = {
        farmerId,
        monthlyContribution: data.amount,
        currency: 'KES',
        message: `Adopting ${farmerName} through ${selectedPackage.title} package`
      };

      const response = await adoptionService.createAdoption(adoptionData);
      
      if (response.success && response.paymentUrl) {
        // Directly redirect to Paystack and then to success page
        // Store adoption details for success page
        localStorage.setItem('pendingAdoption', JSON.stringify({
          farmerId,
          farmerName,
          package: selectedPackage.title,
          amount: data.amount
        }));
        
        // Redirect to Paystack payment page
        window.location.href = response.paymentUrl;
      } else {
        throw new Error(response.message || 'Failed to initialize payment');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUSSDSuccess = (data: { reference: string; phoneNumber: string }) => {
    toast({
      title: "Payment Initiated",
      description: "USSD payment initiated successfully",
    });
    onSuccess?.({ reference: data.reference, paymentUrl: '' });
  };

  const calculatePlatformFee = (amount: number) => {
    return Math.round(amount * 0.035); // 3.5% platform fee
  };

  const calculateTotal = (amount: number) => {
    return amount + calculatePlatformFee(amount);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {showUSSD && selectedPackage ? (
        <USSDPayment
          amount={calculateTotal(selectedPackage.price)}
          reference={`AAF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`}
          onSuccess={handleUSSDSuccess}
          onCancel={() => setShowUSSD(false)}
        />
      ) : (
        <>
          {/* Package Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Adoption Package Selection
              </CardTitle>
              <CardDescription>
                Choose the best package for supporting {farmerName}'s farm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {adoptionPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPackage?.id === pkg.id
                        ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                    onClick={() => setValue('adoptionPackage', pkg.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{pkg.title}</h3>
                      <Badge variant="outline">{pkg.type}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-green-600">
                        KES {pkg.price.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {pkg.duration} months duration
                      </div>
                    </div>
                    {pkg.benefits.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">Benefits:</div>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {pkg.benefits.slice(0, 3).map((benefit, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {benefit}
                            </li>
                          ))}
                          {pkg.benefits.length > 3 && (
                            <li className="text-gray-500">+{pkg.benefits.length - 3} more benefits</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Choose how you'd like to pay for this adoption
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={paymentMethod} onValueChange={(value: 'card' | 'ussd') => setPaymentMethod(value)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="card" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Card Payment
                  </TabsTrigger>
                  <TabsTrigger value="ussd" className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    USSD Payment
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="card" className="space-y-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Your payment is secured by Paystack. We never store your card details.
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                <TabsContent value="ussd" className="space-y-4">
                  <Alert>
                    <Smartphone className="h-4 w-4" />
                    <AlertDescription>
                      Pay directly from your mobile money account using USSD codes.
                      Supports M-Pesa, Airtel Money, and Equitel.
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Payment Details
                </CardTitle>
                <CardDescription>
                  Complete your payment to adopt this farm
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Hidden fields */}
                <input type="hidden" {...register('adoptionPackage')} />
                <input type="hidden" {...register('amount', { valueAsNumber: true })} />
                <input type="hidden" {...register('duration', { valueAsNumber: true })} />

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...register('phone')}
                      placeholder="+254712345678"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Payment Summary */}
                {selectedPackage && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-gray-900">Payment Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Package: {selectedPackage.title}</span>
                        <span>KES {selectedPackage.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Platform Fee (3.5%)</span>
                        <span>KES {calculatePlatformFee(selectedPackage.price).toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium text-lg">
                        <span>Total Amount</span>
                        <span className="text-green-600">
                          KES {calculateTotal(selectedPackage.price).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    {...register('agreedToTerms')}
                    onCheckedChange={(checked) => setValue('agreedToTerms', !!checked)}
                  />
                  <div className="space-y-1">
                    <Label 
                      htmlFor="terms" 
                      className="text-sm font-normal cursor-pointer"
                    >
                      I agree to the{' '}
                      <a href="/terms" className="text-green-600 hover:underline">
                        Terms and Conditions
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" className="text-green-600 hover:underline">
                        Privacy Policy
                      </a>
                    </Label>
                    {errors.agreedToTerms && (
                      <p className="text-sm text-red-600">{errors.agreedToTerms.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isProcessing || !selectedPackage}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : paymentMethod === 'ussd' ? (
                  <>
                    <Smartphone className="h-4 w-4 mr-2" />
                    Pay with USSD
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Pay Securely with Paystack
                  </>
                )}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default PaymentForm;