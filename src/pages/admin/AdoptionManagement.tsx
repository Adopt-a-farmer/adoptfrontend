import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Users, CheckCircle } from 'lucide-react';
import UnassignedFarmersList from '@/components/admin/UnassignedFarmersList';
import AvailableAdoptersList from '@/components/admin/AvailableAdoptersList';
import CreateAdoptionModal from '@/components/admin/CreateAdoptionModal';

const AdoptionManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedAdopter, setSelectedAdopter] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAssignFarmer = (farmerId: string, farmerName: string) => {
    setSelectedFarmer({ id: farmerId, name: farmerName });
    setShowCreateModal(true);
  };

  const handleSelectAdopter = (adopterId: string, adopterName: string) => {
    setSelectedAdopter({ id: adopterId, name: adopterName });
  };

  const handleAdoptionSuccess = () => {
    // Refresh both lists by changing key
    setRefreshKey((prev) => prev + 1);
    // Reset selections
    setSelectedFarmer(null);
    setSelectedAdopter(null);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    // Don't reset selections immediately to allow reopening with same selections
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Adoption Management</h1>
        <p className="text-gray-600 mt-2">
          Link farmers with adopters to create adoption relationships
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned Farmers</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">View Below</div>
            <p className="text-xs text-gray-500 mt-1">
              Verified farmers without adopters
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Adopters</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">View Below</div>
            <p className="text-xs text-gray-500 mt-1">
              Ready to support farmers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Create Adoption</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {selectedFarmer && selectedAdopter ? 'Ready' : 'Select Both'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Select farmer and adopter below
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Unassigned Farmers */}
        <div key={`farmers-${refreshKey}`}>
          <UnassignedFarmersList onAssign={handleAssignFarmer} />
        </div>

        {/* Right: Available Adopters */}
        <div key={`adopters-${refreshKey}`}>
          <AvailableAdoptersList
            onSelect={handleSelectAdopter}
            selectedAdopter={selectedAdopter?.id}
          />
        </div>
      </div>

      {/* Instructions Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">How to Create an Adoption</CardTitle>
          <CardDescription className="text-blue-700">
            Follow these steps to link a farmer with an adopter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-900">
            <li>
              <strong>Select a Farmer:</strong> Click "Assign Adopter" button on an unassigned
              farmer from the left list
            </li>
            <li>
              <strong>Select an Adopter:</strong> Choose an adopter from the right list by
              clicking the "Select" button
            </li>
            <li>
              <strong>Fill Details:</strong> Enter adoption details including monthly amount,
              payment frequency, and expected crops
            </li>
            <li>
              <strong>Review Summary:</strong> Check the adoption summary to ensure all details
              are correct
            </li>
            <li>
              <strong>Create:</strong> Click "Create Adoption" to establish the relationship
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Create Adoption Modal */}
      {showCreateModal && (
        <CreateAdoptionModal
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          onSuccess={handleAdoptionSuccess}
        />
      )}
    </div>
  );
};

export default AdoptionManagement;
