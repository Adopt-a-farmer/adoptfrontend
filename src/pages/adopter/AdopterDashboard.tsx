
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdopterLayout from '@/components/adopter/AdopterLayout';
import DashboardOverview from '@/components/adopter/dashboard/DashboardOverview';
import MyFarmers from '@/components/adopter/farmers/MyFarmers';
import DiscoverFarmers from '@/components/adopter/farmers/DiscoverFarmers';
import MessagesCenter from '@/components/adopter/messages/MessagesCenter';
import WalletPayments from '@/components/adopter/wallet/WalletPayments';
import KnowledgeHub from '@/components/adopter/knowledge/KnowledgeHub';
import FarmVisitPlanner from '@/components/adopter/visits/FarmVisitPlanner';
import CrowdfundingHub from '@/components/adopter/crowdfunding/CrowdfundingHub';
import ProfileSettings from '@/components/adopter/profile/ProfileSettings';
import AdopterMentoring from '@/components/adopter/mentoring/AdopterMentoring';

const AdopterDashboard = () => {
  return (
    <AdopterLayout>
      <Routes>
        <Route index element={<DashboardOverview />} />
        <Route path="my-farmers" element={<MyFarmers />} />
        <Route path="discover" element={<DiscoverFarmers />} />
        <Route path="mentoring" element={<AdopterMentoring />} />
        <Route path="messages" element={<MessagesCenter />} />
        <Route path="wallet" element={<WalletPayments />} />
        <Route path="knowledge" element={<KnowledgeHub />} />
        <Route path="visits" element={<FarmVisitPlanner />} />
        <Route path="crowdfunding" element={<CrowdfundingHub />} />
        <Route path="profile" element={<ProfileSettings />} />
      </Routes>
    </AdopterLayout>
  );
};

export default AdopterDashboard;
