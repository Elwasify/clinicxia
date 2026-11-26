import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../features/auth/useAuthStore';
import { authApi } from '../api';
import { Input } from '../components/ui/Input';
import { ClinicxiaLogo } from '../components/ui/ClinicxiaLogo';
import { ForgotAdminModal } from '../features/auth/ForgotAdminModal';
import { DemoLogin } from '../features/auth/DemoLogin';
import { Role } from '../types';

const roleNames: Record<Role, string> = { DOCTOR: 'الطبيب', RECEPTIONIST: 'الاستقبال', ADMIN: 'المدير' };

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(searchParams.get('reason') === 'session-expired' ? 'انتهت صلاحية الجلسة. سجّل الدخول للمتابعة.' : '');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const hintedRole = searchParams.get('role') as Role | null;

  const handleCredentials = async (nextUsername: string, nextPassword: string) => {
    setError('');
    if (!nextUsername.trim() || !nextPassword) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    setLoading(true);
    try {
      const response = await authApi.login({ username: nextUsername, password: nextPassword });
      login(response.user, response.token);
      navigate('/', { replace: true });
    } catch (requestError: unknown) {
      const apiError = requestError as { message?: string };
      setError(apiError.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void handleCredentials(username, password);
  };

  return (
    <main dir="rtl" className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 text-right" style={{ background: 'linear-gradient(135deg, #0b2545 0%, #0f4c75 50%, #0f7c82 100%)' }}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-48 -left-24 h-[500px] w-[500px] rounded-full bg-white/5" />
      </div>
      <div className="relative w-full max-w-[460px]">
        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="h-1.5 bg-gradient-to-l from-clinic-teal to-clinic-navy" />
          <div className="p-7 sm:p-9">
            <div className="mb-7 flex flex-col items-center text-center">
              <ClinicxiaLogo variant="stacked" size="lg" showSubtitle />
              <p className="mt-3 text-xs text-slate-500">منصة إدارة عيادة أ.د. عفيفي فهمي</p>
            </div>
            {hintedRole && roleNames[hintedRole] && (
              <div className="mb-4 rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-xs leading-5 text-cyan-900">
                مسار الدخول المقترح: <strong>{roleNames[hintedRole]}</strong>. الصلاحيات والدور الفعليان يحددهما حسابك في النظام.
              </div>
            )}
            {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold leading-5 text-red-700">{error}</div>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input label="اسم المستخدم" placeholder="أدخل اسم المستخدم" value={username} onChange={(event) => setUsername(event.target.value)} icon={<span className="material-symbols-outlined text-lg">person</span>} required autoComplete="username" />
              <Input type="password" label="كلمة المرور" placeholder="أدخل كلمة المرور" value={password} onChange={(event) => setPassword(event.target.value)} icon={<span className="material-symbols-outlined text-lg">lock</span>} required autoComplete="current-password" />
              <div className="flex justify-end pt-0.5">
                <button type="button" onClick={() => setShowForgot(true)} className="text-xs font-semibold text-clinic-teal transition hover:underline">نسيت كلمة المرور؟</button>
              </div>
              <button type="submit" disabled={loading} className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-clinic-teal to-clinic-navy px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-50">
                {loading ? <span role="status" aria-label="جارٍ تسجيل الدخول" className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><span className="material-symbols-outlined text-lg">login</span><span>تسجيل الدخول</span></>}
              </button>
            </form>

            <DemoLogin loading={loading} onLogin={(demoUsername, demoPassword) => void handleCredentials(demoUsername, demoPassword)} />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-center gap-3 text-xs text-white/70">
          <Link to="/" className="font-semibold hover:text-white">العودة للصفحة الرئيسية</Link>
          <span aria-hidden="true">·</span>
          <span>CLINICXIA © {new Date().getFullYear()}</span>
        </div>
      </div>
      <ForgotAdminModal isOpen={showForgot} onClose={() => setShowForgot(false)} />
    </main>
  );
};
