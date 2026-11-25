import React from 'react';
import { Visit } from '../../types';
import { Button } from '../../components/ui/Button';

export interface PrescriptionPrintViewProps {
  visit: Visit;
  onClose: () => void;
}

export const PrescriptionPrintView: React.FC<PrescriptionPrintViewProps> = ({
  visit,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const items = visit.examination?.prescription || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col text-right print-container">
        {/* Print Action Toolbar (Hidden in print) */}
        <div className="px-6 py-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-clinic-teal text-xl">
              print
            </span>
            <span className="font-bold text-clinic-navy text-xs">
              معاينة وطباعة الروشتة الطبية الرسمية (A4)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="teal" size="sm" onClick={handlePrint}>
              طباعة / حفظ كـ PDF
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              إغلاق
            </Button>
          </div>
        </div>

        {/* The Printable A4 Prescription Sheet */}
        <div className="p-8 sm:p-12 flex flex-col gap-6 text-slate-800 bg-white min-h-[700px] border border-slate-200 m-4 rounded-xl print:m-0 print:border-none">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-clinic-navy pb-5">
            <div className="text-right">
              <h2 className="text-xl font-black text-clinic-navy">
                {visit.doctorName}
              </h2>
              <p className="text-xs font-bold text-clinic-teal mt-0.5">
                دكتوراه الأمراض الباطنية — استشاري الكبد والجهاز الهضمي
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                أستاذ بكلية الطب جامعة الزقازيق
              </p>
            </div>
            <div className="text-left ltr-text">
              <span className="text-2xl font-black text-clinic-teal">CLINICXIA</span>
              <p className="text-[11px] text-slate-400">Medical Prescription</p>
            </div>
          </div>

          {/* Patient Meta Strip */}
          <div className="grid grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold">
            <div>
              <span className="text-slate-400 block text-[10px]">اسم المريض:</span>
              <span className="text-clinic-navy">{visit.patientName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">السن / النوع:</span>
              <span>
                {visit.patientAge || '—'} سنة ({visit.patientGender === 'male' ? 'ذكر' : 'أنثى'})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">التاريخ:</span>
              <span className="font-mono">
                {visit.examination?.approvedAt?.split('T')[0] || new Date().toISOString().split('T')[0]}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">كود الزيارة:</span>
              <span className="font-mono text-clinic-teal">{visit.patientCode}</span>
            </div>
          </div>

          {/* Rx Symbol */}
          <div className="pt-2">
            <span className="text-4xl font-serif font-black text-clinic-navy italic">
              ℞
            </span>
          </div>

          {/* Medication List */}
          <div className="flex-1 flex flex-col gap-4">
            {items.length === 0 ? (
              <p className="text-xs text-slate-400 italic">لا توجد أدوية مدرجة.</p>
            ) : (
              items.map((item, idx) => (
                <div key={item.id} className="pb-3 border-b border-slate-100 flex flex-col gap-0.5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-sm text-clinic-navy ltr-text">
                      {idx + 1}. {item.drugName}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      {item.dose}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    التكرار: <strong>{item.frequency}</strong> {item.duration && `| المدة: ${item.duration}`}
                  </p>
                  {item.instructions && (
                    <p className="text-[11px] text-slate-500 italic">
                      التعليمات: {item.instructions}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Diagnosis & Advice Note */}
          {visit.examination?.treatmentPlan && (
            <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 text-xs">
              <strong className="text-clinic-teal block mb-0.5">تعليمات وإرشادات الطبيب:</strong>
              <p className="text-slate-700">{visit.examination.treatmentPlan}</p>
            </div>
          )}

          {/* Footer & Doctor Signature */}
          <div className="mt-auto pt-6 border-t border-slate-200 flex items-end justify-between text-xs">
            <div>
              <p className="font-bold text-clinic-navy">
                موعد الإعادة والمتابعة: {visit.examination?.followUpDate || 'حسب الحاجة أو بعد أسبوعين'}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                عيادة الباطنة والكبد • للاستفسارات والطوارئ: 01096402629
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 border-b border-slate-400 mb-1" />
              <span className="text-[11px] text-slate-500">توقيع وختم الطبيب</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
