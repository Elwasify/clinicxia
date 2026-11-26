import { useQuery } from '@tanstack/react-query';
import { adminApi, doctorsApi } from '../api';
import { User } from '../types';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';

interface AdminDirectoryPageProps {
  kind: 'doctors' | 'staff';
}

export function AdminDirectoryPage({ kind }: AdminDirectoryPageProps) {
  const isDoctors = kind === 'doctors';
  const doctorsQuery = useQuery({ queryKey: ['doctors'], queryFn: doctorsApi.list, enabled: isDoctors });
  const usersQuery = useQuery({ queryKey: ['admin-users'], queryFn: adminApi.listUsers, enabled: !isDoctors });
  const isLoading = isDoctors ? doctorsQuery.isLoading : usersQuery.isLoading;
  const isError = isDoctors ? doctorsQuery.isError : usersQuery.isError;
  const retry = isDoctors ? doctorsQuery.refetch : usersQuery.refetch;
  const doctors = doctorsQuery.data || [];
  const staff: User[] = (usersQuery.data || []).filter((user) => user.role === 'RECEPTIONIST');

  return (
    <section className="flex flex-col gap-5">
      <header>
        <p className="text-xs font-black uppercase tracking-wider text-clinic-teal">إدارة العيادة</p>
        <h1 className="mt-1 text-2xl font-black text-clinic-navy">{isDoctors ? 'الأطباء' : 'الموظفون'}</h1>
        <p className="mt-1 text-sm text-slate-500">{isDoctors ? 'قائمة الأطباء المسجلين في مصدر بيانات العيادة.' : 'قائمة حسابات فريق الاستقبال المسجلة في النظام.'}</p>
      </header>
      {isLoading ? <LoadingSkeleton rows={4} /> : isError ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">تعذر تحميل القائمة. <button type="button" onClick={() => void retry()} className="font-bold underline">إعادة المحاولة</button></div>
      ) : isDoctors ? doctors.length === 0 ? (
        <EmptyState icon="medical_services" title="لا يوجد أطباء مسجلون" description="ستظهر القائمة هنا عند إضافة بيانات الأطباء إلى النظام." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {doctors.map((doctor) => <article key={doctor.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-2xl text-cyan-700">medical_services</span>
              <div className="min-w-0 flex-1">
                <h2 className="font-black text-clinic-navy">{doctor.name}</h2>
                <p className="mt-1 text-sm text-slate-600">{doctor.title}</p>
                <p className="mt-2 text-xs text-slate-500">{doctor.specialty}</p>
                <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${doctor.availableToday ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{doctor.availableToday ? 'متاح اليوم' : 'غير متاح اليوم'}</span>
              </div>
            </div>
          </article>)}
        </div>
      ) : staff.length === 0 ? (
        <EmptyState icon="badge" title="لا يوجد موظفون مسجلون" description="ستظهر حسابات الموظفين هنا عند إضافتها من النظام." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-right">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500"><tr><th className="p-4">الموظف</th><th className="p-4">اسم الحساب</th><th className="p-4">الدور</th></tr></thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">{staff.map((user) => <tr key={user.id}><td className="p-4 font-bold text-clinic-navy">{user.fullName}</td><td className="p-4 font-mono" dir="ltr">{user.username}</td><td className="p-4">الاستقبال</td></tr>)}</tbody>
          </table></div>
        </div>
      )}
    </section>
  );
}
