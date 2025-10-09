import React from 'react';
import { Shield, Package } from 'lucide-react';
import ProductTraceabilityViewer from './ProductTraceabilityViewer';
import BlockchainTransactionsList from '@/components/shared/BlockchainTransactionsList';

const AdopterBlockchainDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Blockchain Verification</h1>
          <p className="text-gray-600">
            Verify product authenticity and view your blockchain transactions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <ProductTraceabilityViewer />

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <Package className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-lg text-blue-900">How to Verify Products</h3>
                <p className="text-sm text-blue-800 mt-1">
                  Every farmer you adopt can register their crops on the blockchain. Ask them for the Product ID
                  to verify their produce authenticity.
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <span className="font-semibold">1.</span>
                <span>Request Product ID from your adopted farmer</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold">2.</span>
                <span>Enter the ID in the search box above</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold">3.</span>
                <span>View complete farm-to-table journey with blockchain proof</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          <BlockchainTransactionsList />
        </div>
      </div>
    </div>
  );
};

export default AdopterBlockchainDashboard;
