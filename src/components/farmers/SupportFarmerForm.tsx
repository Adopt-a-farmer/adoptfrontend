
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

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
    .refine(val => Number(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  supportType: z.string({
    required_error: "Please select a support type",
  }),
});

const SupportFarmerForm = ({ farmer }: SupportFarmerFormProps) => {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      supportType: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Here you would typically integrate with a payment processor
    console.log(values);
    
    toast({
      title: "Support initiated!",
      description: `You're supporting ${farmer.name} with $${values.amount}. Thank you!`,
    });
    
    form.reset();
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
                  <SelectItem value="monthly">Monthly Support</SelectItem>
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
              <FormLabel>Amount (USD)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter amount" 
                  {...field} 
                  type="number" 
                  min="1" 
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
        >
          Support Now
        </Button>
      </form>
    </Form>
  );
};

export default SupportFarmerForm;
