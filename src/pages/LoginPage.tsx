import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/useAuthStore';
import { authApi } from '../api';
import { Input } from '../components/ui/Input';
import { ClinicxiaLogo } from '../components/ui/ClinicxiaLogo';
import { ForgotAdminModal } from '../features/auth/ForgotAdminModal';
import { mockUsers } from '../api/mocks/data';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login({ username, password });
      login(res.user, res.token);
      navigate('/');
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (userIndex: number) => {
    const user = mockUsers[userIndex];
    setUsername(user.username);
    setPassword('123456');
  };

  return (
    <div className="min-h-screen bg-clinic-bg flex items-center justify-center p-4 text-right">
      <div className="w-full max-w-[420px] bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-8 sm:p-10 animate-in zoom-in-95 duration-200">
        {/* Brand Header matching Login Screen in guide */}
        <div className="flex flex-col items-center text-center mb-8">
          <ClinicxiaLogo variant="stacked" size="lg" showSubtitle />
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-lg shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="اسم المستخدم"
            placeholder="اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            icon={<span className="material-symbols-outlined text-lg">person</span>}
            required
          />

          <Input
            type="password"
            label="كلمة المرور"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<span className="material-symbols-outlined text-lg">lock</span>}
            required
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded accent-clinic-teal w-4 h-4"
              />
              <span>تذكرني</span>
            </label>

            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-clinic-teal hover:underline font-semibold cursor-pointer"
            >
              نسيت كلمة المرور؟
            </button>
          </div>

          {/* Teal CTA button matching Login Screen in guide */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 px-6 rounded-xl bg-clinic-teal hover:bg-clinic-teal-light active:bg-teal-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>تسجيل الدخول</span>
                <span className="material-symbols-outlined text-lg rtl:rotate-180">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Switchers */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col gap-2">
          <span className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-wider">
            دخول تجريبي سريع
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo(0)}
              className="p-2 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-clinic-teal">
                stethoscope
              </span>
              <span>طبيب الكشف</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo(1)}
              className="p-2 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-clinic-navy">
                desk
              </span>
              <span>الاستقبال</span>
            </button>
          </div>
        </div>
      </div>

      <ForgotAdminModal isOpen={showForgot} onClose={() => setShowForgot(false)} />
    </div>
  );
};
