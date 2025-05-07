
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search } from 'lucide-react';
import { Farmer } from '@/types';
import { useFarmers } from '@/hooks/useFarmers';
import FarmerTable from '@/components/admin/farmers/FarmerTable';
import DeleteFarmerDialog from '@/components/admin/farmers/DeleteFarmerDialog';
import FarmerFormDialog from '@/components/admin/farmers/FarmerFormDialog';
import { FarmerFormValues } from '@/components/admin/farmers/FarmerForm';

const FarmersManagement = () => {
  const {
    farmers,
    isLoading,
    searchTerm,
    setSearchTerm,
    addFarmer,
    updateFarmer,
    deleteFarmer,
    toggleFeatured
  } = useFarmers();
  
  // UI state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [deletingFarmerId, setDeletingFarmerId] = useState<number | null>(null);

  // Event handlers
  const handleOpenAddDialog = () => setIsAddDialogOpen(true);
  
  const handleOpenEditDialog = (farmer: Farmer) => {
    setEditingFarmer(farmer);
    setIsEditDialogOpen(true);
  };
  
  const handleOpenDeleteDialog = (id: number) => {
    setDeletingFarmerId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleCloseAddDialog = () => setIsAddDialogOpen(false);
  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingFarmer(null);
  };
  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeletingFarmerId(null);
  };
  
  // Form submission handlers
  const handleAddSubmit = async (data: FarmerFormValues) => {
    const success = await addFarmer(data);
    if (success) {
      handleCloseAddDialog();
    }
  };
  
  const handleEditSubmit = async (data: FarmerFormValues) => {
    if (!editingFarmer) return;
    
    const success = await updateFarmer(editingFarmer.id, data);
    if (success) {
      handleCloseEditDialog();
    }
  };
  
  const handleDelete = async () => {
    if (!deletingFarmerId) return;
    
    const success = await deleteFarmer(deletingFarmerId);
    if (success) {
      handleCloseDeleteDialog();
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Farmers Management</h1>
        <Button onClick={handleOpenAddDialog}>
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
          <FarmerTable 
            farmers={farmers}
            isLoading={isLoading}
            onEdit={handleOpenEditDialog}
            onDelete={handleOpenDeleteDialog}
            toggleFeatured={toggleFeatured}
          />
        </CardContent>
      </Card>
      
      {/* Add Farmer Dialog */}
      <FarmerFormDialog
        isOpen={isAddDialogOpen}
        onClose={handleCloseAddDialog}
        onSubmit={handleAddSubmit}
        dialogTitle="Add New Farmer"
        dialogDescription="Create a new farmer profile in the system."
        submitLabel="Create Farmer"
      />
      
      {/* Edit Farmer Dialog */}
      <FarmerFormDialog
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        onSubmit={handleEditSubmit}
        farmer={editingFarmer}
        dialogTitle="Edit Farmer"
        dialogDescription="Update the farmer's information."
        submitLabel="Update Farmer"
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteFarmerDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default FarmersManagement;
