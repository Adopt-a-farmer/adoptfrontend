
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import HowItWorksPage from "./pages/HowItWorks";
import BrowseFarmers from "./pages/BrowseFarmers";
import FarmerDetail from "./pages/FarmerDetail";
import PaymentCallback from "./pages/PaymentCallback";
import FarmAdoptionPage from "./pages/FarmAdoptionPage";
import KnowledgeHub from "./pages/KnowledgeHub";
import ArticleDetail from "./pages/ArticleDetail";

// Farmer pages
import FarmerDashboard from "./pages/farmer/FarmerDashboard";

// Expert pages  
import ExpertDashboard from "./pages/expert/ExpertDashboard";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import SignupFlow from "./pages/auth/SignupFlow";
import FarmerInvite from "./pages/auth/FarmerInvite";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Admin pages
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import FarmersManagement from "./pages/admin/FarmersManagement";
import AdoptersManagement from "./pages/admin/AdoptersManagement";
import AdoptionsManagement from "./pages/admin/AdoptionsManagement";
import PaymentsManagement from "./pages/admin/PaymentsManagement";
import SuppliersManagement from "./pages/admin/SuppliersManagement";
import AnalyticsManagement from "./pages/admin/AnalyticsManagement";
import SettingsManagement from "./pages/admin/SettingsManagement";
import VerificationManagement from "./pages/admin/VerificationManagement";
import ExpertsManagement from "./pages/admin/ExpertsManagement";

// Adopter pages
import AdopterDashboard from "./pages/adopter/AdopterDashboard";

// Common components
import TawkToWidget from "./components/common/TawkToWidget";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useEffect } from "react";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/browse-farmers" element={<BrowseFarmers />} />
      <Route path="/farmers/:id" element={<FarmerDetail />} />
      <Route path="/farmers/:id/adopt" element={<FarmAdoptionPage />} />
      <Route path="/payment/callback" element={<PaymentCallback />} />
      <Route path="/knowledge" element={<KnowledgeHub />} />
      <Route path="/knowledge/articles/:id" element={<ArticleDetail />} />
      
      {/* Auth Routes */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<SignupFlow />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/reset-password/:token" element={<ResetPassword />} />
      <Route path="/auth/farmer-invite/:token" element={<FarmerInvite />} />

      {/* Redirect /dashboard/farmers to /admin/farmers for consistency */}
      <Route 
        path="/dashboard/farmers" 
        element={<Navigate to="/admin/farmers" replace />} 
      />
      
      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="farmers" element={<FarmersManagement />} />
        <Route path="adopters" element={<AdoptersManagement />} />
        <Route path="experts" element={<ExpertsManagement />} />
        <Route path="verification" element={<VerificationManagement />} />
        <Route path="adoptions" element={<AdoptionsManagement />} />
        <Route path="payments" element={<PaymentsManagement />} />
        <Route path="suppliers" element={<SuppliersManagement />} />
        <Route path="analytics" element={<AnalyticsManagement />} />
        <Route path="settings" element={<SettingsManagement />} />
      </Route>

      {/* Adopter Routes */}
      <Route 
        path="/adopter/*" 
        element={
          <ProtectedRoute allowedRoles={['adopter', 'investor', 'buyer']}>
            <AdopterDashboard />
          </ProtectedRoute>
        }
      />

      {/* Farmer Routes */}
      <Route 
        path="/farmer/*" 
        element={
          <ProtectedRoute requireFarmer>
            <FarmerDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Expert Routes */}
      <Route 
        path="/expert/*" 
        element={
          <ProtectedRoute allowedRoles={['expert']}>
            <ExpertDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <TawkToWidget 
            onLoad={() => console.log('Tawk.to chat loaded')}
            onChatMaximized={() => console.log('Chat maximized')}
            onChatMinimized={() => console.log('Chat minimized')}
          />
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
