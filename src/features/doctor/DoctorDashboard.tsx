import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../auth/useAuthStore';
import { visitsApi } from '../../api';
import { Visit } from '../../types';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ExaminationForm } from '../visits/ExaminationForm';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [activeVisit, setActiveVisit] = useState<Visit | null>(null);

  const {
    data: visits = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['visits', user?.doctorId],
    queryFn: () => visitsApi.getQueue(user?.doctorId),
    refetchInterval: 4000,
  });

  // Current patient in consultation
  const currentConsultation = visits.find((v) => v.status === 'in_consultation');
  // Waiting list for this doctor
  const waitingVisits = visits.filter((v) => v.status === 'waiting');
  // Completed visits
  const completedVisits = visits.filter((v) => v.status === 'completed');

  const handleStartExam = async (visit: Visit) => {
    if (visit.status !== 'in_consultation') {
      await visitsApi.updateStatus(visit.id, 'in_consultation');
      refetch();
    }
    setActiveVisit(visit);
  };

  if (activeVisit) {
    const patientPastVisits = visits.filter((v) => v.patientId === activeVisit.patientId);
    return (
      <ExaminationForm
        visit={activeVisit}
        patientHistory={patientPastVisits}
        onBack={() => {
          setActiveVisit(null);
          refetch();
        }}
        onVisitUpdated={() => {
          refetch().then((res) => {
            const updated = res.data?.find((v) => v.id === activeVisit.id);
            if (updated) setActiveVisit(updated);
          });
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 text-right">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-clinic-navy">
            غرفة الكشف الطبي — {user?.fullName}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            متابعة الحالات واستقبال المرضى وتسجيل الفحوصات الطبية المعتمدة
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-700 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs">
            الحالات في الانتظار بالخارج: <strong className="text-amber-600 font-mono text-sm">{waitingVisits.length}</strong>
          </span>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={4} height="h-20" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spotlight Card: Current Patient inside clinic room */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="bg-gradient-to-br from-clinic-navy to-clinic-teal text-white p-6 rounded-3xl shadow-md flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-xs">
                    الحالة الحالية بغرفة الكشف
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                </div>

                {currentConsultation ? (
                  <div>
                    <span className="font-mono text-3xl font-black block mb-1">
                      دور {currentConsultation.queueNumber}
                    </span>
                    <h3 className="text-xl font-bold">{currentConsultation.patientName}</h3>
                    <p className="text-xs text-white/80 font-mono mt-1">
                      كود: {currentConsultation.patientCode} • السن: {currentConsultation.patientAge || '32'} سنة
                    </p>

                    {currentConsultation.drugAllergies.length > 0 && (
                      <div className="mt-4 bg-red-600 text-white text-xs font-bold p-2.5 rounded-xl flex items-center gap-2 shadow-xs">
                        <span className="material-symbols-outlined text-lg">warning</span>
                        <span>تحذير حساسية: {currentConsultation.drugAllergies.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-white/80 text-xs">
                    لا يوجد مريض داخل غرفة الكشف حالياً. اختر مريضاً من قائمة الانتظار للبدء.
                  </div>
                )}
              </div>

              {currentConsultation ? (
                <button
                  type="button"
                  onClick={() => handleStartExam(currentConsultation)}
                  className="w-full py-3 px-4 rounded-xl bg-white text-clinic-navy hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer mt-4"
                >
                  <span className="material-symbols-outlined text-base">clinical_notes</span>
                  <span>فتح شاشة الكشف والروشتة</span>
                </button>
              ) : waitingVisits[0] ? (
                <button
                  type="button"
                  onClick={() => handleStartExam(waitingVisits[0])}
                  className="w-full py-3 px-4 rounded-xl bg-clinic-teal hover:bg-clinic-teal-light text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer mt-4"
                >
                  <span className="material-symbols-outlined text-base">login</span>
                  <span>إدخال الدور التالي ({waitingVisits[0].patientName})</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Waiting & Finished Lists */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Waiting List */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-xl">
                    hourglass_top
                  </span>
                  <h3 className="text-sm font-bold text-clinic-navy">
                    قائمة الانتظار الحالية ({waitingVisits.length})
                  </h3>
                </div>
              </div>

              {waitingVisits.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon="check_circle"
                    title="قائمة الانتظار فارغة"
                    description="تم الانتهاء من جميع الحالات أو لم يحضر مرضى جدد بعد."
                  />
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {waitingVisits.map((v) => (
                    <div
                      key={v.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-slate-100 text-clinic-teal font-bold font-mono flex items-center justify-center text-sm border border-slate-200">
                          {v.queueNumber}
                        </span>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{v.patientName}</p>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {v.patientCode} • الحضور: {v.arrivalTime}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {v.drugAllergies.length > 0 && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            حساسية دواء!
                          </span>
                        )}
                        <Button
                          variant="teal"
                          size="sm"
                          onClick={() => handleStartExam(v)}
                        >
                          بدء الكشف
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Visits List */}
            {completedVisits.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-emerald-600 text-lg">
                      task_alt
                    </span>
                    <span>الحالات المكتملة اليوم ({completedVisits.length})</span>
                  </h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {completedVisits.map((v) => (
                    <div
                      key={v.id}
                      className="p-3.5 flex items-center justify-between hover:bg-slate-50/60 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-emerald-700">
                          دور {v.queueNumber}
                        </span>
                        <div>
                          <span className="font-bold text-slate-800">{v.patientName}</span>
                          <span className="text-slate-400 font-normal ms-2">
                            التشخيص: {v.examination?.diagnosis || '—'}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveVisit(v)}
                      >
                        معاينة السجل
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
