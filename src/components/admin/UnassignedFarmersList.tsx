import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, UserPlus, Wheat, MapPin, Phone, Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { apiCall } from '@/services/api';

interface UnassignedFarmer {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  farmName: string;
  farmingType: string;
  location: {
    county: string;
    subCounty?: string;
  };
  farmSize?: number;
  verificationStatus: string;
  createdAt: string;
}

interface UnassignedFarmersListProps {
  onAssign: (farmerId: string, farmerName: string) => void;
}

const UnassignedFarmersList: React.FC<UnassignedFarmersListProps> = ({ onAssign }) => {
  const [farmers, setFarmers] = useState<UnassignedFarmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [farmingTypeFilter, setFarmingTypeFilter] = useState('all');
  const { toast } = useToast();

  const fetchFarmers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiCall<{
        success: boolean;
        data: {
          farmers: UnassignedFarmer[];
          pagination: {
            current: number;
            pages: number;
            total: number;
          };
        };
      }>('GET', '/admin/farmers/unassigned', undefined, {
        params: {
          search: searchTerm || undefined,
        },
      });

      if (response.success && response.data) {
        setFarmers(response.data.farmers);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch unassigned farmers';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, toast]);

  useEffect(() => {
    fetchFarmers();
  }, [fetchFarmers]);

  // Client-side filtering by farming type
  const filteredFarmers = React.useMemo(() => {
    if (farmingTypeFilter === 'all') return farmers;
    return farmers.filter(
      (farmer) =>
        farmer.farmingType.toLowerCase() === farmingTypeFilter.toLowerCase()
    );
  }, [farmers, farmingTypeFilter]);

  // Extract unique farming types for filter
  const farmingTypes = React.useMemo(() => {
    const types = new Set(farmers.map((f) => f.farmingType));
    return Array.from(types);
  }, [farmers]);

  const handleAssign = (farmer: UnassignedFarmer) => {
    const farmerName = `${farmer.user.firstName} ${farmer.user.lastName}`;
    onAssign(farmer.user._id, farmerName);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Unassigned Farmers</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Verified farmers without active adopters
            </p>
          </div>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            {filteredFarmers.length} Available
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, farm name, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={farmingTypeFilter} onValueChange={setFarmingTypeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Farming Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {farmingTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : filteredFarmers.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Wheat className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">No unassigned farmers found</p>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm || farmingTypeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'All verified farmers have been assigned'}
            </p>
          </div>
        ) : (
          /* Farmers Table */
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Farm Details</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFarmers.map((farmer) => (
                  <TableRow key={farmer._id}>
                    {/* Farmer Info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={farmer.user.avatar} />
                          <AvatarFallback className="bg-green-100 text-green-700">
                            {getInitials(farmer.user.firstName, farmer.user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">
                            {farmer.user.firstName} {farmer.user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{farmer.user.email}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Farm Details */}
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{farmer.farmName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {farmer.farmingType}
                          </Badge>
                          {farmer.farmSize && (
                            <span className="text-xs text-gray-500">
                              {farmer.farmSize} acres
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Location */}
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-900">{farmer.location.county}</p>
                          {farmer.location.subCounty && (
                            <p className="text-xs text-gray-500">{farmer.location.subCounty}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Contact */}
                    <TableCell>
                      <div className="space-y-1">
                        {farmer.user.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">{farmer.user.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600 truncate max-w-[150px]">
                            {farmer.user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Registered Date */}
                    <TableCell>
                      <p className="text-sm text-gray-600">
                        {new Date(farmer.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleAssign(farmer)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign Adopter
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Results Summary */}
        {!loading && filteredFarmers.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>
              Showing {filteredFarmers.length} of {farmers.length} farmer
              {farmers.length !== 1 ? 's' : ''}
            </p>
            <Button variant="outline" size="sm" onClick={fetchFarmers}>
              Refresh List
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnassignedFarmersList;
