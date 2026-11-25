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
      addToast({
        type: 'success',
        title: 'تم الإضافة',
        message: `تم تسجيل المريض ${newPatient.name} بنجاح`,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreatePatientInput }) =>
      patientsApi.update(id, input),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient', updated.id] });
      addToast({
        type: 'success',
        title: 'تم التحديث',
        message: 'تم تحديث بيانات المريض بنجاح',
      });
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-clinic-navy">
            قاعدة بيانات وسجلات المرضى
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            البحث في كافة السجلات الطبية وتعديل البيانات وتسجيل مرضى جدد
          </p>
        </div>

        <Button
          variant="teal"
          size="md"
          leftIcon={<span className="material-symbols-outlined text-lg">person_add</span>}
          onClick={() => {
            setEditingPatient(null);
            setShowCreateModal(true);
          }}
        >
          تسجيل مريض جديد
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="w-full sm:w-96">
          <Input
            placeholder="ابحث بالاسم أو رقم الهاتف أو كود المريض..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<span className="material-symbols-outlined text-lg">search</span>}
          />
        </div>
        <div className="hidden sm:block text-xs font-semibold text-slate-500">
          إجمالي المرضى: <span className="font-mono font-bold text-clinic-navy">{patients.length}</span>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton rows={5} height="h-14" />
          </div>
        ) : patients.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon="search_off"
              title="لم يتم العثور على أي مرضى"
              description="تأكد من كتابة الاسم أو رقم الهاتف بشكل صحيح، أو أضف مريضاً جديداً."
              actionLabel="تسجيل مريض جديد"
              onAction={() => setShowCreateModal(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200">
                  <th className="p-3.5 pe-4">كود المريض</th>
                  <th className="p-3.5">اسم المريض</th>
                  <th className="p-3.5">رقم الهاتف</th>
                  <th className="p-3.5">السن والنوع</th>
                  <th className="p-3.5">تنبيه الحساسية والأمراض</th>
                  <th className="p-3.5">آخر زيارة</th>
                  <th className="p-3.5 text-start ps-4">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {patients.map((p) => {
                  const hasAllergy = p.drugAllergies.length > 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 pe-4 font-mono font-bold text-clinic-navy">
                        {p.code}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {p.name}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">
                        {p.phone}
                      </td>
                      <td className="p-3.5">
                        {p.age || '—'} سنة ({p.gender === 'male' ? 'ذكر' : 'أنثى'})
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap items-center gap-1">
                          {hasAllergy ? (
                            <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-200 text-[10px] font-bold">
                              حساسية: {p.drugAllergies.join(', ')}
                            </span>
                          ) : null}
                          {p.chronicDiseases.length > 0 ? (
                            <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200 text-[10px]">
                              {p.chronicDiseases[0]}
                              {p.chronicDiseases.length > 1 && ` (+${p.chronicDiseases.length - 1})`}
                            </span>
                          ) : null}
                          {!hasAllergy && p.chronicDiseases.length === 0 && (
                            <span className="text-slate-400 text-[11px]">لا يوجد</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-500">
                        {p.lastVisitDate || '—'}
                      </td>
                      <td className="p-3.5 text-start ps-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedPatientId(p.id)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-clinic-teal hover:text-clinic-teal bg-white font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            عرض الملف
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPatient(p);
                              setShowCreateModal(true);
                            }}
                            className="w-7 h-7 rounded-lg border border-slate-200 hover:border-slate-400 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
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
        )}
      </div>

      {/* Create / Edit Patient Modal */}
      <PatientFormModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingPatient(null);
        }}
        patient={editingPatient}
        onSubmit={handleFormSubmit}
        existingPatients={patients}
      />

      {/* Patient Details Modal */}
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
