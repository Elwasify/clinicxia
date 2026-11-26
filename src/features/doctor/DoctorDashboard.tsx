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

  const currentConsultation = visits.find((v) => v.status === 'in_consultation');
  const waitingVisits = visits.filter((v) => v.status === 'waiting');
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
        onBack={() => { setActiveVisit(null); refetch(); }}
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
        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
              <h1 className="text-2xl font-black text-clinic-navy sm:text-3xl">
                غرفة الكشف الطبي
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                متابعة الحالات واستقبال المرضى وتسجيل الفحوصات الطبية — {user?.fullName}
              </p>
          </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5">
                <span className="material-symbols-outlined text-amber-500 text-base">hourglass_top</span>
                <span className="text-xs font-bold text-amber-800">
                  في الانتظار:{' '}
                  <span className="font-mono text-base">{waitingVisits.length}</span>
                </span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <LoadingSkeleton rows={4} height="h-20" />
          ) : (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                          {/* Current patient spotlight */}
                          <div className="flex flex-col gap-4 lg:col-span-1">
                            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-clinic-navy via-[#0a3a6e] to-clinic-teal p-6 text-white shadow-lg min-h-[300px] flex flex-col justify-between">
                              {/* Background decoration */}
                              <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/5" />
                              <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/5" />

                              <div className="relative">
                                <div className="mb-5 flex items-center justify-between">
                                  <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                                    الحالة الحالية
                                  </span>
                                  <span className={`h-2.5 w-2.5 rounded-full ${currentConsultation ? 'bg-emerald-400 animate-ping' : 'bg-white/30'}`} />
                                </div>

                                {currentConsultation ? (
                                  <div>
                                      <span className="font-mono text-4xl font-black block mb-2 leading-none">
                                        دور {currentConsultation.queueNumber}
                                      </span>
                                        <h3 className="text-xl font-bold leading-tight">{currentConsultation.patientName}</h3>
                                        <p className="mt-2 text-xs font-mono text-white/70">
                                          كود: {currentConsultation.patientCode} &nbsp;•&nbsp; السن: {currentConsultation.patientAge || '—'} سنة
                                        </p>

                                        {currentConsultation.drugAllergies.length > 0 && (
                                            <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-500/90 p-3 text-xs font-bold shadow-sm">
                                              <span className="material-symbols-outlined text-base">warning</span>
                                              <span>تحذير حساسية: {currentConsultation.drugAllergies.join(', ')}</span>
                                            </div>
                    )}
                                          </div>
                                        ) : (
                                          <div className="py-10 text-center">
                                            <span className="material-symbols-outlined text-5xl text-white/30 block mb-3">person_off</span>
                                            <p className="text-sm text-white/60 leading-6">
                                              لا يوجد مريض داخل غرفة الكشف حالياً
                                            </p>
                                            {waitingVisits.length > 0 && (
                                              <p className="mt-1 text-xs text-white/40">
                                                يوجد {waitingVisits.length} في الانتظار
                                              </p>
                                            )}
                                          </div>
                )}
                                        </div>

                                        <div className="relative mt-4">
                                          {currentConsultation ? (
                                            <button
                                              type="button"
                                              onClick={() => handleStartExam(currentConsultation)}
                                              className="w-full rounded-2xl bg-white px-4 py-3 text-clinic-navy font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"
                                            >
                                              <span className="material-symbols-outlined text-base">clinical_notes</span>
                                              <span>فتح شاشة الكشف والروشتة</span>
                                            </button>
                                          ) : waitingVisits[0] ? (
                                            <button
                                              type="button"
                                              onClick={() => handleStartExam(waitingVisits[0])}
                                              className="w-full rounded-2xl bg-clinic-teal px-4 py-3 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-clinic-teal-light transition-colors cursor-pointer"
                                            >
                                              <span className="material-symbols-outlined text-base">login</span>
                                              <span>إدخال ({waitingVisits[0].patientName})</span>
                                            </button>
                                          ) : null}
                                        </div>
                                      </div>
                                  </div>

                                      {/* Waiting + Completed lists */}
                                      <div className="flex flex-col gap-6 lg:col-span-2">
                                        {/* Waiting list */}
                                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                                          <div className="flex items-center justify-between border-b border-slate-100 p-4">
                                            <div className="flex items-center gap-2">
                                              <span className="material-symbols-outlined text-amber-500 text-xl">hourglass_top</span>
                                              <h3 className="text-sm font-bold text-clinic-navy">
                                                قائمة الانتظار
                                              </h3>
                                              <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-black text-amber-700">
                                                {waitingVisits.length}
                                              </span>
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
                      className="flex flex-col gap-3 p-4 transition-colors hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-100 bg-teal-50 font-mono text-sm font-black text-clinic-teal">
                          {v.queueNumber}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{v.patientName}</p>
                          <p className="mt-0.5 text-[11px] text-slate-500 font-mono">
                            {v.patientCode} &nbsp;•&nbsp; الحضور: {v.arrivalTime}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-stretch sm:self-auto">
                        {v.drugAllergies.length > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
                            <span className="material-symbols-outlined text-[11px]">warning</span>
                            حساسية!
                          </span>
                        )}
                        <Button
                          variant="teal"
                          size="sm"
                          onClick={() => handleStartExam(v)}
                          className="flex-1 sm:flex-none"
                        >
                          بدء الكشف
                        </Button>
                      </div>
                    </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>

                                        {/* Completed list */}
                                        {completedVisits.length > 0 && (
                                              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                                                <div className="flex items-center gap-2 border-b border-slate-100 p-4">
                                                  <span className="material-symbols-outlined text-emerald-500 text-xl">task_alt</span>
                                                  <h3 className="text-sm font-bold text-clinic-navy">الحالات المكتملة اليوم</h3>
                                                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-black text-emerald-700">
                                                    {completedVisits.length}
                                                  </span>
                                                </div>
                                                <div className="divide-y divide-slate-100">
                                                  {completedVisits.map((v) => (
                                                    <div
                                                      key={v.id}
                                                      className="flex flex-col gap-3 p-4 text-xs hover:bg-slate-50/60 transition-colors sm:flex-row sm:items-center sm:justify-between"
                                                    >
                                                      <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 font-mono text-xs font-black text-emerald-700">
                                                          {v.queueNumber}
                                                        </div>
                                                        <div>
                                                          <p className="font-bold text-sm text-slate-800">{v.patientName}</p>
                                                          <p className="mt-0.5 text-slate-500">
                                                            التشخيص: {v.examination?.diagnosis || <span className="text-slate-300">—</span>}
                                                          </p>
                                                        </div>
                                                      </div>
                                                      <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setActiveVisit(v)}
                                                        className="w-full sm:w-auto shrink-0"
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
