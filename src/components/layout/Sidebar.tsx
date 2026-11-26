import React from 'react';
import { NavLink } from 'react-router-dom';
import { ClinicxiaLogo } from '../ui/ClinicxiaLogo';
import { useAuthStore } from '../../features/auth/useAuthStore';

export const Sidebar: React.FC = () => {
  const { user, logout, switchUser } = useAuthStore();
  const isDoctor = user?.role === 'DOCTOR';

  const navItems = [
    {
      to: '/',
      label: 'الرئيسية',
      icon: 'dashboard',
    },
    {
      to: '/daily-record',
      label: 'الطابور',
      icon: 'format_list_numbered_rtl',
    },
    {
      to: '/patients',
      label: 'المرضى',
      icon: 'group',
    },
    {
      to: '/daily-record',
      label: 'المواعيد',
      icon: 'calendar_month',
    },
    {
      to: '/daily-record',
      label: 'الفواتير',
      icon: 'receipt_long',
    },
    {
      to: '/daily-record',
      label: 'التقارير',
      icon: 'analytics',
    },
  ];

  return (
    <aside className="w-64 bg-clinic-navy text-white min-h-screen flex flex-col justify-between p-4 shrink-0 no-print border-l border-slate-800 shadow-xl z-30">
      <div>
        {/* Brand Header */}
        <div className="py-3 px-2 mb-6 border-b border-slate-700/60">
          <ClinicxiaLogo variant="white" size="md" showSubtitle />
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 select-none ${
                  isActive
                    ? 'bg-clinic-teal text-white shadow-md font-bold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`
              }
            >
              <span className="material-symbols-outlined text-xl">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom User Profile & Switcher */}
      <div className="pt-4 border-t border-slate-700/60 flex flex-col gap-3">
        {/* Role Toggle Switch for easy evaluation */}
        <button
          type="button"
          onClick={() => switchUser(isDoctor ? 'RECEPTIONIST' : 'DOCTOR')}
          className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs text-teal-300 font-semibold cursor-pointer transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">swap_horiz</span>
            <span>التبديل إلى {isDoctor ? 'الاستقبال' : 'الطبيب'}</span>
          </span>
          <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-white">
            تجربة
          </span>
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-clinic-teal text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              {user?.fullName?.charAt(0) || 'م'}
            </div>
            <div className="flex flex-col min-w-0 text-right">
              <span className="text-xs font-bold text-white truncate">
                {user?.fullName}
              </span>
              <span className="text-[10px] text-teal-200 truncate">
                {isDoctor ? 'طبيب الكشف' : 'موظف استقبال'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            title="تسجيل الخروج"
            className="text-slate-400 hover:text-red-400 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
