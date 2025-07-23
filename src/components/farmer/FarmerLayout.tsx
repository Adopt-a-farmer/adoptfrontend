import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import FarmerSidebar from './FarmerSidebar';
import FarmerHeader from './FarmerHeader';

interface FarmerLayoutProps {
  children: React.ReactNode;
}

const FarmerLayout = ({ children }: FarmerLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <FarmerSidebar />
        <div className="flex-1 flex flex-col">
          <FarmerHeader />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default FarmerLayout;