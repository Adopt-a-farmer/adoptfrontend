
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// Kenya counties data
const counties = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Nyeri", 
  "Machakos", "Kiambu", "Kakamega", "Kisii", "Uasin Gishu"
];

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  location: z.string({
    required_error: "Please select a county.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  image: z.string().url({
    message: "Please enter a valid image URL.",
  }),
  fundingGoal: z.coerce.number().positive({
    message: "Funding goal must be a positive number.",
  }),
  crops: z.string().min(2, {
    message: "Please enter at least one crop.",
  }),
});

interface FarmerFormProps {
  initialValues: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const FarmerForm = ({ initialValues, onSubmit, onCancel }: FarmerFormProps) => {
  const [cropInput, setCropInput] = useState('');
  const [cropsList, setCropsList] = useState<string[]>(initialValues.crops || []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialValues.name || '',
      location: initialValues.location || '',
      description: initialValues.description || '',
      image: initialValues.image || '',
      fundingGoal: initialValues.fundingGoal || '',
      crops: cropsList.join(', ') || '',
    },
  });

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    const formattedCrops = values.crops.split(',').map(crop => crop.trim()).filter(Boolean);
    
    onSubmit({
      ...values,
      crops: formattedCrops,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Farmer Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter farmer's name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>County</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select county" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {counties.map((county) => (
                      <SelectItem key={county} value={county}>
                        {county}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter a detailed description of the farmer and their needs" 
                  {...field} 
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="Enter image URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="fundingGoal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Funding Goal (USD)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter funding goal" 
                    type="number" 
                    min="1" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="crops"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Crops (comma-separated)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="E.g. Coffee, Maize, Beans" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-farmer-primary hover:bg-farmer-primary/90">
            Save Farmer
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FarmerForm;
