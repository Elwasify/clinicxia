import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api';
import { setConnectivityListener } from '../../api/client';
import { useAuthStore } from '../../features/auth/useAuthStore';
import { Role } from '../../types';
import { ClinicIdentity } from '../ui/ClinicIdentity';
import { ChangePasswordModal } from '../../features/auth/ChangePasswordModal';
import { Navigation } from './Navigation';

const roleLabel: Record<Role, string> = { DOCTOR: 'طبيب', RECEPTIONIST: 'استقبال', ADMIN: 'مدير' };

interface HeaderProps {
  focusMode?: boolean;
}

export function Header({ focusMode = false }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setConnectivityListener(setIsOnline);
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      setConnectivityListener(() => {});
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  useEffect(() => {
    const handlePointer = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setShowUserMenu(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) setShowMobileMenu(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowUserMenu(false);
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const signOut = async () => {
    await authApi.logout().catch(() => undefined);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-xs backdrop-blur-xl no-print">
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between gap-3 ${focusMode ? 'h-12' : 'h-16'}`}>
          <div className="flex min-w-0 items-center gap-3">
            <ClinicIdentity variant="icon-only" size={focusMode ? 'sm' : 'md'} showClinicName={false} className="sm:hidden" />
            <ClinicIdentity size={focusMode ? 'sm' : 'md'} showClinicName={!focusMode} clinicNameClassName="hidden sm:inline" className="hidden sm:flex" />
            {!focusMode && <span className="hidden h-8 w-px bg-slate-200 sm:block" />}
            {!focusMode && <p className="hidden text-[10px] text-slate-500 sm:block">نظام إدارة العيادات</p>}
            {focusMode && <span className="text-xs font-bold text-clinic-teal">وضع الكشف</span>}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {!focusMode && <div className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold sm:inline-flex ${isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`} role="status">
              <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />{isOnline ? 'متصل' : 'غير متصل'}
            </div>}
            <div className="relative" ref={userMenuRef}>
              <button type="button" aria-haspopup="menu" aria-expanded={showUserMenu} onClick={() => setShowUserMenu((value) => !value)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 transition hover:border-clinic-teal/60">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-clinic-teal to-clinic-navy text-xs font-bold text-white">{user?.fullName?.charAt(0) || 'م'}</span>
                <span className="hidden max-w-40 text-right sm:block"><span className="block truncate text-xs font-bold text-slate-800">{user?.fullName}</span><span className="mt-0.5 block text-[10px] text-slate-500">{user ? roleLabel[user.role] : ''}</span></span>
                <span className="material-symbols-outlined hidden text-base text-slate-400 sm:block">expand_more</span>
              </button>
              {showUserMenu && <div role="menu" className="absolute end-0 top-full z-50 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <button role="menuitem" type="button" onClick={() => { setShowChangePass(true); setShowUserMenu(false); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"><span className="material-symbols-outlined text-base">lock_reset</span>تغيير كلمة المرور</button>
                <button role="menuitem" type="button" onClick={() => void signOut()} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50"><span className="material-symbols-outlined text-base">logout</span>تسجيل الخروج</button>
              </div>}
            </div>
            {!focusMode && <button type="button" aria-label={showMobileMenu ? 'إغلاق قائمة التنقل' : 'فتح قائمة التنقل'} aria-expanded={showMobileMenu} onClick={() => setShowMobileMenu((value) => !value)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-clinic-teal lg:hidden">
              <span className="material-symbols-outlined text-xl">{showMobileMenu ? 'close' : 'menu'}</span>
            </button>}
          </div>
        </div>
        {!focusMode && <nav className="hidden border-t border-slate-100 py-2.5 lg:flex lg:justify-center"><Navigation /></nav>}
      </div>
      {showMobileMenu && !focusMode && <div ref={mobileMenuRef} className="absolute inset-x-0 top-full z-50 border-t border-slate-200 bg-white p-3 shadow-xl lg:hidden">
        <Navigation mode="mobile" onNavigate={() => setShowMobileMenu(false)} />
      </div>}
      {showChangePass && <ChangePasswordModal isOpen={showChangePass} onClose={() => setShowChangePass(false)} />}
    </header>
  );
}
