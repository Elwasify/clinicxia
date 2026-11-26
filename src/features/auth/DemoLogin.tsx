import { ShieldCheck, Stethoscope, UsersRound } from 'lucide-react';
import { DEMO_MODE, DEMO_PASSWORD, demoAccounts } from './demoAccounts';
import { Role } from '../../types';

const iconByRole = {
  DOCTOR: Stethoscope,
  RECEPTIONIST: UsersRound,
  ADMIN: ShieldCheck,
} satisfies Record<Role, typeof Stethoscope>;

interface DemoLoginProps {
  loading: boolean;
  enabled?: boolean;
  onLogin: (username: string, password: string) => void;
}

export function DemoLogin({ loading, onLogin, enabled = DEMO_MODE }: DemoLoginProps) {
  if (!enabled) return null;
  return (
    <section aria-label="تجربة سريعة" className="mt-6 border-t border-slate-100 pt-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-black text-slate-700">تجربة سريعة</p>
        <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800">بيانات تجريبية</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {demoAccounts.map(({ role, label, username }) => {
          const Icon = iconByRole[role];
          return (
            <button
              key={role}
              type="button"
              disabled={loading}
              onClick={() => onLogin(username, DEMO_PASSWORD)}
              className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-[11px] font-bold text-slate-700 transition hover:border-clinic-teal hover:bg-teal-50 disabled:opacity-50"
            >
              <Icon size={18} className="text-clinic-teal" aria-hidden="true" />
              <span>دخول كـ {label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
