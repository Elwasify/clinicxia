import React, { useState, useEffect } from 'react';
import { Patient, CreatePatientInput } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

export interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
  onSubmit: (data: CreatePatientInput) => Promise<void>;
  existingPatients?: Patient[];
}

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSubmit,
  existingPatients = [],
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [dateOfBirth, setDateOfBirth] = useState('1990-01-01');
  const [allergiesText, setAllergiesText] = useState('');
  const [chronicText, setChronicText] = useState('');
  const [error, setError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patient) {
      setName(patient.name);
      setPhone(patient.phone);
      setGender(patient.gender);
      setDateOfBirth(patient.dateOfBirth);
      setAllergiesText(patient.drugAllergies.join('، '));
      setChronicText(patient.chronicDiseases.join('، '));
    } else {
      setName('');
      setPhone('');
      setGender('male');
      setDateOfBirth('1990-01-01');
      setAllergiesText('');
      setChronicText('');
    }
    setError('');
    setDuplicateWarning('');
  }, [patient, isOpen]);

  // Duplicate phone or similar name detection before submitting
  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (!patient && val.trim().length >= 8) {
      const match = existingPatients.find((p) => p.phone === val.trim());
      if (match) {
        setDuplicateWarning(`تنبيه: رقم الهاتف مسجل بالفعل للمريض (${match.name}) بكود ${match.code}`);
      } else {
        setDuplicateWarning('');
      }
    } else {
      setDuplicateWarning('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !phone.trim()) {
      setError('يرجى ملء اسم المريض ورقم الهاتف');
      return;
    }

    setLoading(true);
    try {
      const drugAllergies = allergiesText
        .split(/[،,]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const chronicDiseases = chronicText
        .split(/[،,]/)
        .map((s) => s.trim())
        .filter(Boolean);

      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        gender,
        dateOfBirth,
        drugAllergies,
        chronicDiseases,
      });

      onClose();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'حدث خطأ في حفظ بيانات المريض');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={patient ? 'تعديل بيانات المريض' : 'تسجيل مريض جديد'}
      description="أدخل البيانات الديموغرافية والطبية بدقة"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {duplicateWarning && (
          <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold">
            {duplicateWarning}
          </div>
        )}

        <Input
          label="الاسم بالكامل"
          placeholder="مثال: أحمد عبد الله المحمدي"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="رقم الهاتف"
            placeholder="01xxxxxxxxx"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            required
          />
          <Select
            label="النوع"
            value={gender}
            onChange={(e) => setGender(e.target.value as 'male' | 'female')}
            options={[
              { value: 'male', label: 'ذكر' },
              { value: 'female', label: 'أنثى' },
            ]}
          />
        </div>

        <Input
          type="date"
          label="تاريخ الميلاد"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          required
        />

        <Input
          label="حساسية الأدوية (مهمة للغاية)"
          placeholder="مثال: بنسلين، سلفا، أسبرين (مفصولة بفواصل)"
          value={allergiesText}
          onChange={(e) => setAllergiesText(e.target.value)}
          hint="تظهر كإشعار تحذيري أحمر للطبيب عند فتح الكشف"
        />

        <Input
          label="الأمراض المزمنة"
          placeholder="مثال: ضغط دم مرتفع، سكري نوع ثاني"
          value={chronicText}
          onChange={(e) => setChronicText(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" variant="teal" size="sm" isLoading={loading}>
            {patient ? 'حفظ التعديلات' : 'تسجيل المريض'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
