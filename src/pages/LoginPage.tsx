import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/useAuthStore';
import { authApi } from '../api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ForgotAdminModal } from '../features/auth/ForgotAdminModal';
import { mockUsers } from '../api/mocks/data';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen bg-clinic-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-8 sm:p-10 text-right animate-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-clinic-navy to-clinic-teal text-white flex items-center justify-center shadow-md mb-3">
            <span className="material-symbols-outlined text-3xl">medical_services</span>
          </div>
          <h2 className="text-2xl font-black text-clinic-navy">كلينيكسيا | CLINICXIA</h2>
          <p className="text-xs font-semibold text-clinic-teal mt-1">
            نظام الإدارة الطبية وعيادات الكشف المتكاملة
          </p>
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

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-clinic-teal hover:underline font-semibold cursor-pointer"
            >
              نسيت كلمة المرور؟
            </button>
            <span className="text-slate-400">الحسابات مُدارة مركزياً</span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="w-full mt-2"
          >
            تسجيل الدخول للنظام
          </Button>
        </form>

        {/* Demo Fast Logins for reviewers */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-2.5">
          <p className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-wider">
            دخول سريع للتجربة (Demo Logins)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo(0)}
              className="p-2 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-clinic-teal">stethoscope</span>
              <span>طبيب الكشف</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo(1)}
              className="p-2 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-clinic-navy">desk</span>
              <span>موظف الاستقبال</span>
            </button>
          </div>
        </div>
      </div>

      <ForgotAdminModal isOpen={showForgot} onClose={() => setShowForgot(false)} />
    </div>
  );
};
