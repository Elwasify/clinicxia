import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../features/auth/useAuthStore';
import { ChangePasswordModal } from '../../features/auth/ChangePasswordModal';
import { setConnectivityListener } from '../../api/client';
import { ClinicxiaLogo } from '../ui/ClinicxiaLogo';
import { Navigation } from './Navigation';

export const Header: React.FC = () => {
  const { user, logout, switchUser } = useAuthStore();
  const [isOnline, setIsOnline] = useState(true);
  const [showChangePass, setShowChangePass] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const isDoctor = user?.role === 'DOCTOR';
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setConnectivityListener((online) => setIsOnline(online));
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
          setShowUserMenu(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showMobileMenu]);

  const formattedTime = currentTime.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const formattedDate = currentTime.toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const userInitial = user?.fullName?.charAt(0) || 'م';
  const roleBadge = isDoctor ? 'طبيب' : 'استقبال';

  return (
    <>
                <header className="sticky top-0 z-40 no-print">
                  <div className="border-b border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-sm">
                    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
                      <div className="flex h-16 items-center justify-between gap-4">

                            {/* Right: Logo + clinic name */}
                            <div className="flex items-center gap-3 min-w-0 shrink-0">
                              <ClinicxiaLogo size="md" showSubtitle={false} />
                              <div className="hidden sm:block h-6 w-px bg-slate-200" />
                              <div className="hidden sm:block min-w-0">
                                <p className="text-sm font-black text-clinic-navy leading-tight">
                                  عيادة أ.د. عفيفي فهمي
                                </p>
                                <p className="text-[10px] text-slate-500 leading-tight">نظام إدارة العيادة</p>
                              </div>
                            </div>

                          {/* Center: Desktop Navigation */}
                          <div className="hidden md:flex flex-1 justify-center px-4">
                            <Navigation />
                          </div>

                            {/* Left: actions */}
                            <div className="flex items-center gap-2 shrink-0">

                              {/* Clock */}
                              <div className="hidden lg:flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5">
                                <span className="material-symbols-outlined text-[16px] text-clinic-teal">schedule</span>
                                <div className="text-right">
                                  <p className="font-mono text-xs font-black text-clinic-navy leading-none">{formattedTime}</p>
                                  <p className="text-[10px] text-slate-500 leading-none mt-0.5">{formattedDate}</p>
                                </div>
                              </div>

                                {/* Online status */}
                                <div className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${isOnline
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-red-200 bg-red-50 text-red-700'
                                  }`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                  <span>{isOnline ? 'متصل' : 'غير متصل'}</span>
                                </div>

                                  {/* User menu */}
                                  <div className="relative" ref={userMenuRef}>
                                    <button
                                      type="button"
                                      onClick={() => setShowUserMenu((p) => !p)}
                                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 shadow-xs transition-all hover:border-clinic-teal/60 hover:shadow-sm"
                                    >
                                      <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-clinic-teal to-clinic-navy text-white flex items-center justify-center font-bold text-xs shrink-0">
                                        {userInitial}
                                      </div>
                                      <div className="hidden sm:block text-right">
                                        <p className="text-xs font-bold text-slate-800 leading-none">{user?.fullName}</p>
                                        <p className="text-[10px] text-slate-500 leading-none mt-0.5">{roleBadge}</p>
                                      </div>
                                      <span className="material-symbols-outlined text-[16px] text-slate-400 hidden sm:block">expand_more</span>
                                    </button>

                                          {showUserMenu && (
                                            <div className="absolute top-11 start-0 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50">
                                              <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                                                <p className="text-xs font-black text-clinic-navy">{user?.fullName}</p>
                                                <p className="text-[11px] text-slate-500 mt-0.5">{roleBadge}</p>
                                              </div>

                                                <button
                                                  type="button"
                                                  onClick={() => { switchUser(isDoctor ? 'RECEPTIONIST' : 'DOCTOR'); setShowUserMenu(false); }}
                                                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-right"
                                                >
                                                  <span className="material-symbols-outlined text-base text-clinic-teal">swap_horiz</span>
                                                  <span>التبديل إلى {isDoctor ? 'الاستقبال' : 'الطبيب'}</span>
                                                  <span className="ms-auto text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">تجربة</span>
                                                </button>

                                                <button
                                                  type="button"
                                                  onClick={() => { setShowChangePass(true); setShowUserMenu(false); }}
                                                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-right"
                                                >
                                                  <span className="material-symbols-outlined text-base text-slate-500">lock_reset</span>
                                                  تغيير كلمة المرور
                                                </button>

                                                <div className="border-t border-slate-100 mt-1 pt-1">
                                                  <button
                                                    type="button"
                                                    onClick={() => { logout(); setShowUserMenu(false); }}
                                                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-right"
                                                  >
                                                    <span className="material-symbols-outlined text-base">logout</span>
                                                    تسجيل الخروج
                                                  </button>
                                                </div>
                                              </div>
                  )}
                                            </div>

                {/* Mobile hamburger */}
                                          <button
                                            type="button"
                                            aria-label="فتح القائمة"
                                            onClick={() => setShowMobileMenu((p) => !p)}
                                            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-clinic-teal"
                                          >
                                            <span className="material-symbols-outlined text-[20px]">
                                              {showMobileMenu ? 'close' : 'menu'}
                                            </span>
                                          </button>
                                        </div>
                                      </div>
          </div>
                                </div>
                              </header>

                                    {/* Mobile Menu */}
                                    {showMobileMenu && (
                                      <>
                                        <div
                                          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden"
                                          onClick={() => setShowMobileMenu(false)}
                                        />
                                        <div className="fixed top-16 inset-x-0 z-40 md:hidden border-b border-slate-200 bg-white shadow-2xl">
                                          <div className="px-4 py-5 space-y-4">
                                            {/* Clock mobile */}
                                            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                                              <span className="material-symbols-outlined text-clinic-teal">schedule</span>
                                              <div>
                                                <p className="font-mono text-base font-black text-clinic-navy">{formattedTime}</p>
                                                <p className="text-xs text-slate-500">{formattedDate}</p>
                                              </div>
                                            </div>

                                            <Navigation mode="mobile" onNavigate={() => setShowMobileMenu(false)} />

                                            <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
                                              <button
                                                type="button"
                                                onClick={() => { switchUser(isDoctor ? 'RECEPTIONIST' : 'DOCTOR'); setShowMobileMenu(false); }}
                                                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
                                              >
                                                <span className="material-symbols-outlined text-clinic-teal">swap_horiz</span>
                                                <span>التبديل إلى {isDoctor ? 'الاستقبال' : 'الطبيب'}</span>
                                                <span className="ms-auto text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">تجربة</span>
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => { logout(); setShowMobileMenu(false); }}
                                                className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                                              >
                                                <span className="material-symbols-outlined">logout</span>
                                                تسجيل الخروج
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                  </>
      )}

                                <ChangePasswordModal
                                  isOpen={showChangePass}
                                  onClose={() => setShowChangePass(false)}
                                />
                              </>
                              );
};
