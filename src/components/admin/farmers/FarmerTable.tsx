
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Check, Edit, Eye, MoreHorizontal, Trash, X } from 'lucide-react';
import { Farmer } from '@/types';

interface FarmerTableProps {
  farmers: Farmer[];
  isLoading: boolean;
  onEdit: (farmer: Farmer) => void;
  onDelete: (id: number) => void;
  toggleFeatured: (id: number, featured: boolean) => void;
}

const FarmerTable: React.FC<FarmerTableProps> = ({
  farmers,
  isLoading,
  onEdit,
  onDelete,
  toggleFeatured
}) => {
  if (isLoading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
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
          {farmers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-32">
                No farmers found.
              </TableCell>
            </TableRow>
          ) : (
            farmers.map((farmer) => (
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
                      <DropdownMenuItem onClick={() => onEdit(farmer)}>
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
                        onClick={() => onDelete(farmer.id)}
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
  );
};

export default FarmerTable;
