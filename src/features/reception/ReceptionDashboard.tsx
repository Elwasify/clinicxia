import React, { useState } from 'react';
import { useLiveQueue } from './useLiveQueue';
import { NewVisitModal } from './NewVisitModal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { QueueStatus, Visit } from '../../types';
import { DashboardOverview } from '../dashboard/DashboardOverview';
import { VisitJourney } from '../visits/VisitJourney';

export const ReceptionDashboard: React.FC = () => {
  const { visits, counters, isLoading, isError, refetch, updateStatus, createVisit } = useLiveQueue();
  const [showNewVisitModal, setShowNewVisitModal] = useState(false);
  const [cancelVisit, setCancelVisit] = useState<Visit | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVisits = visits.filter(
    (v) =>
      !searchQuery.trim() ||
      v.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.patientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.patientPhone.includes(searchQuery)
  );

  const handleStatusChange = async (visit: Visit, newStatus: QueueStatus) => {
    if (newStatus === 'cancelled') {
      setCancelVisit(visit);
      return;
    }
    await updateStatus({ id: visit.id, status: newStatus });
  };

  const confirmCancel = async () => {
    if (cancelVisit) {
      await updateStatus({ id: cancelVisit.id, status: 'cancelled' });
      setCancelVisit(null);
    }
  };

  const kpiCards = [
    {
      value: counters.totalToday,
      label: 'إجمالي الحالات',
      icon: 'groups',
      color: 'text-clinic-teal',
      bg: 'bg-teal-50',
      border: 'border-teal-100',
    },
    {
      value: counters.waiting,
      label: 'في الانتظار',
      icon: 'hourglass_top',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
    {
      value: counters.inConsultation,
      label: 'داخل الكشف',
      icon: 'stethoscope',
      color: 'text-clinic-navy',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
    },
    {
      value: counters.completed,
      label: 'مكتمل',
      icon: 'task_alt',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
  ];

  return (
    <div className="flex flex-col gap-6 text-right">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 className="text-2xl font-black text-clinic-navy sm:text-3xl">
              طابور اليوم
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              إدارة حركة المرضى والدخول لغرف الكشف لحظياً
            </p>
        </div>

        <Button
          variant="teal"
          size="md"
          leftIcon={<span className="material-symbols-outlined text-lg">add</span>}
          onClick={() => setShowNewVisitModal(true)}
          className="w-full rounded-2xl px-6 shadow-sm sm:w-auto"
        >
          مريض جديد
        </Button>
      </div>

      <DashboardOverview />

      {isError && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">تعذر تحميل الطابور من الخادم. <button type="button" onClick={() => void refetch()} className="font-bold underline">إعادة المحاولة</button></div>}

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {kpiCards.map((card) => (
            <div
              key={card.label}
              className={`flex items-center gap-4 rounded-2xl border ${card.border} ${card.bg} p-4 transition-all`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ${card.color}`}>
                <span className="material-symbols-outlined text-[22px]">{card.icon}</span>
              </div>
              <div>
                <p className={`font-mono text-2xl font-black leading-none ${card.color}`}>
                  {card.value}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-600">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

          {/* Search */}
          <div className="relative">
            <span className="absolute top-1/2 -translate-y-1/2 end-4 material-symbols-outlined text-slate-400 text-lg pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="بحث باسم أو رقم مريض أو كود..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 pe-11 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-xs focus:outline-none focus:border-clinic-teal/60 focus:ring-2 focus:ring-clinic-teal/10 transition-all"
            />
          </div>

            {/* Queue table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
              {isLoading ? (
                <div className="p-6">
                  <LoadingSkeleton rows={5} height="h-14" />
                </div>
              ) : filteredVisits.length === 0 ? (
                  <div className="p-10">
                    <EmptyState
                      icon="search_off"
                      title="لا توجد أدوار مسجلة حالياً"
                      description="أضف مريضاً جديداً إلى الطابور بالضغط على زر مريض جديد أعلاه."
                      actionLabel="تسجيل مريض جديد"
                      onAction={() => setShowNewVisitModal(true)}
                    />
                  </div>
                  ) : (
          <>
                    {/* Mobile cards */}
                    <div className="grid gap-3 p-3 sm:hidden">
                      {filteredVisits.map((visit, index) => (
                        <div
                          key={visit.id}
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
                        >
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-black text-slate-900">{visit.patientName}</p>
                              <p className="mt-0.5 text-[11px] text-slate-500">ترتيب اليوم #{index + 1}</p>
                              <div className="mt-3"><VisitJourney visit={visit} /></div>
                            </div>
                            <span className="rounded-xl border border-teal-100 bg-teal-50 px-3 py-1 font-mono text-sm font-black text-clinic-teal">
                              {visit.queueNumber}
                            </span>
                          </div>

                              <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <div className="rounded-xl bg-slate-50 px-3 py-2">
                                  <span className="block text-slate-400">كود المريض</span>
                                  <span className="mt-0.5 inline-block font-mono font-bold text-clinic-navy">{visit.patientCode}</span>
                                </div>
                                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                                    <span className="block text-slate-400">نوع الزيارة</span>
                                    <div className="mt-1">
                                      <Badge variant={visit.visitType}>
                                        {visit.visitType === 'new' ? 'كشف جديد' : visit.visitType === 'follow_up' ? 'إعادة كشف' : 'استشارة'}
                                      </Badge>
                                    </div>
                                  </div>
                                    <div className="col-span-2 rounded-xl bg-slate-50 px-3 py-2">
                                      <span className="block text-slate-400">الحالة</span>
                                      <div className="mt-1">
                                        <Badge variant={visit.status}>
                                          {visit.status === 'waiting' ? 'في الانتظار' : visit.status === 'in_consultation' ? 'داخل الكشف' : visit.status === 'completed' ? 'مكتمل' : 'لم يحضر'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {visit.status === 'waiting' && (
                                        <button
                                          type="button"
                                          onClick={() => handleStatusChange(visit, 'in_consultation')}
                                          className="flex-1 rounded-xl bg-clinic-teal px-4 py-2.5 text-xs font-bold text-white hover:bg-clinic-teal-light transition-colors"
                                        >
                                          إرسال لغرفة الكشف
                                        </button>
                                      )}
                                      {visit.status === 'in_consultation' && (
                                        <button
                                          type="button"
                                          onClick={() => handleStatusChange(visit, 'completed')}
                                          className="flex-1 rounded-xl bg-clinic-navy px-4 py-2.5 text-xs font-bold text-white hover:bg-clinic-navy-dark transition-colors"
                                        >
                                          إنهاء الحالة
                                        </button>
                                      )}
                                      {visit.status !== 'cancelled' && visit.status !== 'completed' && (
                                        <button
                                          type="button"
                                          onClick={() => handleStatusChange(visit, 'cancelled')}
                                          className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors"
                                        >
                                          لم يحضر
                                        </button>
                                      )}
                                    </div>
                                  </div>
              ))}
                                </div>

                                {/* Desktop table */}
                                <div className="hidden overflow-x-auto sm:block">
                                  <table className="w-full text-right border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                          <th className="w-12 p-4 text-center">#</th>
                                          <th className="p-4 text-center">الدور</th>
                                          <th className="p-4">كود المريض</th>
                                          <th className="p-4">الاسم</th>
                                          <th className="p-4 text-center">نوع الزيارة</th>
                                          <th className="p-4 text-center">الحالة</th>
                                          <th className="p-4 text-center">إجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                            {filteredVisits.map((visit, index) => (
                                              <tr
                                                key={visit.id}
                                                className="h-[60px] transition-colors hover:bg-slate-50/80"
                                              >
                                                <td className="p-4 text-center font-mono text-slate-400 font-semibold">{index + 1}</td>

                                                <td className="p-4 text-center">
                                                  <span className="inline-flex items-center rounded-lg border border-teal-100 bg-teal-50 px-2.5 py-0.5 font-mono text-sm font-black text-clinic-teal">
                                                    {visit.queueNumber}
                                                  </span>
                                                </td>

                                                <td className="p-4">
                                                  <span className="font-mono text-[11px] font-bold text-clinic-navy bg-slate-100 px-2 py-0.5 rounded ltr-text">
                                                    {visit.patientCode}
                                                  </span>
                                                </td>

                                                <td className="p-4">
                                                  <p className="font-bold text-sm text-slate-900">{visit.patientName}</p>
                                                  <div className="mt-2 max-w-sm"><VisitJourney visit={visit} compact /></div>
                                                </td>

                                                <td className="p-4 text-center">
                                                  <Badge variant={visit.visitType}>
                                                    {visit.visitType === 'new' ? 'كشف جديد' : visit.visitType === 'follow_up' ? 'إعادة كشف' : 'استشارة'}
                                                  </Badge>
                                                </td>

                                                <td className="p-4 text-center">
                                                  <Badge variant={visit.status}>
                                                    {visit.status === 'waiting' ? 'في الانتظار' : visit.status === 'in_consultation' ? 'داخل الكشف' : visit.status === 'completed' ? 'مكتمل' : 'لم يحضر'}
                                                  </Badge>
                                                </td>

                                            <td className="p-4 text-center">
                                              <div className="flex items-center justify-center gap-1.5">
                                                {visit.status === 'waiting' && (
                                                  <button
                                                    type="button"
                                                    onClick={() => handleStatusChange(visit, 'in_consultation')}
                                                    className="inline-flex items-center gap-1.5 rounded-xl bg-clinic-teal px-4 py-2 text-xs font-bold text-white hover:bg-clinic-teal-light transition-colors shadow-xs"
                                                  >
                                                    <span className="material-symbols-outlined text-sm">send</span>
                                                    إرسال
                                                  </button>
                                                )}
                                                {visit.status === 'in_consultation' && (
                                                  <button
                                                    type="button"
                                                    onClick={() => handleStatusChange(visit, 'completed')}
                                                    className="inline-flex items-center gap-1.5 rounded-xl bg-clinic-navy px-4 py-2 text-xs font-bold text-white hover:bg-clinic-navy-dark transition-colors shadow-xs"
                                                  >
                                                    <span className="material-symbols-outlined text-sm">check</span>
                                                    إنهاء
                                                  </button>
                                                )}
                                                {visit.status !== 'cancelled' && visit.status !== 'completed' && (
                                                  <button
                                                    type="button"
                                                    onClick={() => handleStatusChange(visit, 'cancelled')}
                                                    title="إلغاء / لم يحضر"
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                  >
                                                    <span className="material-symbols-outlined text-base">close</span>
                                                  </button>
                                                )}
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </div>
                              </>
        )}
                            </div>

                            <NewVisitModal
                              isOpen={showNewVisitModal}
                              onClose={() => setShowNewVisitModal(false)}
                              onSubmit={async (data) => { await createVisit(data); }}
                            />

                            <Modal
                              isOpen={!!cancelVisit}
                              onClose={() => setCancelVisit(null)}
                              title="تأكيد إلغاء الكشف"
                              description="هل أنت متأكد من تسجيل المريض كـ (لم يحضر)؟"
                              maxWidth="sm"
                              footer={
                                <>
                                    <Button type="button" variant="outline" size="sm" onClick={() => setCancelVisit(null)}>
                                      تراجع
                                    </Button>
                                      <Button type="button" variant="danger" size="sm" onClick={confirmCancel}>
                                        تأكيد الإلغاء
                                      </Button>
                                    </>
        }
      >
                                    <div className="text-xs text-slate-600 space-y-2">
                                      <p>المريض: <strong className="text-clinic-navy">{cancelVisit?.patientName}</strong></p>
                                      <p>الدور: {cancelVisit?.queueNumber}</p>
                                    </div>
                                  </Modal>
                                </div>
                              );
};
