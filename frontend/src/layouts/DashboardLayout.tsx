import React, { useState } from 'react';
import Navbar from '@components/Common/Navbar';
import Sidebar from '@components/Common/Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Navbar */}
      <Navbar onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} />

        {/* Main Content */}
        <main className="flex-1 w-full lg:ml-0">
          {/* Close sidebar on mobile when clicking content */}
          <div
            onClick={() => sidebarOpen && setSidebarOpen(false)}
            className="min-h-screen p-6 lg:p-8"
          >
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default DashboardLayout;
