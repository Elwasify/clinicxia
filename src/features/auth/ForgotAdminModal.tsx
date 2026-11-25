import React from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

export const ForgotAdminModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="استعادة كلمة المرور"
      description="نظام إدارة حسابات عيادة كلينيكسيا"
      maxWidth="sm"
    >
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-clinic-teal flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl">support_agent</span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          حسابات النظام مُدارة مركزياً لأسباب تتعلق بأمان وسرية بيانات المرضى.
        </p>
        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 text-right space-y-1.5">
          <p className="font-bold text-clinic-navy">يرجى التواصل مع مسؤول النظام:</p>
          <p>• د. عفيفي فهمي (إدارة العيادة)</p>
          <p>• الدعم الفني للعيادة: 01096402629</p>
        </div>
        <Button variant="teal" size="sm" className="w-full mt-2" onClick={onClose}>
          حسناً، فهمت
        </Button>
      </div>
    </Modal>
  );
};
