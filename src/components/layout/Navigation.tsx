import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/useAuthStore';

export const Navigation: React.FC = () => {
  const { user } = useAuthStore();
  const isDoctor = user?.role === 'DOCTOR';

  const baseTabClass =
    'flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm transition-all select-none cursor-pointer';
  const activeTabClass = 'bg-clinic-navy text-white shadow-sm';
  const inactiveTabClass = 'text-slate-700 hover:text-clinic-teal hover:bg-slate-100';

  return (
    <nav className="w-full bg-white border-b border-slate-200 shadow-xs sticky top-[88px] z-20 no-print">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 h-[54px] flex items-center justify-between">
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 gap-1 shadow-inner">
          {/* Main Dashboard: live queue for reception or doctor dashboard */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${baseTabClass} ${isActive ? activeTabClass : inactiveTabClass}`
            }
          >
            <span className="material-symbols-outlined text-lg">
              {isDoctor ? 'stethoscope' : 'dashboard'}
            </span>
            <span>{isDoctor ? 'عيادتي والكشوفات' : 'الرئيسية (الطابور الحي)'}</span>
          </NavLink>

          {/* Daily Record */}
          <NavLink
            to="/daily-record"
            className={({ isActive }) =>
              `${baseTabClass} ${isActive ? activeTabClass : inactiveTabClass}`
            }
          >
            <span className="material-symbols-outlined text-lg">event_note</span>
            <span>سجل اليوم</span>
          </NavLink>

          {/* Patients Database */}
          <NavLink
            to="/patients"
            className={({ isActive }) =>
              `${baseTabClass} ${isActive ? activeTabClass : inactiveTabClass}`
            }
          >
            <span className="material-symbols-outlined text-lg">person_search</span>
            <span>المرضى</span>
            <span className="text-[11px] opacity-75 mr-1 border-r border-slate-300 pr-2">
              قاعدة البيانات
            </span>
          </NavLink>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>الدور الحالي في العيادة:</span>
          <span className="font-mono font-bold text-clinic-navy bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            01
          </span>
        </div>
      </div>
    </nav>
  );
};
