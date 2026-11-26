import { Link } from 'react-router-dom';
import { BadgeCheck, ClipboardList, Stethoscope, UsersRound } from 'lucide-react';
import { DashboardOverview } from '../dashboard/DashboardOverview';

const links = [
  { to: '/admin/doctors', label: 'الأطباء', description: 'استعراض قائمة الأطباء المسجلين.', icon: Stethoscope },
  { to: '/admin/staff', label: 'الموظفون', description: 'استعراض حسابات فريق الاستقبال.', icon: UsersRound },
  { to: '/patients', label: 'المرضى', description: 'فتح قاعدة بيانات المرضى.', icon: BadgeCheck },
  { to: '/daily-record', label: 'سجل اليوم', description: 'مراجعة الطابور وحالات الزيارات.', icon: ClipboardList },
];

export function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs font-black uppercase tracking-widest text-clinic-teal">لوحة الإدارة</p>
        <h1 className="mt-1 text-2xl font-black text-clinic-navy sm:text-3xl">ملخص نشاط العيادة</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">متابعة بيانات المرضى والزيارات وفريق العمل من مصدر البيانات نفسه المستخدم في الاستقبال والطبيب.</p>
      </header>
      <DashboardOverview includeStaffMetrics />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="مساحات الإدارة">
        {links.map(({ to, label, description, icon: Icon }) => <Link key={to} to={to} className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-clinic-teal/50 hover:shadow-sm">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-clinic-teal transition group-hover:bg-teal-50"><Icon size={20} aria-hidden="true" /></span>
          <span><strong className="block text-sm font-black text-clinic-navy">{label}</strong><span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span></span>
        </Link>)}
      </section>
    </div>
  );
}
