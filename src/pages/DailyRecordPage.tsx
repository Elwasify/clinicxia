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

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-clinic-navy">
            سجل اليوم الشامل لكافة الزيارات
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            أرشيف ومتابعة تفصيلية لجميع الحالات الواردة للعيادة خلال اليوم
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<span className="material-symbols-outlined text-base">print</span>}
          >
            طباعة كشف اليوم
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'waiting', label: 'بالانتظار' },
            { id: 'in_consultation', label: 'في الكشف' },
            { id: 'completed', label: 'مكتمل' },
            { id: 'cancelled', label: 'ملغي' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                filter === tab.id
                  ? 'bg-clinic-navy text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="بحث بالاسم أو الكود..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<span className="material-symbols-outlined text-lg">search</span>}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton rows={4} />
          </div>
        ) : filteredVisits.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            لا توجد سجلات تطابق الفلتر المختار
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200">
                  <th className="p-3.5 pe-4">الدور</th>
                  <th className="p-3.5">اسم المريض</th>
                  <th className="p-3.5">وقت الحضور</th>
                  <th className="p-3.5">نوع الكشف</th>
                  <th className="p-3.5">الطبيب المعالج</th>
                  <th className="p-3.5">التشخيص المعتمد</th>
                  <th className="p-3.5">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredVisits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 pe-4 font-mono font-bold text-clinic-navy">
                      {v.queueNumber}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {v.patientName}
                      <span className="block font-normal text-[11px] text-slate-400 font-mono">
                        {v.patientCode}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono">{v.arrivalTime}</td>
                    <td className="p-3.5">
                      <Badge variant={v.visitType}>
                        {v.visitType === 'new'
                          ? 'جديد'
                          : v.visitType === 'follow_up'
                          ? 'إعادة'
                          : 'استشارة'}
                      </Badge>
                    </td>
                    <td className="p-3.5 font-semibold text-clinic-navy">{v.doctorName}</td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate">
                      {v.examination?.diagnosis || '—'}
                    </td>
                    <td className="p-3.5">
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
