import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../ui/Toast';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-clinic-bg flex flex-row text-right">
      {/* Dark Navy Sidebar matching design board */}
      <Sidebar />

      {/* Main App Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1560px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
