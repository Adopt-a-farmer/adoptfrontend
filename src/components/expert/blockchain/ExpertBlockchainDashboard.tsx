import React from 'react';
import { Shield } from 'lucide-react';
import ProductTraceabilityViewer from '@/components/adopter/blockchain/ProductTraceabilityViewer';
import BlockchainTransactionsList from '@/components/shared/BlockchainTransactionsList';

const ExpertBlockchainDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Blockchain Dashboard</h1>
          <p className="text-gray-600">
            Verify farmer authenticity and track product traceability
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div>
          <ProductTraceabilityViewer />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <BlockchainTransactionsList />

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-lg text-green-900 mb-3">
              Why Blockchain Matters for Experts
            </h3>
            <div className="space-y-3 text-sm text-green-800">
              <div className="flex items-start gap-2">
                <span className="font-semibold">🔍</span>
                <span>Verify which farmers are blockchain-certified before providing consultations</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold">📊</span>
                <span>Track product quality and farming practices through on-chain data</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold">🤝</span>
                <span>Build trust by working with verified, transparent farmers</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold">📈</span>
                <span>Use blockchain data to measure impact of your training and advice</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertBlockchainDashboard;
