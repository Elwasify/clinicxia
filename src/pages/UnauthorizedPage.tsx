import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-4xl">gpp_maybe</span>
      </div>
      <h2 className="text-xl font-bold text-clinic-navy mb-1.5">
        عفواً، لا تملك الصلاحية للوصول لهذه الصفحة
      </h2>
      <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
        هذا الجزء مخصص فقط لأدوار وظيفية محددة في العيادة. يرجى العودة للرئيسية أو
        التبديل لحساب يملك الصلاحية.
      </p>
      <Link to="/">
        <Button variant="primary" size="md">
          العودة للصفحة الرئيسية
        </Button>
      </Link>
    </div>
  );
};
