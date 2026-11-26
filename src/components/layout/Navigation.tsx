import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/useAuthStore';

interface NavigationProps {
  mode?: 'desktop' | 'mobile';
  onNavigate?: () => void;
}

const linksByRole = {
  DOCTOR: [
    { to: '/', label: 'الرئيسية', icon: 'space_dashboard', end: true },
    { to: '/examination', label: 'غرفة الكشف', icon: 'stethoscope' },
    { to: '/patients', label: 'المرضى', icon: 'group' },
    { to: '/daily-record', label: 'سجل اليوم', icon: 'event_note' },
  ],
  RECEPTIONIST: [
    { to: '/', label: 'الرئيسية', icon: 'space_dashboard', end: true },
    { to: '/daily-record', label: 'طابور اليوم', icon: 'format_list_numbered_rtl' },
    { to: '/patients/new', label: 'تسجيل مريض', icon: 'person_add' },
    { to: '/patients', label: 'قاعدة المرضى', icon: 'group' },
  ],
  ADMIN: [
    { to: '/', label: 'الرئيسية', icon: 'space_dashboard', end: true },
    { to: '/admin/doctors', label: 'الأطباء', icon: 'medical_services' },
    { to: '/admin/staff', label: 'الموظفون', icon: 'badge' },
    { to: '/patients', label: 'المرضى', icon: 'group' },
    { to: '/daily-record', label: 'سجل اليوم', icon: 'event_note' },
    { to: '/admin/clinic-profile', label: 'بيانات العيادة', icon: 'domain' },
  ],
} as const;

export function Navigation({ mode = 'desktop', onNavigate }: NavigationProps) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const role = user?.role || 'DOCTOR';
  const items = linksByRole[role];
  const desktopItems = items.slice(0, 3);
  const moreItems = items.slice(3);
  const moreIsActive = moreItems.some((item) => location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(`${item.to}/`)));

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        moreButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  const linkClass = (active: boolean, mobile: boolean) => mobile
    ? `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${active ? 'bg-clinic-navy text-white' : 'text-slate-700 hover:bg-slate-100'}`
    : `inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${active ? 'bg-clinic-navy text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-clinic-navy'}`;

  if (mode === 'mobile') return (
    <nav aria-label="التنقل الرئيسي" className="flex flex-col gap-1.5">
      {items.map((item) => <NavLink key={item.to} to={item.to} end={'end' in item && item.end} onClick={onNavigate} className={({ isActive }) => linkClass(isActive, true)}>
        <span className="material-symbols-outlined text-lg" aria-hidden="true">{item.icon}</span><span>{item.label}</span>
      </NavLink>)}
    </nav>
  );

  return (
    <nav aria-label="التنقل الرئيسي" className="flex items-center gap-1.5">
      {desktopItems.map((item) => <NavLink key={item.to} to={item.to} end={'end' in item && item.end} aria-current={location.pathname === item.to ? 'page' : undefined} className={({ isActive }) => linkClass(isActive, false)}>
        <span className="material-symbols-outlined text-base" aria-hidden="true">{item.icon}</span><span>{item.label}</span>
      </NavLink>)}
      {moreItems.length > 0 && <div ref={moreRef} className="relative">
        <button ref={moreButtonRef} type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)} className={linkClass(moreIsActive, false)}>
          <span>المزيد</span><span className="material-symbols-outlined text-base" aria-hidden="true">expand_more</span>
        </button>
        {open && <div role="menu" className="absolute end-0 top-full z-50 mt-2 min-w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          {moreItems.map((item) => <NavLink key={item.to} role="menuitem" to={item.to} onClick={() => { setOpen(false); onNavigate?.(); }} className={({ isActive }) => `${linkClass(isActive, true)} text-xs`}>
            <span className="material-symbols-outlined text-base" aria-hidden="true">{item.icon}</span><span>{item.label}</span>
          </NavLink>)}
        </div>}
      </div>}
    </nav>
  );
}
