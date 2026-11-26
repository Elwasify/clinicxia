import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'waiting'
    | 'in_consultation'
    | 'completed'
    | 'cancelled'
    | 'allergy'
    | 'chronic'
    | 'new'
    | 'follow_up'
    | 'consultation'
    | 'draft'
    | 'approved'
    | 'default';
  className?: string;
  showIcon?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  showIcon = true,
}) => {
  // Styles matching the CLINICXIA Status Badges in the design guide
  const styles: Record<string, string> = {
    waiting: 'bg-amber-50 text-amber-700 border-amber-200 font-bold',
    in_consultation: 'bg-teal-50 text-clinic-teal border-teal-200 font-bold',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
    cancelled: 'bg-red-50 text-red-600 border-red-200 font-bold',
    follow_up: 'bg-slate-100 text-slate-700 border-slate-200 font-bold',
    allergy: 'bg-red-50 text-red-700 border-red-300 font-bold',
    chronic: 'bg-blue-50 text-blue-700 border-blue-200 font-bold',
    new: 'bg-teal-50 text-clinic-teal border-teal-200 font-bold',
    consultation: 'bg-sky-50 text-sky-700 border-sky-200 font-bold',
    draft: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const icons: Partial<Record<string, string>> = {
    waiting: 'schedule',
    in_consultation: 'person',
    completed: 'check_circle',
    cancelled: 'cancel',
    follow_up: 'description',
    allergy: 'warning',
    chronic: 'info',
    approved: 'verified',
  };

  const iconName = icons[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border ${
        styles[variant] || styles.default
      } ${className}`}
    >
      {showIcon && iconName && (
        <span className="material-symbols-outlined text-[15px] shrink-0 leading-none">
          {iconName}
        </span>
      )}
      {variant === 'in_consultation' && !showIcon && (
        <span className="w-1.5 h-1.5 rounded-full bg-clinic-teal animate-ping" />
      )}
      <span>{children}</span>
    </span>
  );
};
