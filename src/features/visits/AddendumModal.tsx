import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useToastStore } from '../../components/ui/Toast';
import { visitsApi } from '../../api';

export interface AddendumModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitId: string;
  onAdded: () => void;
}

export const AddendumModal: React.FC<AddendumModalProps> = ({
  isOpen,
  onClose,
  visitId,
  onAdded,
}) => {
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    setIsLoading(true);
    try {
      await visitsApi.addAddendum(visitId, note.trim());
      addToast({
        type: 'success',
        title: 'تم تسجيل الاستدراك',
        message: 'تم إضافة الاستدراك الطبي إلى سجل الكشف بنجاح.',
      });
      setNote('');
      onAdded();
      onClose();
    } catch {
      addToast({
        type: 'error',
        title: 'خطأ',
        message: 'فشل حفظ الاستدراك الطبي',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="إضافة استدراك / تصحيح طبي موثق"
      description="الكشوفات المعتمدة غير قابلة للتعديل المباشر، وتوثق أي إضافات كاستدراك رسمي معتمد"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-right">
        <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs">
          <strong>ملاحظة قانونية وطبية:</strong> سيتم إدراج هذا الاستدراك بتوقيت إدخاله الحالي واسم الطبيب كجزء دائم من السجل الطبي للمريض.
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">
            نص الاستدراك أو الملاحظة الإضافية <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="أدخل التعديل أو الملاحظة الإضافية..."
            className="w-full rounded-xl border border-slate-300 p-3 text-xs leading-relaxed focus-visible:outline-3 focus-visible:outline-clinic-teal"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" variant="teal" size="sm" isLoading={isLoading}>
            توثيق الاستدراك
          </Button>
        </div>
      </form>
    </Modal>
  );
};
