import React from 'react';

export interface PatientAlertsBannerProps {
  allergies?: string[];
  chronicDiseases?: string[];
  className?: string;
}

export const PatientAlertsBanner: React.FC<PatientAlertsBannerProps> = ({
  allergies = [],
  chronicDiseases = [],
  className = '',
}) => {
  const hasAllergies = allergies.length > 0;
  const hasChronic = chronicDiseases.length > 0;

  if (!hasAllergies && !hasChronic) return null;

  return (
    <div className={`flex flex-col gap-2 w-full text-right ${className}`}>
      {/* Allergy Alert - High priority warning */}
      {hasAllergies && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 shadow-xs animate-pulse">
          <span className="material-symbols-outlined text-red-600 text-xl shrink-0">
            warning
          </span>
          <div className="flex flex-wrap items-center gap-1.5 flex-1 text-xs">
            <span className="font-bold text-red-700">تحذير حساسية أدوية:</span>
            {allergies.map((allergy, idx) => (
              <span
                key={idx}
                className="font-bold bg-white text-red-700 px-2 py-0.5 rounded-lg border border-red-300 shadow-xs"
              >
                {allergy}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Chronic Diseases */}
      {hasChronic && (
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 shadow-xs">
          <span className="material-symbols-outlined text-blue-600 text-lg shrink-0">
            health_metrics
          </span>
          <div className="flex flex-wrap items-center gap-1.5 flex-1 text-xs">
            <span className="font-bold text-blue-800">الأمراض المزمنة:</span>
            {chronicDiseases.map((disease, idx) => (
              <span
                key={idx}
                className="bg-white text-blue-800 px-2 py-0.5 rounded-lg border border-blue-200 text-[11px] font-semibold"
              >
                {disease}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
