import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-4xl">gpp_maybe</span>
      </div>
      <p className="mb-2 font-mono text-sm font-black tracking-widest text-red-600">403</p>
      <h2 className="text-xl font-bold text-clinic-navy mb-1.5">
        عفواً، لا تملك الصلاحية للوصول لهذه الصفحة
      </h2>
      <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
        هذا المسار مخصص لدور وظيفي مختلف. ارجع إلى لوحة حسابك أو سجّل الخروج للدخول بحساب مصرح.
      </p>
      <Link to="/">
        <Button variant="primary" size="md">
          العودة للصفحة الرئيسية
        </Button>
      </Link>
    </div>
  );
};
