import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/useAuthStore';

interface NavigationProps {
  mode?: 'desktop' | 'mobile';
  onNavigate?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  mode = 'desktop',
  onNavigate,
}) => {
  const { user } = useAuthStore();
  const isDoctor = user?.role === 'DOCTOR';

  const navItems = [
    {
      to: '/',
      label: isDoctor ? 'غرفة الكشف' : 'لوحة الاستقبال',
      icon: isDoctor ? 'stethoscope' : 'space_dashboard',
      description: isDoctor
          ? 'متابعة قائمة الانتظار والحالة الحالية'
          : 'إدارة الطابور الحي وحركة المرضى',
    },
    {
      to: '/daily-record',
      label: 'سجل اليوم',
      icon: 'event_note',
      description: 'مراجعة تسلسل اليوم والحالات المسجلة',
    },
    {
      to: '/patients',
      label: 'قاعدة المرضى',
      icon: 'group',
      description: 'الوصول السريع لملفات المرضى وتحديث البيانات',
    },
  ];

  if (mode === 'desktop') {
    return (
      <nav className="flex items-center gap-1" aria-label="التنقل الرئيسي">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 select-none ${isActive
                ? 'bg-clinic-navy text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-clinic-navy'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`material-symbols-outlined text-[18px] ${isActive ? 'text-white' : 'text-clinic-teal'
                    }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    );
  }

  return (
      <nav className="flex flex-col gap-2" aria-label="التنقل الرئيسي">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-200 ${isActive
                ? 'border-clinic-navy bg-clinic-navy text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-700 hover:border-clinic-teal/40 hover:bg-teal-50/40'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                      }`}
              >
                {item.icon}
              </span>
          <div className="flex flex-col text-right min-w-0">
            <span className="text-sm font-bold leading-tight">{item.label}</span>
            <span
                  className={`text-[11px] leading-5 ${isActive ? 'text-white/75' : 'text-slate-500'
                }`}
            >
              {item.description}
            </span>
          </div>
            </>
          )}
    </NavLink>
  ))
}
    </nav >
  );
};
