import { Visit } from '../../types';

const steps = ['تسجيل', 'انتظار', 'بدء الكشف', 'التشخيص والعلاج', 'إنهاء الزيارة', 'حفظ التاريخ'];

function currentStep(visit: Visit) {
  if (visit.status === 'completed' && visit.examinationStatus === 'approved') return 5;
  if (visit.status === 'completed') return 4;
  if (visit.status === 'in_consultation' && visit.examinationStatus === 'draft') return 3;
  if (visit.status === 'in_consultation') return 2;
  return 1;
}

export function VisitJourney({ visit, compact = false }: { visit: Visit; compact?: boolean }) {
  if (visit.status === 'cancelled') return <p className="text-[10px] font-bold text-red-600">تم إلغاء الزيارة</p>;
  const active = currentStep(visit);
  return (
    <ol aria-label={`مسار الزيارة: ${steps[active]}`} className={`flex w-full items-start ${compact ? 'gap-1' : 'gap-2'}`}>
      {steps.map((step, index) => {
        const complete = index < active || (visit.status === 'completed' && visit.examinationStatus === 'approved');
        const current = index === active && !(visit.status === 'completed' && visit.examinationStatus === 'approved');
        return <li key={step} aria-current={current ? 'step' : undefined} className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center">
          <span className={`h-2 w-full rounded-full ${complete ? 'bg-clinic-teal' : current ? 'bg-amber-400' : 'bg-slate-200'}`} />
          {!compact && <span className={`text-[9px] leading-3 sm:text-[10px] ${current ? 'font-black text-clinic-navy' : complete ? 'font-semibold text-clinic-teal' : 'text-slate-400'}`}>{step}</span>}
        </li>;
      })}
    </ol>
  );
}
