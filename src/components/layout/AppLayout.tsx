import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { ToastContainer } from '../ui/Toast';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-clinic-bg flex flex-col text-right">
      <Header />
      <Navigation />
      <main className="flex-1 max-w-[1560px] w-full mx-auto p-4 sm:p-6 pb-16">
        <Outlet />
      </main>
      <footer className="w-full bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500 no-print">
        <div className="max-w-[1560px] mx-auto px-6 flex items-center justify-between">
          <p>© {new Date().getFullYear()} كلينيكسيا — نظام إدارة العيادات الطبية المتكامل</p>
          <p className="font-mono text-slate-400">CLINICXIA v1.0.0 MVP</p>
        </div>
      </footer>
      <ToastContainer />
    </div>
  );
};
