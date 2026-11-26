import React, { useState } from 'react';
import { useLiveQueue } from './useLiveQueue';
import { NewVisitModal } from './NewVisitModal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { QueueStatus, Visit } from '../../types';

export const ReceptionDashboard: React.FC = () => {
  const { visits, counters, isLoading, updateStatus, createVisit } = useLiveQueue();
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

  return (
    <div className="flex flex-col gap-6 text-right">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-clinic-navy">طابور اليوم</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إدارة حركة المرضى والدخول لغرف الكشف لحظياً
          </p>
        </div>

        <Button
          variant="teal"
          size="md"
          leftIcon={<span className="material-symbols-outlined text-lg">add</span>}
          onClick={() => setShowNewVisitModal(true)}
          className="rounded-xl shadow-sm px-5"
        >
          مريض جديد +
        </Button>
      </div>

      {/* 4 KPI Metrics matching design guide */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-clinic-teal font-mono leading-none mb-1.5">
            {counters.totalToday}
          </span>
          <span className="text-xs font-semibold text-slate-500">إجمالي الحالات</span>
        </div>

        {/* Waiting */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-amber-600 font-mono leading-none mb-1.5">
            {counters.waiting}
          </span>
          <span className="text-xs font-semibold text-slate-500">في الانتظار</span>
        </div>

        {/* In Consultation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-clinic-navy font-mono leading-none mb-1.5">
            {counters.inConsultation}
          </span>
          <span className="text-xs font-semibold text-slate-500">داخل الكشف</span>
        </div>

        {/* Follow up / Completed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-emerald-600 font-mono leading-none mb-1.5">
            {counters.completed}
          </span>
          <span className="text-xs font-semibold text-slate-500">متابعة / مكتمل</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center">
        <div className="relative w-full flex items-center">
          <span className="absolute start-3 material-symbols-outlined text-slate-400 text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="بحث باسم أو رقم مريض..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-10 pe-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Queue Table matching the table style in the guide */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton rows={5} height="h-14" />
          </div>
        ) : filteredVisits.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon="search_off"
              title="لا توجد أدوار مسجلة حالياً"
              description="أضف مريضاً جديداً إلى الطابور بالضغط على زر مريض جديد أعلاه."
              actionLabel="تسجيل مريض جديد"
              onAction={() => setShowNewVisitModal(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 border-b border-slate-200">
                  <th className="p-3.5 pe-4 text-center w-12">#</th>
                  <th className="p-3.5 text-center">كود الدور</th>
                  <th className="p-3.5">كود المريض</th>
                  <th className="p-3.5">الاسم</th>
                  <th className="p-3.5 text-center">نوع الزيارة</th>
                  <th className="p-3.5 text-center">الحالة</th>
                  <th className="p-3.5 text-center ps-4">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredVisits.map((visit, index) => {
                  return (
                    <tr
                      key={visit.id}
                      className="hover:bg-slate-50/80 transition-colors h-14"
                    >
                      {/* Index */}
                      <td className="p-3.5 pe-4 text-center font-mono text-slate-400 font-semibold">
                        {index + 1}
                      </td>

                      {/* Queue Turn Code */}
                      <td className="p-3.5 text-center">
                        <span className="font-mono font-bold text-clinic-teal text-sm bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-100">
                          {visit.queueNumber}
                        </span>
                      </td>

                      {/* Patient Code */}
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-clinic-navy bg-slate-100 px-2 py-0.5 rounded text-[11px] ltr-text">
                          {visit.patientCode}
                        </span>
                      </td>

                      {/* Patient Name */}
                      <td className="p-3.5 font-bold text-slate-900 text-sm">
                        {visit.patientName}
                      </td>

                      {/* Visit Type */}
                      <td className="p-3.5 text-center">
                        <Badge variant={visit.visitType}>
                          {visit.visitType === 'new'
                            ? 'كشف جديد'
                            : visit.visitType === 'follow_up'
                            ? 'إعادة كشف'
                            : 'استشارة'}
                        </Badge>
                      </td>

                      {/* Status Badge */}
                      <td className="p-3.5 text-center">
                        <Badge variant={visit.status}>
                          {visit.status === 'waiting'
                            ? 'في الانتظار'
                            : visit.status === 'in_consultation'
                            ? 'داخل الكشف'
                            : visit.status === 'completed'
                            ? 'مكتمل'
                            : 'لم يحضر'}
                        </Badge>
                      </td>

                      {/* Action buttons (إرسال / دخول) */}
                      <td className="p-3.5 text-center ps-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {visit.status === 'waiting' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(visit, 'in_consultation')}
                              className="px-4 py-1.5 rounded-lg bg-clinic-teal hover:bg-clinic-teal-light text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <span className="material-symbols-outlined text-sm">
                                send
                              </span>
                              <span>إرسال</span>
                            </button>
                          )}

                          {visit.status === 'in_consultation' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(visit, 'completed')}
                              className="px-4 py-1.5 rounded-lg bg-clinic-navy hover:bg-clinic-navy-dark text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <span className="material-symbols-outlined text-sm">
                                check
                              </span>
                              <span>دخول</span>
                            </button>
                          )}

                          {visit.status !== 'cancelled' && visit.status !== 'completed' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(visit, 'cancelled')}
                              title="إلغاء / لم يحضر"
                              className="w-7 h-7 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-base">
                                close
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Visit Registration Modal */}
      <NewVisitModal
        isOpen={showNewVisitModal}
        onClose={() => setShowNewVisitModal(false)}
        onSubmit={async (data) => {
          await createVisit(data);
        }}
      />

      {/* Cancel Confirmation Dialog */}
      <Modal
        isOpen={!!cancelVisit}
        onClose={() => setCancelVisit(null)}
        title="تأكيد إلغاء الكشف"
        description="هل أنت متأكد من تسجيل المريض كـ (لم يحضر)؟"
        maxWidth="sm"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCancelVisit(null)}
            >
              تراجع
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={confirmCancel}
            >
              تأكيد الإلغاء
            </Button>
          </>
        }
      >
        <div className="text-xs text-slate-600 space-y-2">
          <p>
            المريض:{' '}
            <strong className="text-clinic-navy">{cancelVisit?.patientName}</strong>
          </p>
          <p>الدور: {cancelVisit?.queueNumber}</p>
        </div>
      </Modal>
    </div>
  );
};
