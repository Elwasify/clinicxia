import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authApi } from '../../api';
import { useToastStore } from '../../components/ui/Toast';

export const ChangePasswordModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!oldPassword || !newPassword) {
      setError('يرجى ملء جميع الحقول');
      return;
    }

    if (newPassword.length < 6) {
      setError('يجب ألا تقل كلمة المرور الجديدة عن 6 خانات');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمة المرور الجديدة وتأكيدها غير متطابقين');
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword({ oldPassword, newPassword });
      addToast({
        type: 'success',
        title: 'تم التغيير',
        message: 'تم تحديث كلمة المرور بنجاح.',
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'فشل تحديث كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تغيير كلمة المرور"
      description="أدخل كلمة المرور الحالية والجديدة لتأمين حسابك"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <Input
          type="password"
          label="كلمة المرور الحالية"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="أدخل كلمة المرور الحالية (123456)"
          required
        />

        <Input
          type="password"
          label="كلمة المرور الجديدة"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="6 خانات على الأقل"
          required
        />

        <Input
          type="password"
          label="تأكيد كلمة المرور الجديدة"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="أعد إدخال كلمة المرور الجديدة"
          required
        />

        <div className="flex items-center justify-end gap-2.5 mt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" variant="teal" size="sm" isLoading={loading}>
            حفظ التغيير
          </Button>
        </div>
      </form>
    </Modal>
  );
};
