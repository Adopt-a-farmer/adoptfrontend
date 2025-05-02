
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { farmers as initialFarmers } from '@/data/farmers';
import { useToast } from '@/components/ui/use-toast';
import FarmerForm from '@/components/dashboard/FarmerForm';
import { Edit, Eye, Plus, Trash } from 'lucide-react';

const FarmerDashboard = () => {
  const [farmers, setFarmers] = useState(initialFarmers);
  const [isAddingFarmer, setIsAddingFarmer] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<any>(null);
  const { toast } = useToast();

  const handleDeleteFarmer = (id: number) => {
    if (window.confirm('Are you sure you want to delete this farmer?')) {
      setFarmers(farmers.filter(farmer => farmer.id !== id));
      toast({
        title: 'Farmer deleted',
        description: 'The farmer has been successfully deleted.',
      });
    }
  };

  const handleSaveFarmer = (farmerData: any) => {
    if (editingFarmer) {
      // Update existing farmer
      setFarmers(farmers.map(farmer => 
        farmer.id === editingFarmer.id ? { ...farmer, ...farmerData } : farmer
      ));
      setEditingFarmer(null);
      toast({
        title: 'Farmer updated',
        description: 'The farmer profile has been updated successfully.',
      });
    } else {
      // Add new farmer
      const newFarmer = {
        ...farmerData,
        id: farmers.length ? Math.max(...farmers.map(f => f.id)) + 1 : 1,
        fundingRaised: 0,
        supporters: 0,
        featured: false,
      };
      setFarmers([...farmers, newFarmer]);
      toast({
        title: 'Farmer added',
        description: 'A new farmer has been added successfully.',
      });
    }
    setIsAddingFarmer(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Farmer Management Dashboard</h1>
            <Button 
              onClick={() => { setIsAddingFarmer(true); setEditingFarmer(null); }}
              className="bg-farmer-primary hover:bg-farmer-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Farmer
            </Button>
          </div>

          {(isAddingFarmer || editingFarmer) ? (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{editingFarmer ? 'Edit Farmer' : 'Add New Farmer'}</CardTitle>
                <CardDescription>
                  {editingFarmer ? 'Update the farmer details below.' : 'Fill in the details to add a new farmer.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FarmerForm 
                  initialValues={editingFarmer || {}} 
                  onSubmit={handleSaveFarmer} 
                  onCancel={() => {
                    setIsAddingFarmer(false);
                    setEditingFarmer(null);
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Farmers List</CardTitle>
                <CardDescription>
                  Manage all registered farmers on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Crops</TableHead>
                        <TableHead className="text-right">Funding Progress</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {farmers.map((farmer) => (
                        <TableRow key={farmer.id}>
                          <TableCell className="font-medium">{farmer.name}</TableCell>
                          <TableCell>{farmer.location}</TableCell>
                          <TableCell>{farmer.crops.join(', ')}</TableCell>
                          <TableCell className="text-right">
                            {Math.round((farmer.fundingRaised / farmer.fundingGoal) * 100)}%
                            (${farmer.fundingRaised}/${farmer.fundingGoal})
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setEditingFarmer(farmer)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <Link to={`/farmers/${farmer.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteFarmer(farmer.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FarmerDashboard;
