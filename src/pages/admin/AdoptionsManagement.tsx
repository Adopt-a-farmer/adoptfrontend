
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Users, DollarSign, UserPlus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/mock/client';

const AdoptionsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [farmerFilter, setFarmerFilter] = useState('');

  // Fetch all adoptions with farmer and adopter details
  const fetchAdoptions = async () => {
    const { data, error } = await supabase
      .from('farmer_adoptions')
      .select(`
        *,
        farmers:farmer_id (id, name, location, crops),
        profiles:adopter_id (id, full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const { data: adoptions = [], isLoading } = useQuery({
    queryKey: ['admin-adoptions'],
    queryFn: fetchAdoptions,
  });

  // Fetch farmers for filter dropdown
  const { data: farmers = [] } = useQuery({
    queryKey: ['farmers-for-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('farmers')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Filter adoptions
  const filteredAdoptions = adoptions.filter(adoption => {
    const matchesSearch = searchTerm === '' || 
      adoption.farmers?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adoption.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adoption.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFarmer = farmerFilter === '' || 
      adoption.farmer_id.toString() === farmerFilter;
    
    return matchesSearch && matchesFarmer;
  });

  // Calculate summary statistics
  const totalAdoptions = adoptions.length;
  const activeAdoptions = adoptions.filter(a => a.status === 'active').length;
  const totalContributions = adoptions.reduce((sum, a) => sum + Number(a.total_contributed), 0);
  const monthlyContributions = adoptions
    .filter(a => a.status === 'active')
    .reduce((sum, a) => sum + Number(a.monthly_contribution), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Adoptions Management</h1>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Create Adoption
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Adoptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAdoptions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Adoptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAdoptions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalContributions.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyContributions.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Adoptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by farmer name, adopter name, or email..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={farmerFilter} onValueChange={setFarmerFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by farmer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Farmers</SelectItem>
                  {farmers.map((farmer) => (
                    <SelectItem key={farmer.id} value={farmer.id.toString()}>
                      {farmer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adoptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Adoptions ({filteredAdoptions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Farmer</TableHead>
                <TableHead>Adopter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Monthly Contribution</TableHead>
                <TableHead>Total Contributed</TableHead>
                <TableHead>Adoption Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdoptions.map((adoption) => (
                <TableRow key={adoption.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{adoption.farmers?.name}</div>
                      <div className="text-sm text-gray-500">{adoption.farmers?.location}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{adoption.profiles?.full_name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{adoption.profiles?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={adoption.status === 'active' ? 'default' : 'secondary'}>
                      {adoption.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${adoption.monthly_contribution}</TableCell>
                  <TableCell>${adoption.total_contributed}</TableCell>
                  <TableCell>
                    {new Date(adoption.adoption_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredAdoptions.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No adoptions found matching your criteria.</p>
              <p className="text-gray-400 mt-2">Try adjusting your filters to see more results.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdoptionsManagement;
