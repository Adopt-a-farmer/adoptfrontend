
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import HowItWorksPage from "./pages/HowItWorks";
import BrowseFarmers from "./pages/BrowseFarmers";
import FarmerDetail from "./pages/FarmerDetail";
import FarmerDashboard from "./pages/FarmerDashboard";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Admin pages
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import FarmersManagement from "./pages/admin/FarmersManagement";
import AdoptersManagement from "./pages/admin/AdoptersManagement";

// Adopter pages
import AdopterDashboard from "./pages/adopter/AdopterDashboard";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { seedFarmers } from "./utils/seedFarmers";
import { useEffect } from "react";

const queryClient = new QueryClient();

const AppContent = () => {
  useEffect(() => {
    // Seed farmers when app loads
    seedFarmers();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/browse-farmers" element={<BrowseFarmers />} />
      <Route path="/farmers/:id" element={<FarmerDetail />} />
      
      {/* Auth Routes */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />

      {/* Redirect /dashboard/farmers to /admin/farmers for consistency */}
      <Route 
        path="/dashboard/farmers" 
        element={<Navigate to="/admin/farmers" replace />} 
      />
      
      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="farmers" element={<FarmersManagement />} />
        <Route path="adopters" element={<AdoptersManagement />} />
        <Route path="payments" element={<div>Payments Management</div>} />
        <Route path="suppliers" element={<div>Suppliers Management</div>} />
        <Route path="reports" element={<div>Reports</div>} />
        <Route path="analytics" element={<div>Analytics</div>} />
        <Route path="settings" element={<div>Settings</div>} />
      </Route>

      {/* Adopter Routes */}
      <Route 
        path="/adopter/*" 
        element={
          <ProtectedRoute>
            <AdopterDashboard />
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
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
