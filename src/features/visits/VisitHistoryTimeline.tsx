import React from 'react';
import { Visit } from '../../types';

export interface VisitHistoryTimelineProps {
  visits?: Visit[];
  onSelectVisit?: (visit: Visit) => void;
  currentVisitId?: string;
}

export const VisitHistoryTimeline: React.FC<VisitHistoryTimelineProps> = ({
  visits = [],
  onSelectVisit,
  currentVisitId,
}) => {
  if (visits.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-slate-400">
        لا توجد زيارات سابقة مسجلة لهذا المريض
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 text-right">
      {visits.map((v, index) => {
        const isCurrent = v.id === currentVisitId;
        return (
          <div
            key={v.id}
            onClick={() => onSelectVisit && onSelectVisit(v)}
            className={`p-3.5 rounded-xl border transition-all text-xs cursor-pointer ${
              isCurrent
                ? 'bg-teal-50 border-clinic-teal shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-clinic-navy">
                الزيارة {visits.length - index}
              </span>
              <span className="font-mono text-slate-500 text-[11px]">
                {v.examination?.updatedAt?.split('T')[0] || v.arrivalTime}
              </span>
            </div>

            <p className="text-slate-600 line-clamp-2">
              <strong className="text-slate-700">التشخيص: </strong>
              {v.examination?.diagnosis || 'كشف قيد الانتظار'}
            </p>

            {v.examination?.prescription && v.examination.prescription.length > 0 && (
              <p className="text-[11px] text-clinic-teal mt-1 font-semibold">
                تم وصف {v.examination.prescription.length} أدوية
              </p>
            )}

            {v.addenda && v.addenda.length > 0 && (
              <span className="inline-block mt-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                يوجد {v.addenda.length} استدراك طبي
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
