import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api';
import { ActivityEvent, DashboardSummary } from '../../types';

interface DashboardOverviewProps {
  includeStaffMetrics?: boolean;
}

const Metric = ({ label, value, icon, tone }: { label: string; value: number; icon: string; tone: string }) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="mt-2 font-mono text-3xl font-black text-clinic-navy" dir="ltr">{value.toLocaleString('ar-EG')}</p>
      </div>
      <span className={`material-symbols-outlined flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>{icon}</span>
    </div>
  </article>
);

function SummaryError({ retry }: { retry: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
      تعذر تحميل مؤشرات العيادة من الخادم.
      <button className="ms-3 font-bold underline" onClick={retry} type="button">إعادة المحاولة</button>
    </div>
  );
}

function ActivityList({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) return <p className="py-8 text-center text-sm text-slate-500">لا توجد نشاطات مسجلة بعد.</p>;
  return (
    <ol className="divide-y divide-slate-100">
      {events.map((event) => (
        <li key={event.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
          <span className="material-symbols-outlined mt-0.5 text-clinic-teal">{event.type === 'patient_registered' ? 'person_add' : event.type === 'exam_approved' ? 'task_alt' : event.type === 'consultation_started' ? 'stethoscope' : 'event_note'}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-800">{event.description}{event.patientName ? ` · ${event.patientName}` : ''}</p>
            <p className="mt-1 text-xs text-slate-500">{event.actorName} · {new Date(event.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function ActivityChart({ data }: { data: DashboardSummary['visitsByDay'] }) {
  if (data.length === 0 || data.every((day) => day.count === 0)) {
    return <p className="py-8 text-center text-sm text-slate-500">لا توجد زيارات مسجلة خلال الأيام المعروضة.</p>;
  }
  const max = Math.max(...data.map((day) => day.count), 1);
  return (
    <div className="flex h-36 items-end justify-between gap-2" aria-label="عدد الزيارات خلال آخر سبعة أيام">
      {data.map((day) => (
        <div key={day.date} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2" title={`${day.label}: ${day.count}`}>
          <span className="font-mono text-[10px] font-bold text-slate-600" dir="ltr">{day.count}</span>
          <div className="flex w-full flex-1 items-end">
            <div className="mx-auto w-full max-w-8 rounded-t-lg bg-clinic-teal/80" style={{ height: `${Math.max(8, (day.count / max) * 100)}%` }} />
          </div>
          <span className="text-[10px] text-slate-500">{day.label}</span>
        </div>
      ))}
    </div>
  );
}

export function DashboardOverview({ includeStaffMetrics = false }: DashboardOverviewProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.getSummary,
    refetchInterval: 15_000,
  });

  if (isLoading) return <div className="grid animate-pulse grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: includeStaffMetrics ? 6 : 4 }, (_, i) => <div key={i} className="h-24 rounded-2xl bg-slate-200" />)}</div>;
  if (isError || !data) return <SummaryError retry={() => void refetch()} />;

  return (
    <section className="flex flex-col gap-5" aria-label="مؤشرات العيادة">
      <div className={`grid grid-cols-2 gap-3 ${includeStaffMetrics ? 'lg:grid-cols-3 xl:grid-cols-6' : 'lg:grid-cols-4'}`}>
        <Metric label="إجمالي المرضى" value={data.totalPatients} icon="groups" tone="bg-cyan-50 text-cyan-700" />
        <Metric label="زيارات اليوم" value={data.visitsToday} icon="today" tone="bg-blue-50 text-blue-700" />
        <Metric label="في الانتظار" value={data.waitingPatients} icon="hourglass_top" tone="bg-amber-50 text-amber-700" />
        <Metric label="كشوفات مكتملة" value={data.completedExaminations} icon="task_alt" tone="bg-emerald-50 text-emerald-700" />
        {includeStaffMetrics && <Metric label="الأطباء" value={data.doctorCount} icon="medical_services" tone="bg-violet-50 text-violet-700" />}
        {includeStaffMetrics && <Metric label="الموظفون" value={data.staffCount} icon="badge" tone="bg-rose-50 text-rose-700" />}
      </div>
      {data.visitsToday === 0 && data.totalPatients === 0 && <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-500">لا توجد بيانات مسجلة في النظام حتى الآن.</p>}
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="mb-5 text-base font-black text-clinic-navy">حركة الزيارات · آخر ٧ أيام</h2>
          <ActivityChart data={data.visitsByDay} />
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="mb-5 text-base font-black text-clinic-navy">آخر نشاطات النظام</h2>
          <ActivityList events={data.recentActivity} />
        </section>
      </div>
    </section>
  );
}
