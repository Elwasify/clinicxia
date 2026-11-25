import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../auth/useAuthStore';
import { visitsApi } from '../../api';
import { Visit } from '../../types';
import { Badge } from '../../components/ui/Badge';
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
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-clinic-navy">
            غرفة الكشف — {user?.fullName}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            متابعة الحالات الموجهة لعيادتك والكشف الطبي المباشر
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            الحالات المنتظرة بالخارج: <strong className="text-amber-700 font-mono">{waitingVisits.length}</strong>
          </span>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={4} height="h-20" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current In-Consultation Spotlight Card */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="bg-gradient-to-br from-clinic-navy to-clinic-teal text-white p-6 rounded-3xl shadow-lg flex flex-col justify-between min-h-[260px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-xs">
                    الحالة الحالية بغرفة الكشف
                  </span>
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                </div>

                {currentConsultation ? (
                  <div>
                    <span className="font-mono text-3xl font-black block mb-1">
                      دور {currentConsultation.queueNumber}
                    </span>
                    <h3 className="text-xl font-bold">{currentConsultation.patientName}</h3>
                    <p className="text-xs text-white/80 font-mono mt-0.5">
                      كود: {currentConsultation.patientCode} • السن: {currentConsultation.patientAge || '—'}
                    </p>

                    {currentConsultation.drugAllergies.length > 0 && (
                      <div className="mt-3 bg-red-600/90 text-white text-[11px] font-bold p-2 rounded-xl flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base">warning</span>
                        <span>تحذير حساسية: {currentConsultation.drugAllergies.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-6 text-center text-white/70 text-xs">
                    لا يوجد مريض داخل غرفة الكشف حالياً. يمكنك استدعاء مريض من قائمة الانتظار.
                  </div>
                )}
              </div>

              {currentConsultation && (
                <Button
                  variant="teal"
                  size="md"
                  onClick={() => handleStartExam(currentConsultation)}
                  className="w-full bg-white text-clinic-navy hover:bg-slate-100 font-bold mt-4"
                >
                  فتح واستكمال الكشف الطبي
                </Button>
              )}
            </div>
          </div>

          {/* Waiting & Completed Lists */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Waiting List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-xl">
                    hourglass_top
                  </span>
                  <h3 className="text-sm font-bold text-clinic-navy">
                    قائمة انتظار كشف اليوم ({waitingVisits.length})
                  </h3>
                </div>
              </div>

              {waitingVisits.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon="check_circle"
                    title="لا يوجد مرضى بالانتظار"
                    description="تم فحص جميع الحالات الموجهة أو لم يحضر مرضى جدد بعد."
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
                        <span className="w-9 h-9 rounded-xl bg-slate-100 text-clinic-navy font-bold font-mono flex items-center justify-center text-sm border border-slate-200">
                          {v.queueNumber}
                        </span>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{v.patientName}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {v.patientCode} • حضور: {v.arrivalTime}
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
                          استدعاء للكشف
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Visits List */}
            {completedVisits.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-emerald-600 text-lg">
                      task_alt
                    </span>
                    <span>الحالات التي تم الانتهاء منها اليوم ({completedVisits.length})</span>
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
