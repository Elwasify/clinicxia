import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { patientsApi } from '../../api';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PatientAlertsBanner } from './PatientAlertsBanner';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

export interface PatientDetailsModalProps {
  patientId: string | null;
  onClose: () => void;
  onEdit?: () => void;
}

export const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
  patientId,
  onClose,
  onEdit,
}) => {
  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => (patientId ? patientsApi.getById(patientId) : null),
    enabled: !!patientId,
  });

  if (!patientId) return null;

  return (
    <Modal
      isOpen={!!patientId}
      onClose={onClose}
      title="الملف الطبي للمريض"
      description="تفاصيل السجل الديموغرافي وتاريخ الزيارات السابقة"
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          {onEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onEdit}
              leftIcon={<span className="material-symbols-outlined text-sm">edit</span>}
            >
              تعديل البيانات
            </Button>
          )}
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            إغلاق
          </Button>
        </div>
      }
    >
      {isLoading || !patient ? (
        <LoadingSkeleton rows={4} height="h-16" />
      ) : (
        <div className="flex flex-col gap-5 text-right">
          {/* Prominent Allergy / Chronic Warning Banner */}
          <PatientAlertsBanner
            allergies={patient.drugAllergies}
            chronicDiseases={patient.chronicDiseases}
          />

          {/* Demographics Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">كود المريض:</span>
              <span className="font-mono font-bold text-clinic-navy text-sm">
                {patient.code}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">رقم الهاتف:</span>
              <span className="font-mono font-bold text-slate-800">
                {patient.phone}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">السن / النوع:</span>
              <span className="font-bold text-slate-800">
                {patient.age || '—'} سنة ({patient.gender === 'male' ? 'ذكر' : 'أنثى'})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">عدد الزيارات:</span>
              <span className="font-mono font-bold text-clinic-teal text-sm">
                {patient.visitCount || patient.visits?.length || 0} زيارة
              </span>
            </div>
          </div>

          {/* Visit History Timeline */}
          <div>
            <h4 className="text-sm font-bold text-clinic-navy mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-clinic-teal text-lg">
                history
              </span>
              <span>سجل وتاريخ الزيارات السابقة</span>
            </h4>

            {!patient.visits || patient.visits.length === 0 ? (
              <p className="text-xs text-slate-500 bg-white p-4 rounded-xl border border-slate-200 text-center">
                لا توجد كشوفات سابقة مسجلة لهذا المريض.
              </p>
            ) : (
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white overflow-hidden">
                {patient.visits.map((v) => (
                  <div key={v.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-700">{v.date}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-semibold text-clinic-navy">{v.doctorName}</span>
                      </div>
                      <p className="text-slate-500 mt-1">
                        التشخيص: <span className="font-semibold text-slate-800">{v.diagnosis}</span>
                      </p>
                    </div>
                    <Badge variant={v.status as any}>{v.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
