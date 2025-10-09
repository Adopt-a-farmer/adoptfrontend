import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ExpertLayout from '@/components/expert/ExpertLayout';
import ExpertDashboardHome from '@/components/expert/dashboard/ExpertDashboardHome';
import ArticleManager from '@/components/expert/articles/ArticleManager';
import CreateArticle from '@/components/expert/articles/CreateArticle';
import EditArticle from '@/components/expert/articles/EditArticle';
import ExpertProfile from '@/components/expert/profile/ExpertProfile';
import KnowledgeAnalytics from '@/components/expert/analytics/KnowledgeAnalytics';
import CalendarManager from '@/components/expert/calendar/CalendarManager';
import ExpertSettings from '@/components/expert/settings/ExpertSettings';
import ExpertMentorships from '@/components/expert/mentorships/ExpertMentorships';
import InvestorFarmerRelationships from '@/components/expert/investors/InvestorFarmerRelationships';
import ExpertMessaging from '@/components/expert/messages/ExpertMessaging';
import ExpertFarmVisits from '@/components/expert/visits/ExpertFarmVisits';
import ExpertDiscoverFarmers from '@/components/expert/farmers/DiscoverFarmers';
import ExpertBlockchainDashboard from '@/components/expert/blockchain/ExpertBlockchainDashboard';

const ExpertDashboard = () => {
  return (
    <ExpertLayout>
      <Routes>
        <Route index element={<ExpertDashboardHome />} />
        <Route path="articles" element={<ArticleManager />} />
        <Route path="articles/create" element={<CreateArticle />} />
        <Route path="articles/edit/:id" element={<EditArticle />} />
        <Route path="mentorships" element={<ExpertMentorships />} />
        <Route path="farmers" element={<ExpertDiscoverFarmers />} />
        <Route path="investors" element={<InvestorFarmerRelationships />} />
        <Route path="messages" element={<ExpertMessaging />} />
        <Route path="visits" element={<ExpertFarmVisits />} />
        <Route path="blockchain" element={<ExpertBlockchainDashboard />} />
        <Route path="profile" element={<ExpertProfile />} />
        <Route path="analytics" element={<KnowledgeAnalytics />} />
        <Route path="calendar" element={<CalendarManager />} />
        <Route path="settings" element={<ExpertSettings />} />
      </Routes>
    </ExpertLayout>
  );
};

export default ExpertDashboard;