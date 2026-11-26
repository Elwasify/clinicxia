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
        <div className="min-h-screen flex items-center justify-center p-4 text-right relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0b2545 0%, #0f4c75 50%, #0f7c82 100%)' }}
        >
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
            <div className="absolute -bottom-48 -left-24 w-[500px] h-[500px] rounded-full bg-white/3" />
            <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-clinic-teal/10" />
          </div>

          <div className="relative w-full max-w-[420px]">
            {/* Card */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Top accent bar */}
              <div className="h-1.5 bg-gradient-to-l from-clinic-teal to-clinic-navy" />

                <div className="p-8 sm:p-10">
                  {/* Brand */}
                  <div className="flex flex-col items-center text-center mb-8">
                    <ClinicxiaLogo variant="stacked" size="lg" showSubtitle />
                    <p className="mt-3 text-xs text-slate-500 leading-6">
                      منصة إدارة العيادة المتكاملة
                    </p>
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                      <span className="material-symbols-outlined text-red-500 text-lg shrink-0">error</span>
                      <span className="text-xs font-semibold text-red-700">{error}</span>
                    </div>
                  )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Input
                          label="اسم المستخدم"
                          placeholder="أدخل اسم المستخدم"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          icon={<span className="material-symbols-outlined text-lg">person</span>}
                          required
                        />

                  <Input
                    type="password"
                    label="كلمة المرور"
                    placeholder="أدخل كلمة المرور"
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
                      className="text-clinic-teal hover:text-clinic-teal-light font-semibold hover:underline cursor-pointer transition-colors"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-l from-clinic-teal to-clinic-navy text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">login</span>
                        <span>تسجيل الدخول</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Demo buttons */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <p className="text-center text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-wider">
                    دخول سريع للتجربة
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickDemo(0)}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 text-xs bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-clinic-teal/40 rounded-xl text-slate-700 font-semibold transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm text-clinic-teal">stethoscope</span>
                      <span>الطبيب</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo(1)}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 text-xs bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-clinic-teal/40 rounded-xl text-slate-700 font-semibold transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm text-clinic-navy">desk</span>
                      <span>الاستقبال</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <p className="text-center text-white/50 text-[11px] mt-5">
              Clinicxia © {new Date().getFullYear()} — جميع الحقوق محفوظة
            </p>
          </div>

          <ForgotAdminModal isOpen={showForgot} onClose={() => setShowForgot(false)} />
        </div>
        );
};
