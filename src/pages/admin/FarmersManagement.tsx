
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Farmer } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Trash, 
  X, 
  Check,
  Eye 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const farmerFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  location: z.string().min(2, { message: "Location is required" }),
  description: z.string().optional(),
  crops: z.array(z.string()).min(1, { message: "Select at least one crop" }),
  farming_experience_years: z.number().min(0).optional().nullable(),
  fundinggoal: z.number().min(0, { message: "Funding goal must be a positive number" }),
  featured: z.boolean().default(false),
  image_url: z.string().optional().nullable(),
});

type FarmerFormValues = z.infer<typeof farmerFormSchema>;

// Available crop options
const cropOptions = [
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

const FarmersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [deletingFarmerId, setDeletingFarmerId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const fetchFarmers = async () => {
    try {
      const { data, error } = await supabase
        .from('farmers')
        .select('*');
      
      if (error) throw error;
      
      return data as Farmer[];
    } catch (error: any) {
      console.error('Error fetching farmers:', error);
      toast({
        title: 'Error fetching farmers',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    }
  };
  
  const { data: farmers = [], isLoading } = useQuery({
    queryKey: ['farmers'],
    queryFn: fetchFarmers,
  });
  
  const filteredFarmers = farmers.filter(farmer =>
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const addForm = useForm<FarmerFormValues>({
    resolver: zodResolver(farmerFormSchema),
    defaultValues: {
      name: '',
      location: '',
      description: '',
      crops: [],
      farming_experience_years: null,
      fundinggoal: 0,
      featured: false,
      image_url: null
    },
  });
  
  const editForm = useForm<FarmerFormValues>({
    resolver: zodResolver(farmerFormSchema),
    defaultValues: {
      name: '',
      location: '',
      description: '',
      crops: [],
      farming_experience_years: null,
      fundinggoal: 0,
      featured: false,
      image_url: null
    },
  });
  
  useEffect(() => {
    if (editingFarmer) {
      editForm.reset({
        name: editingFarmer.name,
        location: editingFarmer.location,
        description: editingFarmer.description || '',
        crops: editingFarmer.crops || [],
        farming_experience_years: editingFarmer.farming_experience_years,
        fundinggoal: editingFarmer.fundinggoal,
        featured: editingFarmer.featured,
        image_url: editingFarmer.image_url,
      });
    }
  }, [editingFarmer, editForm]);
  
  const handleAddFarmer = async (data: FarmerFormValues) => {
    try {
      const { error } = await supabase
        .from('farmers')
        .insert([
          { 
            ...data,
            fundingraised: 0,
            supporters: 0
          }
        ]);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      
      toast({
        title: 'Farmer added',
        description: 'New farmer has been added successfully',
      });
      
      setIsAddDialogOpen(false);
      addForm.reset();
    } catch (error: any) {
      console.error('Error adding farmer:', error);
      toast({
        title: 'Error adding farmer',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  const handleUpdateFarmer = async (data: FarmerFormValues) => {
    if (!editingFarmer) return;
    
    try {
      const { error } = await supabase
        .from('farmers')
        .update(data)
        .eq('id', editingFarmer.id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      
      toast({
        title: 'Farmer updated',
        description: 'Farmer information has been updated successfully',
      });
      
      setIsEditDialogOpen(false);
      setEditingFarmer(null);
    } catch (error: any) {
      console.error('Error updating farmer:', error);
      toast({
        title: 'Error updating farmer',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteFarmer = async () => {
    if (!deletingFarmerId) return;
    
    try {
      const { error } = await supabase
        .from('farmers')
        .delete()
        .eq('id', deletingFarmerId);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      
      toast({
        title: 'Farmer deleted',
        description: 'Farmer has been deleted successfully',
      });
      
      setIsDeleteDialogOpen(false);
      setDeletingFarmerId(null);
    } catch (error: any) {
      console.error('Error deleting farmer:', error);
      toast({
        title: 'Error deleting farmer',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  const toggleFeatured = async (id: number, featured: boolean) => {
    try {
      const { error } = await supabase
        .from('farmers')
        .update({ featured: !featured })
        .eq('id', id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      
      toast({
        title: 'Farmer updated',
        description: `Farmer has been ${!featured ? 'featured' : 'unfeatured'} successfully`,
      });
    } catch (error: any) {
      console.error('Error updating farmer:', error);
      toast({
        title: 'Error updating farmer',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Farmers Management</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Farmer
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Farmers</CardTitle>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or location..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-60 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Crops</TableHead>
                    <TableHead>Funding Progress</TableHead>
                    <TableHead>Supporters</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFarmers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-32">
                        No farmers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFarmers.map((farmer) => (
                      <TableRow key={farmer.id}>
                        <TableCell className="font-medium">{farmer.name}</TableCell>
                        <TableCell>{farmer.location}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {farmer.crops.slice(0, 2).map((crop, i) => (
                              <Badge key={i} variant="outline">{crop}</Badge>
                            ))}
                            {farmer.crops.length > 2 && (
                              <Badge variant="outline">+{farmer.crops.length - 2}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="min-w-[150px]">
                            <div className="flex justify-between text-xs mb-1">
                              <span>${farmer.fundingraised.toFixed(2)}</span>
                              <span>${farmer.fundinggoal.toFixed(2)}</span>
                            </div>
                            <Progress 
                              value={(farmer.fundingraised / farmer.fundinggoal) * 100}
                              className="h-2"
                            />
                          </div>
                        </TableCell>
                        <TableCell>{farmer.supporters}</TableCell>
                        <TableCell>
                          {farmer.featured ? (
                            <Badge className="bg-amber-500 hover:bg-amber-600">Featured</Badge>
                          ) : (
                            <Badge variant="outline">Standard</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                setEditingFarmer(farmer);
                                setIsEditDialogOpen(true);
                              }}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleFeatured(farmer.id, farmer.featured)}>
                                {farmer.featured ? (
                                  <>
                                    <X className="mr-2 h-4 w-4" />
                                    Remove Featured
                                  </>
                                ) : (
                                  <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Mark as Featured
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <a href={`/farmers/${farmer.id}`} target="_blank">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Public Profile
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setDeletingFarmerId(farmer.id);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Farmer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Farmer</DialogTitle>
            <DialogDescription>
              Create a new farmer profile in the system.
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddFarmer)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
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
                <FormField
                  control={addForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={addForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Farm description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
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
                  control={addForm.control}
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
                control={addForm.control}
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
                control={addForm.control}
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
                          control={addForm.control}
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
                control={addForm.control}
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
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Farmer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Farmer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Farmer</DialogTitle>
            <DialogDescription>
              Update the farmer's information.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateFarmer)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
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
                <FormField
                  control={editForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
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
                  control={editForm.control}
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
                  control={editForm.control}
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
                control={editForm.control}
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
                control={editForm.control}
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
                          control={editForm.control}
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
                control={editForm.control}
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
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingFarmer(null);
                }}>
                  Cancel
                </Button>
                <Button type="submit">Update Farmer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the farmer
              and all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingFarmerId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteFarmer}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FarmersManagement;
