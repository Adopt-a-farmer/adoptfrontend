import React, { useState } from 'react';
import { Shield, Sprout, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BlockchainVerificationPanel from '@/components/farmer/blockchain/BlockchainVerificationPanel';
import PlantingRegistrationForm from '@/components/farmer/blockchain/PlantingRegistrationForm';
import CropLifecycleDashboard from '@/components/farmer/blockchain/CropLifecycleDashboard';
import BlockchainTransactionsList from '@/components/shared/BlockchainTransactionsList';

const FarmerBlockchainDashboard: React.FC = () => {
  const userId = localStorage.getItem('userId') || '';
  const [activeTab, setActiveTab] = useState('lifecycle');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Blockchain Dashboard</h1>
          <p className="text-gray-600">
            Manage your blockchain verification and product traceability
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lifecycle" className="flex items-center gap-2">
            <Sprout className="w-4 h-4" />
            Crop Lifecycle
          </TabsTrigger>
          <TabsTrigger value="register" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Registration
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lifecycle" className="mt-6">
          <CropLifecycleDashboard />
        </TabsContent>

        <TabsContent value="register" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BlockchainVerificationPanel
              farmerId={userId}
              showGenerateWallet={true}
            />
            <PlantingRegistrationForm
              farmId={userId}
              onSuccess={(productId) => {
                console.log('Product registered with ID:', productId);
                // Switch to lifecycle tab after registration
                setActiveTab('lifecycle');
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <BlockchainTransactionsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FarmerBlockchainDashboard;
