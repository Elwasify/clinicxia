import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../features/auth/useAuthStore';
import { ChangePasswordModal } from '../../features/auth/ChangePasswordModal';
import { setConnectivityListener } from '../../api/client';

export const Header: React.FC = () => {
  const { user } = useAuthStore();
  const [isOnline, setIsOnline] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
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
      <header className="w-full bg-white border-b border-slate-200/90 shadow-xs z-20 sticky top-0 no-print h-16 flex items-center px-4 sm:px-6 justify-between">
        {/* Right side: CLINICXIA Emblem & Clinic Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/brand/emblem-for-light-bg.png"
              alt="CLINICXIA"
              className="w-8 h-8 object-contain shrink-0 drop-shadow-xs"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/brand/app-icon.jpg';
              }}
            />
            <div className="flex flex-col text-right">
              <h1 className="text-xs sm:text-sm font-bold text-clinic-navy leading-tight">
                عيادة أ.د. عفيفي فهمي عفيفي أحمد
              </h1>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-500">
                دكتوراه الأمراض الباطنية — استشاري الكبد والجهاز الهضمي
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live Sync Status & Clock */}
        <div className="hidden md:flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            {isOnline ? 'متزامن لحظياً' : 'غير متصل بالخادم'}
          </span>

          <span className="text-slate-300 font-bold">•</span>
          <span className="text-xs text-slate-500 font-medium">{formattedDate}</span>
          <span className="text-slate-300 font-bold">•</span>
          <span className="text-sm font-bold text-clinic-navy font-mono">
            {formattedTime}
          </span>
        </div>

        {/* Left side: Notifications & Change Password */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              aria-label="الإشعارات"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-9 h-9 rounded-xl border border-slate-200 hover:border-clinic-teal bg-slate-50 hover:bg-white text-slate-600 hover:text-clinic-navy flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">notifications</span>
              <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
            </button>

            {showNotifications && (
              <div className="absolute top-11 start-0 bg-white border border-slate-200 shadow-xl rounded-2xl p-3 z-50 text-right w-72 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="font-bold text-clinic-navy text-xs">التنبيهات الفورية</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    مباشر
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100 text-xs text-slate-700">
                  <p className="font-bold text-clinic-navy text-[11px]">جاهزية غرفة الكشف</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    العيادة جاهزة لاستقبال الدور 02 (أيمن كمال الشاذلي).
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Change Password Button */}
          <button
            type="button"
            onClick={() => setShowChangePass(true)}
            title="تغيير كلمة المرور"
            className="w-9 h-9 rounded-xl border border-slate-200 hover:border-clinic-teal bg-slate-50 hover:bg-white text-slate-600 hover:text-clinic-navy flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">lock_reset</span>
          </button>
        </div>
      </header>

      <ChangePasswordModal
        isOpen={showChangePass}
        onClose={() => setShowChangePass(false)}
      />
    </>
  );
};
