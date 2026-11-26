import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi, authApi } from '../../api';
import { useAuthStore } from '../../features/auth/useAuthStore';
import { DEMO_MODE } from '../../features/auth/demoAccounts';
import { useToastStore } from '../ui/Toast';

const nextRole = { DOCTOR: 'RECEPTIONIST', RECEPTIONIST: 'DOCTOR', ADMIN: 'RECEPTIONIST' } as const;
const nextRoleName = { DOCTOR: 'الاستقبال', RECEPTIONIST: 'الطبيب', ADMIN: 'الاستقبال' } as const;

export function DemoTour() {
  const { user, logout } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);
  const [resetting, setResetting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  if (!DEMO_MODE || !user || dismissed) return null;

  const switchAccount = async () => {
    await authApi.logout().catch(() => undefined);
    logout();
    navigate(`/login?role=${nextRole[user.role]}`);
  };

  const reset = async () => {
    setResetting(true);
    try {
      await adminApi.resetDemo();
      await queryClient.invalidateQueries();
      addToast({ type: 'success', title: 'تمت إعادة الضبط', message: 'عادت بيانات العرض إلى الحالة الأولى.' });
    } catch (error) {
      const message = (error as { message?: string }).message || 'تعذر إعادة بيانات العرض.';
      addToast({ type: 'error', title: 'تعذر إعادة الضبط', message });
    } finally {
      setResetting(false);
    }
  };

  return (
    <section aria-label="إرشادات الجولة التجريبية" className="mx-auto mt-3 flex max-w-screen-2xl flex-wrap items-center gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-xs text-cyan-950 shadow-xs sm:px-6 lg:px-8">
      <span className="rounded-full bg-cyan-100 px-2.5 py-1 font-black">بيانات تجريبية</span>
      <p className="min-w-0 flex-1 leading-5">جولة العرض: جرّب تسجيل مريض من الاستقبال، ثم سجّل الدخول كطبيب لبدء الكشف ومتابعة تحديث الزيارة.</p>
      <button type="button" onClick={() => void switchAccount()} className="font-bold underline underline-offset-2">متابعة كـ {nextRoleName[user.role]}</button>
      {user.role === 'ADMIN' && <button type="button" disabled={resetting} onClick={() => void reset()} className="rounded-lg border border-cyan-300 px-3 py-1.5 font-bold disabled:opacity-50">{resetting ? 'جارٍ الضبط…' : 'إعادة ضبط بيانات العرض'}</button>}
      <Link to="/patients" className="font-bold underline underline-offset-2">فتح المرضى</Link>
      <button type="button" aria-label="إخفاء إرشادات الجولة" onClick={() => setDismissed(true)} className="ms-auto rounded-lg p-1 hover:bg-cyan-100"><span className="material-symbols-outlined text-base">close</span></button>
    </section>
  );
}
