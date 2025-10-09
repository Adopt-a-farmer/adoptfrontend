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
import { Search, Check, Users, Mail, Phone, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { apiCall } from '@/services/api';
import { cn } from '@/lib/utils';

interface AvailableAdopter {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  organization?: string;
  adoptionCount: number;
  verificationStatus: string;
  createdAt: string;
}

interface AvailableAdoptersListProps {
  onSelect: (adopterId: string, adopterName: string) => void;
  selectedAdopter?: string;
}

const AvailableAdoptersList: React.FC<AvailableAdoptersListProps> = ({
  onSelect,
  selectedAdopter,
}) => {
  const [adopters, setAdopters] = useState<AvailableAdopter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchAdopters = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiCall<{
        success: boolean;
        data: {
          adopters: AvailableAdopter[];
          pagination: {
            current: number;
            pages: number;
            total: number;
          };
        };
      }>('GET', '/admin/adopters/available', undefined, {
        params: {
          search: searchTerm || undefined,
        },
      });

      if (response.success && response.data) {
        setAdopters(response.data.adopters);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch available adopters';
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
    fetchAdopters();
  }, [fetchAdopters]);

  // Client-side search filtering
  const filteredAdopters = React.useMemo(() => {
    if (!searchTerm) return adopters;
    
    const lowerSearch = searchTerm.toLowerCase();
    return adopters.filter(
      (adopter) =>
        adopter.user.firstName.toLowerCase().includes(lowerSearch) ||
        adopter.user.lastName.toLowerCase().includes(lowerSearch) ||
        adopter.user.email.toLowerCase().includes(lowerSearch) ||
        (adopter.organization && adopter.organization.toLowerCase().includes(lowerSearch))
    );
  }, [adopters, searchTerm]);

  const handleSelect = (adopter: AvailableAdopter) => {
    const adopterName = adopter.organization
      ? adopter.organization
      : `${adopter.user.firstName} ${adopter.user.lastName}`;
    onSelect(adopter.user._id, adopterName);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Available Adopters</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Select an adopter to assign to farmer
            </p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {filteredAdopters.length} Available
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, organization, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredAdopters.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">No adopters found</p>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm
                ? 'Try adjusting your search'
                : 'No verified adopters available'}
            </p>
          </div>
        ) : (
          /* Adopters Table */
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Adopter</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Active Adoptions</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdopters.map((adopter) => {
                  const isSelected = selectedAdopter === adopter.user._id;
                  
                  return (
                    <TableRow
                      key={adopter._id}
                      className={cn(
                        'cursor-pointer transition-colors',
                        isSelected && 'bg-blue-50 hover:bg-blue-50'
                      )}
                      onClick={() => handleSelect(adopter)}
                    >
                      {/* Selection Indicator */}
                      <TableCell>
                        {isSelected && (
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600">
                            <Check className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </TableCell>

                      {/* Adopter Info */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={adopter.user.avatar} />
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {getInitials(adopter.user.firstName, adopter.user.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">
                              {adopter.user.firstName} {adopter.user.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{adopter.user.email}</p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Organization */}
                      <TableCell>
                        {adopter.organization ? (
                          <Badge variant="outline" className="font-normal">
                            {adopter.organization}
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-400">Individual</span>
                        )}
                      </TableCell>

                      {/* Contact */}
                      <TableCell>
                        <div className="space-y-1">
                          {adopter.user.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">{adopter.user.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600 truncate max-w-[150px]">
                              {adopter.user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Active Adoptions */}
                      <TableCell>
                        <Badge
                          variant={adopter.adoptionCount > 0 ? 'default' : 'secondary'}
                          className={cn(
                            adopter.adoptionCount > 0
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-gray-100 text-gray-600'
                          )}
                        >
                          {adopter.adoptionCount} Active
                        </Badge>
                      </TableCell>

                      {/* Joined Date */}
                      <TableCell>
                        <p className="text-sm text-gray-600">
                          {new Date(adopter.createdAt).toLocaleDateString('en-US', {
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
                          variant={isSelected ? 'default' : 'outline'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(adopter);
                          }}
                          className={cn(
                            isSelected && 'bg-blue-600 hover:bg-blue-700'
                          )}
                        >
                          {isSelected ? (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Selected
                            </>
                          ) : (
                            'Select'
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Results Summary */}
        {!loading && filteredAdopters.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>
              Showing {filteredAdopters.length} of {adopters.length} adopter
              {adopters.length !== 1 ? 's' : ''}
            </p>
            <Button variant="outline" size="sm" onClick={fetchAdopters}>
              Refresh List
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailableAdoptersList;
