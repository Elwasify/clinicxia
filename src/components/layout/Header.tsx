import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../features/auth/useAuthStore';
import { ChangePasswordModal } from '../../features/auth/ChangePasswordModal';
import { setConnectivityListener } from '../../api/client';

export const Header: React.FC = () => {
  const { user, logout, switchUser } = useAuthStore();
  const [isOnline, setIsOnline] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setConnectivityListener((online) => setIsOnline(online));
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <>
      <header className="w-full bg-white border-b border-slate-200 shadow-xs z-30 sticky top-0 no-print">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-6 h-[88px] flex items-center justify-between gap-4">
          {/* Clinic Brand & Doctor Details */}
          <div className="flex items-center gap-3.5 min-w-[320px] shrink-0">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-clinic-teal text-3xl">
                local_hospital
              </span>
            </div>
            <div className="flex flex-col text-right">
              <h1 className="text-base font-bold text-clinic-navy leading-tight">
                عيادة أ.د. عفيفي فهمي عفيفي أحمد
              </h1>
              <p className="text-xs font-semibold text-clinic-teal mt-0.5 leading-normal">
                دكتوراه الأمراض الباطنية — استشاري الكبد والجهاز الهضمي
              </p>
              <p className="text-[11px] font-medium text-slate-500 leading-normal">
                أستاذ الأمراض الباطنية — كلية الطب جامعة الزقازيق
              </p>
            </div>
          </div>

          {/* Center Brand, Live Sync & Clock */}
          <div className="hidden lg:flex flex-col items-center justify-center shrink-0 px-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-center gap-1.5 font-bold text-clinic-navy text-sm">
                <span className="material-symbols-outlined text-clinic-teal text-lg">medical_services</span>
                <span className="tracking-wider">CLINICXIA</span>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${
                  isOnline
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? 'bg-emerald-600 animate-pulse' : 'bg-red-600'
                  }`}
                />
                {isOnline ? 'متزامن لحظياً' : 'غير متصل بالخادم'}
              </span>
            </div>

            <div className="flex items-center gap-2.5 relative">
              <span className="text-xs font-medium text-slate-500">{formattedDate}</span>
              <span className="text-slate-300 font-bold">•</span>
              <span className="text-lg font-bold text-clinic-navy font-mono tracking-tight">
                {formattedTime}
              </span>

              <button
                type="button"
                aria-label="عرض التقويم"
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-7 h-7 rounded-lg border border-slate-200 hover:border-clinic-teal bg-slate-50 hover:bg-white text-slate-600 hover:text-clinic-teal flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">calendar_today</span>
              </button>

              {showCalendar && (
                <div className="absolute top-10 bg-white border border-slate-200 shadow-xl rounded-xl p-4 z-50 text-right w-72 animate-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                    <span className="font-bold text-clinic-navy text-xs">جدول مواعيد العيادة</span>
                    <span className="text-[10px] font-semibold text-clinic-teal bg-teal-50 px-2 py-0.5 rounded">
                      الفترة الصباحية
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 text-xs text-slate-700">
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                      <span className="text-slate-500">فترة العيادة:</span>
                      <span className="font-bold font-mono text-clinic-navy">09:00 ص - 03:00 م</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                      <span className="text-slate-500">طبيب العيادة:</span>
                      <span className="font-bold text-clinic-teal">متواجد بغرفة الكشف</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center justify-end gap-3 shrink-0 relative">
            {/* Quick Notifications */}
            <div className="relative">
              <button
                type="button"
                aria-label="التنبيهات الفورية"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-9 h-9 rounded-xl border border-slate-200 hover:border-clinic-teal bg-white text-slate-600 hover:text-clinic-navy flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">notifications</span>
                <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
              </button>

              {showNotifications && (
                <div className="absolute top-11 start-0 bg-white border border-slate-200 shadow-xl rounded-xl p-3.5 z-50 text-right w-72 animate-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
                    <span className="font-bold text-clinic-navy text-xs">التنبيهات الفورية</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      مباشر
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="p-2 rounded-lg bg-teal-50/80 border border-teal-100 text-xs text-slate-700">
                      <p className="font-bold text-clinic-navy text-[11px]">غرفة الكشف جاهزة</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        تم فحص الدور 01 والمريض جاهز لاستلام الروشتة.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200" />

            {/* User Profile dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-right"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-clinic-navy to-clinic-teal text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  {user?.fullName?.charAt(0) || 'م'}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {user?.fullName}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 mt-0.5 leading-none">
                    {user?.role === 'DOCTOR' ? 'طبيب الكشف' : 'موظف استقبال'}
                  </span>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-lg">
                  expand_more
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute top-12 start-0 bg-white border border-slate-200 shadow-xl rounded-xl p-2 z-50 text-right w-52 animate-in zoom-in-95 duration-150">
                  <div className="p-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-clinic-navy">{user?.fullName}</p>
                    <p className="text-[10px] text-slate-500">@{user?.username}</p>
                  </div>

                  {/* Switch Demo Role */}
                  <button
                    type="button"
                    onClick={() => {
                      switchUser(user?.role === 'DOCTOR' ? 'RECEPTIONIST' : 'DOCTOR');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-clinic-teal hover:bg-teal-50 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">swap_horiz</span>
                    <span>
                      التحويل إلى وضع{' '}
                      {user?.role === 'DOCTOR' ? 'الاستقبال' : 'الطبيب'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePass(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">lock_reset</span>
                    <span>تغيير كلمة المرور</span>
                  </button>

                  <div className="h-px bg-slate-100 my-1" />

                  <button
                    type="button"
                    onClick={() => logout()}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <ChangePasswordModal
        isOpen={showChangePass}
        onClose={() => setShowChangePass(false)}
      />
    </>
  );
};
