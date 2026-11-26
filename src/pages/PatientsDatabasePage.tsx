import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsApi } from '../api';
import { Patient, CreatePatientInput } from '../types';
import { PatientFormModal } from '../features/patients/PatientFormModal';
import { PatientDetailsModal } from '../features/patients/PatientDetailsModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useToastStore } from '../components/ui/Toast';

export const PatientsDatabasePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const addToast = useToastStore((s) => s.addToast);

  const { data, isLoading } = useQuery({
    queryKey: ['patients', search],
    queryFn: () => patientsApi.list(search),
  });

  const patients = data?.items || [];

  const createMutation = useMutation({
    mutationFn: (input: CreatePatientInput) => patientsApi.create(input),
    onSuccess: (newPatient) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      addToast({ type: 'success', title: 'تم الإضافة', message: `تم تسجيل المريض ${newPatient.name} بنجاح` });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreatePatientInput }) => patientsApi.update(id, input),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient', updated.id] });
      addToast({ type: 'success', title: 'تم التحديث', message: 'تم تحديث بيانات المريض بنجاح' });
    },
  });

  const handleFormSubmit = async (formData: CreatePatientInput) => {
    if (editingPatient) {
      await updateMutation.mutateAsync({ id: editingPatient.id, input: formData });
      setEditingPatient(null);
    } else {
      await createMutation.mutateAsync(formData);
      setShowCreateModal(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
              <h1 className="text-2xl font-black text-clinic-navy sm:text-3xl">قاعدة بيانات المرضى</h1>
              <p className="mt-1 text-sm text-slate-500">
                البحث في السجلات الطبية وتعديل البيانات وتسجيل مرضى جدد
              </p>
          </div>
          <Button
            variant="teal"
            size="md"
            leftIcon={<span className="material-symbols-outlined text-lg">person_add</span>}
            onClick={() => { setEditingPatient(null); setShowCreateModal(true); }}
            className="w-full sm:w-auto"
          >
            تسجيل مريض جديد
          </Button>
        </div>

            {/* Search bar */}
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
              <div className="w-full sm:max-w-md">
                <Input
                  placeholder="ابحث بالاسم أو رقم الهاتف أو كود المريض..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  icon={<span className="material-symbols-outlined text-lg">search</span>}
                />
              </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="material-symbols-outlined text-base text-slate-400">groups</span>
                  <span>
                    إجمالي المرضى:{' '}
                    <span className="font-mono font-black text-clinic-navy text-sm">{patients.length}</span>
                  </span>
                </div>
              </div>

                {/* Patients table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                  {isLoading ? (
                    <div className="p-6">
                      <LoadingSkeleton rows={5} height="h-14" />
                    </div>
                  ) : patients.length === 0 ? (
                      <div className="p-10">
                        <EmptyState
                          icon="search_off"
                          title="لم يتم العثور على أي مرضى"
                          description="تأكد من كتابة الاسم أو رقم الهاتف بشكل صحيح، أو أضف مريضاً جديداً."
                          actionLabel="تسجيل مريض جديد"
                          onAction={() => setShowCreateModal(true)}
                        />
                      </div>
                      ) : (
          <>
                        {/* Mobile cards */}
                        <div className="grid gap-3 p-3 sm:hidden">
                          {patients.map((p) => {
                            const hasAllergy = p.drugAllergies.length > 0;
                            return (
                                <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-black text-slate-900">{p.name}</p>
                                      <p className="mt-0.5 font-mono text-[11px] text-clinic-teal">{p.code}</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedPatientId(p.id)}
                                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:border-clinic-teal hover:text-clinic-teal transition-colors"
                                    >
                                      عرض الملف
                                    </button>
                                  </div>

                                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                                        <div className="rounded-xl bg-slate-50 px-3 py-2">
                                          <span className="block text-slate-400">الهاتف</span>
                                          <span className="mt-0.5 inline-block font-mono font-semibold">{p.phone}</span>
                                        </div>
                                          <div className="rounded-xl bg-slate-50 px-3 py-2">
                                            <span className="block text-slate-400">السن والنوع</span>
                                            <span className="mt-0.5 inline-block">{p.age || '—'} سنة ({p.gender === 'male' ? 'ذكر' : 'أنثى'})</span>
                                          </div>
                                        </div>

                                              <div className="mt-3 flex flex-wrap gap-1.5">
                                                {hasAllergy && (
                                                  <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
                                                    <span className="material-symbols-outlined text-[11px]">warning</span>
                                                    حساسية: {p.drugAllergies.join(', ')}
                                                  </span>
                      )}
                                                {p.chronicDiseases.length > 0 && (
                                                  <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] text-blue-800">
                                                    {p.chronicDiseases[0]}{p.chronicDiseases.length > 1 && ` (+${p.chronicDiseases.length - 1})`}
                                                  </span>
                      )}
                                                {!hasAllergy && p.chronicDiseases.length === 0 && (
                        <span className="text-[11px] text-slate-400">لا يوجد تنبيهات</span>
                                                )}
                                              </div>

                                                <div className="mt-3">
                                                  <button
                                                    type="button"
                                                    onClick={() => { setEditingPatient(p); setShowCreateModal(true); }}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:border-slate-300 transition-colors"
                                                  >
                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                    تعديل البيانات
                                                  </button>
                                                </div>
                                              </div>
                                              );
              })}
                                            </div>

            {/* Desktop table */}
                                          <div className="hidden overflow-x-auto sm:block">
                                              <table className="w-full border-collapse text-right">
                                                <thead>
                                                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                      <th className="p-4">كود المريض</th>
                                                      <th className="p-4">اسم المريض</th>
                                                      <th className="p-4">رقم الهاتف</th>
                                                      <th className="p-4">السن والنوع</th>
                                                      <th className="p-4">تنبيهات صحية</th>
                                                      <th className="p-4">آخر زيارة</th>
                                                      <th className="p-4 text-center">الإجراءات</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                                  {patients.map((p) => {
                                                    const hasAllergy = p.drugAllergies.length > 0;
                                                    return (
                                                      <tr key={p.id} className="transition-colors hover:bg-slate-50/70">
                                                          <td className="p-4 font-mono font-bold text-clinic-teal">{p.code}</td>
                                                          <td className="p-4 font-bold text-sm text-slate-900">{p.name}</td>
                                                          <td className="p-4 font-mono text-slate-600">{p.phone}</td>
                                                          <td className="p-4 text-slate-600">
                                                            {p.age || '—'} سنة ({p.gender === 'male' ? 'ذكر' : 'أنثى'})
                                                          </td>
                                                                  <td className="p-4">
                                                                    <div className="flex flex-wrap gap-1">
                                                                      {hasAllergy && (
                                                                        <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
                                                                          <span className="material-symbols-outlined text-[11px]">warning</span>
                                                                          حساسية: {p.drugAllergies.join(', ')}
                                                                        </span>
                            )}
                                                                          {p.chronicDiseases.length > 0 && (
                                                                            <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] text-blue-800">
                                                                              {p.chronicDiseases[0]}{p.chronicDiseases.length > 1 && ` (+${p.chronicDiseases.length - 1})`}
                                                                            </span>
                            )}
                                                                          {!hasAllergy && p.chronicDiseases.length === 0 && (
                              <span className="text-slate-400">—</span>
                                                                          )}
                                                                        </div>
                        </td>
                                                                      <td className="p-4 font-mono text-slate-500">{p.lastVisitDate || '—'}</td>
                                                                      <td className="p-4">
                                                                        <div className="flex items-center justify-center gap-1.5">
                                                                          <button
                                                                            type="button"
                                                                            onClick={() => setSelectedPatientId(p.id)}
                                                                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:border-clinic-teal hover:text-clinic-teal transition-colors"
                                                                          >
                                                                            عرض الملف
                                                                          </button>
                                                                          <button
                                                                            type="button"
                                                                            onClick={() => { setEditingPatient(p); setShowCreateModal(true); }}
                                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-slate-400 hover:text-clinic-navy transition-colors"
                                                                            title="تعديل"
                                                                          >
                                                                            <span className="material-symbols-outlined text-sm">edit</span>
                                                                          </button>
                                                                        </div>
                                                                      </td>
                                                                    </tr>
                                                                    );
                  })}
                                                                  </tbody>
                                                                </table>
            </div>
                                                          </>
        )}
                                                        </div>

                                                        <PatientFormModal
                                                          isOpen={showCreateModal}
                                                          onClose={() => { setShowCreateModal(false); setEditingPatient(null); }}
                                                          patient={editingPatient}
                                                          onSubmit={handleFormSubmit}
                                                          existingPatients={patients}
                                                        />

                                                        <PatientDetailsModal
                                                          patientId={selectedPatientId}
                                                          onClose={() => setSelectedPatientId(null)}
                                                          onEdit={() => {
                                                            const target = patients.find((p) => p.id === selectedPatientId);
                                                            if (target) {
                                                              setSelectedPatientId(null);
                                                              setEditingPatient(target);
                                                              setShowCreateModal(true);
                                                            }
                                                          }}
                                                        />
                                                      </div>
                                                    );
                                                  };
