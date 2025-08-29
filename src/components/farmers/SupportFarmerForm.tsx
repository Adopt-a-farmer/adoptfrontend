
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiCall } from '@/services/api';

interface SupportFarmerFormProps {
  farmer: {
    id: number;
    name: string;
  };
}

const formSchema = z.object({
  amount: z.string()
    .refine(val => !isNaN(Number(val)), {
      message: "Amount must be a number",
    })
    .refine(val => Number(val) >= 100, {
      message: "Amount must be at least 100 KES",
    }),
  supportType: z.string({
    required_error: "Please select a support type",
  }),
});

const SupportFarmerForm = ({ farmer }: SupportFarmerFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      supportType: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to support a farmer.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create adoption if it's monthly support
      if (values.supportType === 'monthly') {
        await apiCall('POST', '/adopters/adopt', {
          farmer_id: farmer.id,
          monthly_contribution: Number(values.amount)
        });

        toast({
          title: "Adoption successful!",
          description: `You are now supporting ${farmer.name} with KES ${values.amount} monthly.`,
        });
      } else {
        // Create payment for one-time donation or project funding
        const paymentResponse = await apiCall('POST', '/payments/create-payment', {
          farmer_id: farmer.id,
          amount: Number(values.amount),
          currency: 'KES',
          description: `${values.supportType === 'donation' ? 'Donation' : 'Project funding'} for ${farmer.name}`
        });

        // Redirect to Paystack payment page
        if (paymentResponse && typeof paymentResponse === 'object' && 'authorization_url' in paymentResponse) {
          window.location.href = paymentResponse.authorization_url as string;
        } else {
          throw new Error('Payment initialization failed');
        }
      }
      
      form.reset();
    } catch (error: unknown) {
      console.error('Error processing support:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process support. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="supportType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Support Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type of support" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="donation">One-time Donation</SelectItem>
                  <SelectItem value="monthly">Monthly Support (Adoption)</SelectItem>
                  <SelectItem value="project">Project-specific Funding</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (KES)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter amount (minimum 100 KES)" 
                  {...field} 
                  type="number" 
                  min="100" 
                  className="appearance-textfield" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full bg-farmer-primary hover:bg-farmer-primary/90"
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Support Now'}
        </Button>
      </form>
    </Form>
  );
};

export default SupportFarmerForm;
