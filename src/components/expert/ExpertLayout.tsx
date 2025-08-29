import React, { useState } from 'react';
import ExpertSidebar from '@/components/expert/ExpertSidebar';
import ExpertHeader from '@/components/expert/ExpertHeader';

interface ExpertLayoutProps {
  children: React.ReactNode;
}

const ExpertLayout = ({ children }: ExpertLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 transition-transform lg:relative lg:translate-x-0`}>
        <ExpertSidebar />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <ExpertHeader onToggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ExpertLayout;