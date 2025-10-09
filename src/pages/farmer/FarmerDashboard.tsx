import React from 'react';
import { Routes, Route } from 'react-router-dom';
import FarmerLayout from '@/components/farmer/FarmerLayout';
import DashboardHome from '@/components/farmer/dashboard/DashboardHome';
import FarmProfileManager from '@/components/farmer/profile/FarmProfileManager';
import AdopterRelationshipCenter from '@/components/farmer/adopters/AdopterRelationshipCenter';
import UpdatesMediaManager from '@/components/farmer/updates/UpdatesMediaManager';
import MessagingCenter from '@/components/farmer/messages/MessagingCenter';
import WalletWithdrawals from '@/components/farmer/wallet/WalletWithdrawals';
import FarmVisitScheduler from '@/components/farmer/visits/FarmVisitScheduler';
import KnowledgeHubTraining from '@/components/farmer/knowledge/KnowledgeHubTraining';
import ImpactReporting from '@/components/farmer/reports/ImpactReporting';
import FarmerProfileSettings from '@/components/farmer/settings/FarmerProfileSettings';
import FarmerBlockchainDashboard from '@/components/farmer/blockchain/FarmerBlockchainDashboard';
import FarmerStoriesPage from '@/pages/farmer/FarmerStoriesPage';

const FarmerDashboard = () => {
  return (
    <FarmerLayout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="farm-profile" element={<FarmProfileManager />} />
        <Route path="adopters" element={<AdopterRelationshipCenter />} />
        <Route path="updates" element={<UpdatesMediaManager />} />
        <Route path="messages" element={<MessagingCenter />} />
        <Route path="wallet" element={<WalletWithdrawals />} />
        <Route path="visits" element={<FarmVisitScheduler />} />
        <Route path="knowledge" element={<KnowledgeHubTraining />} />
        <Route path="stories" element={<FarmerStoriesPage />} />
        <Route path="reports" element={<ImpactReporting />} />
        <Route path="blockchain" element={<FarmerBlockchainDashboard />} />
        <Route path="settings" element={<FarmerProfileSettings />} />
      </Routes>
    </FarmerLayout>
  );
};

export default FarmerDashboard;