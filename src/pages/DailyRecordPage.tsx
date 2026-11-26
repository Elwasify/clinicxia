import React, { useState } from 'react';
import { useLiveQueue } from '../features/reception/useLiveQueue';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

export const DailyRecordPage: React.FC = () => {
  const { visits, isLoading } = useLiveQueue();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredVisits = visits.filter((v) => {
    const matchesFilter = filter === 'all' || v.status === filter;
    const matchesSearch =
      !search ||
      v.patientName.toLowerCase().includes(search.toLowerCase()) ||
      v.patientCode.toLowerCase().includes(search.toLowerCase()) ||
      v.patientPhone.includes(search);
    return matchesFilter && matchesSearch;
  });

  const statusTabs = [
    { id: 'all', label: 'الكل', count: visits.length },
    { id: 'waiting', label: 'بالانتظار', count: visits.filter((v) => v.status === 'waiting').length },
    { id: 'in_consultation', label: 'في الكشف', count: visits.filter((v) => v.status === 'in_consultation').length },
    { id: 'completed', label: 'مكتمل', count: visits.filter((v) => v.status === 'completed').length },
    { id: 'cancelled', label: 'ملغي', count: visits.filter((v) => v.status === 'cancelled').length },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-clinic-navy sm:text-3xl">سجل اليوم</h1>
          <p className="mt-1 text-sm text-slate-500">
            أرشيف ومتابعة تفصيلية لجميع الحالات الواردة للعيادة خلال اليوم
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          leftIcon={<span className="material-symbols-outlined text-base">print</span>}
          className="w-full sm:w-auto"
        >
          طباعة كشف اليوم
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-clinic-navy text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                filter === tab.id ? 'bg-white/20 text-white' : 'bg-white text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72 shrink-0">
          <Input
            placeholder="بحث بالاسم أو الكود..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<span className="material-symbols-outlined text-lg">search</span>}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton rows={4} />
          </div>
        ) : filteredVisits.length === 0 ? (
          <div className="p-10 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-200 block mb-3">search_off</span>
            <p className="text-sm font-bold text-slate-500">لا توجد سجلات تطابق الفلتر المختار</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-right">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-4">الدور</th>
                  <th className="p-4">اسم المريض</th>
                  <th className="p-4">وقت الحضور</th>
                  <th className="p-4">نوع الكشف</th>
                  <th className="p-4">الطبيب المعالج</th>
                  <th className="p-4">التشخيص المعتمد</th>
                  <th className="p-4">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredVisits.map((v) => (
                  <tr key={v.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="p-4 font-mono font-bold">
                      <span className="rounded-lg border border-teal-100 bg-teal-50 px-2 py-0.5 text-clinic-teal">
                        {v.queueNumber}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{v.patientName}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-slate-400">{v.patientCode}</p>
                    </td>
                    <td className="p-4 font-mono text-slate-500">{v.arrivalTime}</td>
                    <td className="p-4">
                      <Badge variant={v.visitType}>
                        {v.visitType === 'new' ? 'جديد' : v.visitType === 'follow_up' ? 'إعادة' : 'استشارة'}
                      </Badge>
                    </td>
                    <td className="p-4 font-semibold text-clinic-navy">{v.doctorName}</td>
                    <td className="p-4 max-w-[180px] truncate text-slate-600">
                      {v.examination?.diagnosis || '—'}
                    </td>
                    <td className="p-4">
                      <Badge variant={v.status}>
                        {v.status === 'waiting'
                          ? 'بالانتظار'
                          : v.status === 'in_consultation'
                          ? 'في الكشف'
                          : v.status === 'completed'
                          ? 'مكتمل'
                          : 'ملغي'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
