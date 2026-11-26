import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { doctorsApi, patientsApi } from '../../api';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { useToastStore } from '../../components/ui/Toast';

export interface NewVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { patientId: string; doctorId: string; visitType: string }) => Promise<void>;
}

export const NewVisitModal: React.FC<NewVisitModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [visitType, setVisitType] = useState('new');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreatePatient, setShowCreatePatient] = useState(false);

  // New Patient Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newGender, setNewGender] = useState<'male' | 'female'>('male');
  const [newDob, setNewDob] = useState('1990-01-01');
  const [newAllergies, setNewAllergies] = useState('');
  const [newChronic, setNewChronic] = useState('');
  const [createPatientError, setCreatePatientError] = useState('');

  const addToast = useToastStore((s) => s.addToast);

  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: doctorsApi.list,
  });

  const { data: patientsData } = useQuery({
    queryKey: ['patients', patientSearch],
    queryFn: () => patientsApi.list(patientSearch),
  });

  const patients = patientsData?.items || [];

  const handleCreatePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatePatientError('');

    if (!newName.trim() || !newPhone.trim()) {
      setCreatePatientError('يرجى إدخال اسم المريض ورقم الهاتف');
      return;
    }

    try {
      const patient = await patientsApi.create({
        name: newName.trim(),
        phone: newPhone.trim(),
        gender: newGender,
        dateOfBirth: newDob,
        drugAllergies: newAllergies
          ? newAllergies.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        chronicDiseases: newChronic
          ? newChronic.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      });

      setSelectedPatientId(patient.id);
      setShowCreatePatient(false);
      addToast({
        type: 'success',
        title: 'تم تسجيل المريض',
        message: `تم إضافة ${patient.name} بكود ${patient.code}`,
      });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setCreatePatientError(e.message || 'فشل تسجيل المريض');
    }
  };

  const handleVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      addToast({
        type: 'error',
        title: 'تنبيه',
        message: 'يرجى اختيار المريض أولاً',
      });
      return;
    }

    const doctorId = selectedDoctorId || doctors[0]?.id;
    if (!doctorId) {
      addToast({
        type: 'error',
        title: 'تنبيه',
        message: 'لا يوجد أطباء متاحون حالياً',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        patientId: selectedPatientId,
        doctorId,
        visitType,
      });

      addToast({
        type: 'success',
        title: 'تم التسجيل',
        message: 'تم إضافة المريض إلى طابور الانتظار بنجاح.',
      });

      setSelectedPatientId('');
      setPatientSearch('');
      onClose();
    } catch (err: unknown) {
      const e = err as { message?: string };
      addToast({
        type: 'error',
        title: 'خطأ',
        message: e.message || 'فشل إضافة الكشف',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تسجيل كشف جديد في الطابور"
      description="اختر المريض وحدد الطبيب المعالج ونوع الزيارة"
      maxWidth="lg"
    >
      {!showCreatePatient ? (
        <form onSubmit={handleVisitSubmit} className="flex flex-col gap-5">
          {/* Patient Selection & Search */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="patient-search" className="text-xs font-bold text-slate-700">
                اختيار المريض <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowCreatePatient(true)}
                className="text-xs font-bold text-clinic-teal hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                <span>تسجيل مريض جديد</span>
              </button>
            </div>

            <Input
              id="patient-search"
              placeholder="ابحث بالاسم أو رقم الهاتف أو كود المريض..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              icon={<span className="material-symbols-outlined text-lg">search</span>}
            />

            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
              {patients.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  لا توجد نتائج مطابقة
                </div>
              ) : (
                patients.map((p) => {
                  const isSelected = selectedPatientId === p.id;
                  return (
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      key={p.id}
                      onClick={() => setSelectedPatientId(p.id)}
                      className={`w-full text-right p-3 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-teal-50 border-s-4 border-clinic-teal text-clinic-navy'
                          : 'hover:bg-slate-100/80 text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold">{p.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {p.phone} • {p.code}
                        </p>
                      </div>
                      {p.drugAllergies.length > 0 && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                          حساسية دواء!
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Doctor Selection */}
          <Select
            label="الطبيب المعالج"
            value={selectedDoctorId || doctors[0]?.id || ''}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            options={doctors.map((d) => ({
              value: d.id,
              label: `${d.name} (${d.specialty})`,
            }))}
            required
          />

          {/* Visit Type */}
          <Select
            label="نوع الكشف"
            value={visitType}
            onChange={(e) => setVisitType(e.target.value)}
            options={[
              { value: 'new', label: 'كشف جديد أول مرة' },
              { value: 'follow_up', label: 'إعادة / متابعة حالة' },
              { value: 'consultation', label: 'استشارة طبية' },
            ]}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="teal"
              size="sm"
              isLoading={isSubmitting}
              disabled={!selectedPatientId}
            >
              إدخال إلى الطابور الحي
            </Button>
          </div>
        </form>
      ) : (
        /* Create New Patient Sub-form */
        <form onSubmit={handleCreatePatientSubmit} className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-clinic-navy">بيانات المريض الجديد</span>
            <button
              type="button"
              onClick={() => setShowCreatePatient(false)}
              className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              الرجوع للبحث
            </button>
          </div>

          {createPatientError && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold">
              {createPatientError}
            </div>
          )}

          <Input
            label="الاسم الكامل"
            placeholder="مثال: أحمد عبد الرحمن مصطفى"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="رقم الهاتف"
              placeholder="01xxxxxxxxx"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              required
            />
            <Select
              label="النوع"
              value={newGender}
              onChange={(e) => setNewGender(e.target.value as 'male' | 'female')}
              options={[
                { value: 'male', label: 'ذكر' },
                { value: 'female', label: 'أنثى' },
              ]}
            />
          </div>

          <Input
            type="date"
            label="تاريخ الميلاد"
            value={newDob}
            onChange={(e) => setNewDob(e.target.value)}
            required
          />

          <Input
            label="حساسية الأدوية (إن وجدت، مفصولة بفواصل)"
            placeholder="مثال: بنسلين، سلفا"
            value={newAllergies}
            onChange={(e) => setNewAllergies(e.target.value)}
          />

          <Input
            label="الأمراض المزمنة (إن وجدت)"
            placeholder="مثال: ضغط، سكري، كبد"
            value={newChronic}
            onChange={(e) => setNewChronic(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCreatePatient(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" variant="teal" size="sm">
              حفظ المريض واختياره
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
