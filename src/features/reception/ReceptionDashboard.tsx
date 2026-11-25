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
    <div className="flex flex-col gap-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-clinic-navy">
            طابور العيادة الحي وإدارة الاستقبال
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            تسجيل وتنظيم أدوار المرضى لحظياً ومتابعة حركة الدخول إلى غرفة الكشف
          </p>
        </div>

        <Button
          variant="teal"
          size="md"
          leftIcon={<span className="material-symbols-outlined text-lg">person_add</span>}
          onClick={() => setShowNewVisitModal(true)}
        >
          تسجيل كشف جديد في الطابور
        </Button>
      </div>

      {/* Live Counters Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Today */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">إجمالي حالات اليوم</p>
            <p className="text-2xl font-black text-clinic-navy mt-1 font-mono">
              {counters.totalToday}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-clinic-navy flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">groups</span>
          </div>
        </div>

        {/* Waiting */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-800">قيد الانتظار بالعيادة</p>
            <p className="text-2xl font-black text-amber-700 mt-1 font-mono">
              {counters.waiting}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">hourglass_top</span>
          </div>
        </div>

        {/* In Consultation */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-teal-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-clinic-teal">داخل غرفة الكشف</p>
            <p className="text-2xl font-black text-clinic-teal mt-1 font-mono">
              {counters.inConsultation}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-clinic-teal flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl animate-pulse">
              stethoscope
            </span>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-800">تم الكشف اليوم</p>
            <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">
              {counters.completed}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">task_alt</span>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-clinic-teal text-xl">
              format_list_numbered_rtl
            </span>
            <h3 className="text-base font-bold text-clinic-navy">طابور الانتظار الحالي</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            يتم التحديث المباشر تلقائياً
          </span>
        </div>

        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton rows={4} height="h-14" />
          </div>
        ) : visits.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon="clinical_notes"
              title="الطابور فارغ حالياً"
              description="لم يتم تسجيل أي حالات كشف في طابور اليوم حتى الآن."
              actionLabel="تسجيل أول مريض"
              onAction={() => setShowNewVisitModal(true)}
            />
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
                  <th className="p-3.5">حالة الدور</th>
                  <th className="p-3.5 text-start ps-4">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {visits.map((visit) => {
                  return (
                    <tr
                      key={visit.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        visit.status === 'in_consultation'
                          ? 'bg-teal-50/30'
                          : visit.status === 'cancelled'
                          ? 'opacity-60 bg-slate-50/50'
                          : ''
                      }`}
                    >
                      {/* Queue Number */}
                      <td className="p-3.5 pe-4">
                        <span className="font-mono font-bold text-sm bg-slate-100 text-clinic-navy px-2.5 py-1 rounded-lg border border-slate-200">
                          {visit.queueNumber}
                        </span>
                      </td>

                      {/* Patient Info */}
                      <td className="p-3.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm">
                            {visit.patientName}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500 mt-0.5">
                            {visit.patientCode} • {visit.patientPhone}
                          </span>
                        </div>
                      </td>

                      {/* Arrival Time */}
                      <td className="p-3.5 font-mono text-slate-600">
                        {visit.arrivalTime}
                      </td>

                      {/* Visit Type */}
                      <td className="p-3.5">
                        <Badge variant={visit.visitType}>
                          {visit.visitType === 'new'
                            ? 'كشف جديد'
                            : visit.visitType === 'follow_up'
                            ? 'إعادة كشف'
                            : 'استشارة'}
                        </Badge>
                      </td>

                      {/* Doctor */}
                      <td className="p-3.5 font-semibold text-clinic-navy">
                        {visit.doctorName}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <Badge variant={visit.status}>
                          {visit.status === 'waiting'
                            ? 'قيد الانتظار'
                            : visit.status === 'in_consultation'
                            ? 'داخل غرفة الكشف'
                            : visit.status === 'completed'
                            ? 'اكتمل الكشف'
                            : 'ملغي'}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-start ps-4">
                        <div className="flex items-center gap-1.5">
                          {visit.status === 'waiting' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(visit, 'in_consultation')}
                              className="px-2.5 py-1 rounded-lg bg-clinic-teal text-white font-bold text-[11px] hover:bg-clinic-teal-light transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm">
                                login
                              </span>
                              <span>إدخال للكشف</span>
                            </button>
                          )}

                          {visit.status === 'in_consultation' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(visit, 'completed')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm">
                                check
                              </span>
                              <span>إنهاء الكشف</span>
                            </button>
                          )}

                          {visit.status !== 'cancelled' && visit.status !== 'completed' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(visit, 'cancelled')}
                              title="إلغاء الكشف"
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
        description="هل أنت متأكد من رغبتك في إلغاء دور هذا المريض؟"
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
              نعم، تأكيد الإلغاء
            </Button>
          </>
        }
      >
        <div className="text-xs text-slate-600 space-y-2">
          <p>
            المريض:{' '}
            <strong className="text-clinic-navy">{cancelVisit?.patientName}</strong>
          </p>
          <p>الدور الحالي: {cancelVisit?.queueNumber}</p>
          <p className="text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-[11px]">
            تنبيه: سيتم نقل الدور إلى قائمة الملغيات في سجل اليوم ولن يظهر في قائمة الانتظار الحالية.
          </p>
        </div>
      </Modal>
    </div>
  );
};
