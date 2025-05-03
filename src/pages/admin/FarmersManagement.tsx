
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
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';

const FarmersManagement = () => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('farmers')
        .select('*');
      
      if (error) throw error;
      
      // Convert the data to match our updated Farmer type
      setFarmers(data as Farmer[]);
    } catch (error: any) {
      console.error('Error fetching farmers:', error);
      toast({
        title: 'Error fetching farmers',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const filteredFarmers = farmers.filter(farmer =>
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFeatured = async (id: number, featured: boolean) => {
    try {
      const { error } = await supabase
        .from('farmers')
        .update({ featured: !featured })
        .eq('id', id);
      
      if (error) throw error;
      
      setFarmers(farmers.map(farmer => 
        farmer.id === id ? { ...farmer, featured: !featured } : farmer
      ));
      
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
        <Button>
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
          {loading ? (
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
                            {farmer.crops.map((crop, i) => (
                              <Badge key={i} variant="outline">{crop}</Badge>
                            ))}
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
                              <DropdownMenuItem onClick={() => toggleFeatured(farmer.id, farmer.featured)}>
                                {farmer.featured ? 'Remove Featured' : 'Mark as Featured'}
                              </DropdownMenuItem>
                              <DropdownMenuItem>Edit Details</DropdownMenuItem>
                              <DropdownMenuItem>View Updates</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
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
    </div>
  );
};

export default FarmersManagement;
