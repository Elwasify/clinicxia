import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { ToastContainer } from '../ui/Toast';

export const AppLayout: React.FC = () => {
  return (
      <div className="min-h-screen bg-clinic-bg text-right">
        <Header />
        <main className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <Outlet />
        </main>
        <ToastContainer />
      </div>
      );
};
