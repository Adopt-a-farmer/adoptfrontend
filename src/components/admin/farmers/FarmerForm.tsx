import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Farmer } from '@/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, FormControl, FormDescription, FormField, 
  FormItem, FormLabel, FormMessage 
} from '@/components/ui/form';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';

// Schema for farmer form validation
export const farmerFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  location: z.string().min(2, { message: "Location is required" }),
  county: z.string().min(1, { message: "County is required" }),
  constituency: z.string().min(1, { message: "Constituency is required" }),
  description: z.string().optional(),
  crops: z.array(z.string()).min(1, { message: "Select at least one crop" }),
  farming_experience_years: z.number().min(0).optional().nullable(),
  fundinggoal: z.number().min(0, { message: "Funding goal must be a positive number" }),
  featured: z.boolean().default(false),
  image_url: z.string().optional().nullable(),
});

export type FarmerFormValues = z.infer<typeof farmerFormSchema>;

// Kenyan counties data
export const kenyaCounties = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo Marakwet", "Embu", "Garissa", 
  "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi", 
  "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu", "Machakos", 
  "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a", 
  "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyeri", "Samburu", 
  "Siaya", "Taita Taveta", "Tana River", "Tharaka Nithi", "Trans Nzoia", "Turkana", 
  "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
];

// Constituencies data mapped to counties
export const kenyaConstituencies: Record<string, string[]> = {
  "Baringo": ["Baringo Central", "Baringo North", "Baringo South", "Eldama Ravine", "Mogotio", "Tiaty"],
  "Bomet": ["Bomet Central", "Bomet East", "Chepalungu", "Konoin", "Sotik"],
  "Bungoma": ["Bumula", "Kabuchai", "Kanduyi", "Kimilili", "Mt. Elgon", "Sirisia", "Tongaren", "Webuye East", "Webuye West"],
  "Busia": ["Budalangi", "Butula", "Funyula", "Matayos", "Nambale", "Teso North", "Teso South"],
  "Elgeyo Marakwet": ["Keiyo North", "Keiyo South", "Marakwet East", "Marakwet West"],
  "Embu": ["Manyatta", "Mbeere North", "Mbeere South", "Runyenjes"],
  "Garissa": ["Balambala", "Dadaab", "Fafi", "Garissa Township", "Ijara", "Lagdera"],
  "Homa Bay": ["Homa Bay Town", "Kabondo Kasipul", "Karachuonyo", "Kasipul", "Mbita", "Ndhiwa", "Rangwe", "Suba"],
  "Isiolo": ["Isiolo North", "Isiolo South"],
  "Kajiado": ["Kajiado Central", "Kajiado East", "Kajiado North", "Kajiado South", "Kajiado West"],
  "Kakamega": ["Butere", "Ikolomani", "Khwisero", "Likuyani", "Lugari", "Lurambi", "Malava", "Matungu", "Mumias East", "Mumias West", "Navakholo", "Shinyalu"],
  "Kericho": ["Ainamoi", "Belgut", "Bureti", "Kipkelion East", "Kipkelion West", "Sigowet/Soin"],
  "Kiambu": ["Gatundu North", "Gatundu South", "Githunguri", "Juja", "Kabete", "Kiambaa", "Kiambu", "Kikuyu", "Limuru", "Ruiru", "Thika Town", "Lari"],
  "Kilifi": ["Ganze", "Kaloleni", "Kilifi North", "Kilifi South", "Magarini", "Malindi", "Rabai"],
  "Kirinyaga": ["Gichugu", "Kirinyaga Central", "Mwea", "Ndia"],
  "Kisii": ["Bobasi", "Bomachoge Borabu", "Bomachoge Chache", "Bonchari", "Kitutu Chache North", "Kitutu Chache South", "Nyaribari Chache", "Nyaribari Masaba", "South Mugirango"],
  "Kisumu": ["Kisumu Central", "Kisumu East", "Kisumu West", "Muhoroni", "Nyakach", "Nyando", "Seme"],
  "Kitui": ["Kitui Central", "Kitui East", "Kitui Rural", "Kitui South", "Kitui West", "Mwingi Central", "Mwingi North", "Mwingi West"],
  "Nairobi": ["Dagoretti North", "Dagoretti South", "Embakasi Central", "Embakasi East", "Embakasi North", "Embakasi South", "Embakasi West", "Kamukunji", "Kasarani", "Kibra", "Langata", "Makadara", "Mathare", "Roysambu", "Ruaraka", "Starehe", "Westlands"]
  // Add more counties and their constituencies...
};

// Available crop options
export const cropOptions = [
  "Corn", 
  "Wheat", 
  "Rice", 
  "Soybeans", 
  "Coffee", 
  "Cotton", 
  "Vegetables", 
  "Fruits", 
  "Tea", 
  "Sugar"
];

interface FarmerFormProps {
  onSubmit: (data: FarmerFormValues) => void;
  onCancel: () => void;
  defaultValues?: FarmerFormValues;
  submitLabel?: string;
  isEditing?: boolean;
}

const FarmerForm: React.FC<FarmerFormProps> = ({
  onSubmit,
  onCancel,
  defaultValues,
  submitLabel = "Create Farmer",
  isEditing = false,
}) => {
  const [constituencies, setConstituencies] = useState<string[]>([]);
  
  const form = useForm<FarmerFormValues>({
    resolver: zodResolver(farmerFormSchema),
    defaultValues: defaultValues || {
      name: '',
      location: '',
      county: '',
      constituency: '',
      description: '',
      crops: [],
      farming_experience_years: null,
      fundinggoal: 0,
      featured: false,
      image_url: null
    },
  });
  
  // Handle county selection
  const handleCountyChange = (value: string) => {
    form.setValue('county', value);
    form.setValue('constituency', ''); // Reset constituency when county changes
    
    const countyConstituencies = kenyaConstituencies[value] || [];
    setConstituencies(countyConstituencies);
  };
  
  // Load constituencies when editing and county is pre-selected
  useEffect(() => {
    const selectedCounty = form.watch('county');
    if (selectedCounty) {
      setConstituencies(kenyaConstituencies[selectedCounty] || []);
    }
  }, [form.watch('county')]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Farmer name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="county"
            render={({ field }) => (
              <FormItem>
                <FormLabel>County</FormLabel>
                <Select
                  onValueChange={handleCountyChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select county" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {kenyaCounties.map((county) => (
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
          
          <FormField
            control={form.control}
            name="constituency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Constituency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!form.watch('county')}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select constituency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {constituencies.map((constituency) => (
                      <SelectItem key={constituency} value={constituency}>
                        {constituency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Keep the original location field as hidden or for additional address info */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specific Address/Location</FormLabel>
              <FormControl>
                <Input placeholder="Additional location details" {...field} />
              </FormControl>
              <FormDescription>
                Provide specific address or location information
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Farm description" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="farming_experience_years"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Farming Experience (Years)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Years of experience" 
                    {...field} 
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="fundinggoal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Funding Goal ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Funding goal" 
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="Image URL" {...field} value={field.value || ''} />
              </FormControl>
              <FormDescription>
                Enter a URL for the farmer's profile image
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="crops"
          render={() => (
            <FormItem>
              <div className="mb-2">
                <FormLabel>Crops</FormLabel>
                <FormDescription>
                  Select the crops this farmer cultivates
                </FormDescription>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {cropOptions.map((crop) => (
                  <FormField
                    key={crop}
                    control={form.control}
                    name="crops"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={crop}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(crop)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, crop])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== crop
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {crop}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Featured Farmer
                </FormLabel>
                <FormDescription>
                  Featured farmers appear on the homepage
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </Form>
  );
};

export default FarmerForm;
