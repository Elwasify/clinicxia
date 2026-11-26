import { ReactNode } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ClinicxiaLogo } from '../../components/ui/ClinicxiaLogo';
import { useAuthStore } from '../auth/useAuthStore';
import { useClinic } from './ClinicContext';

function ClinicSetupPending() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  return (
    <main dir="rtl" className="flex min-h-screen items-center justify-center bg-clinic-bg p-5 text-right">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10">
        <ClinicxiaLogo variant="stacked" size="lg" />
        <h1 className="mt-7 text-xl font-black text-clinic-navy">بيانات المنشأة لم تُستكمل بعد</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">يرجى التواصل مع المدير لإكمال الإعداد الأول قبل استخدام النظام.</p>
        <button type="button" onClick={() => { logout(); navigate('/login', { replace: true }); }} className="mt-6 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">تسجيل الخروج</button>
      </section>
    </main>
  );
}

function ClinicProfileLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <main dir="rtl" className="flex min-h-screen items-center justify-center bg-clinic-bg p-5 text-right">
      <section className="w-full max-w-lg rounded-3xl border border-amber-200 bg-white p-7 text-center shadow-sm sm:p-10">
        <p role="alert" className="text-sm font-semibold leading-6 text-amber-900">تعذر تحميل بيانات العيادة. تحقق من الاتصال ثم أعد المحاولة.</p>
        <button type="button" onClick={onRetry} className="mt-5 rounded-xl bg-clinic-navy px-5 py-2.5 text-sm font-bold text-white">إعادة المحاولة</button>
      </section>
    </main>
  );
}

export function ClinicProfileGuard({ children }: { children: ReactNode }) {
  const { profile, isLoading, isError, isNotFound, refetch } = useClinic();
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (isLoading) {
    return <main role="status" className="flex min-h-screen items-center justify-center text-sm text-slate-500">جارٍ تحميل بيانات المنشأة…</main>;
  }
  if (isError && !isNotFound) return <ClinicProfileLoadError onRetry={() => void refetch()} />;

  if (!profile && isNotFound) {
    if (user?.role === 'ADMIN') {
      if (location.pathname !== '/admin/clinic-profile') return <Navigate to="/admin/clinic-profile" replace />;
    } else {
      return <ClinicSetupPending />;
    }
  }

  return <>{children}</>;
}
