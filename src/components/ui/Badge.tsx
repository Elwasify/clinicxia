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
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const styles: Record<string, string> = {
    waiting: 'bg-amber-50 text-amber-800 border-amber-200/80',
    in_consultation: 'bg-teal-50 text-clinic-teal border-teal-200 animate-pulse font-bold',
    completed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    cancelled: 'bg-slate-100 text-slate-600 border-slate-200 line-through',
    allergy: 'bg-red-50 text-red-700 border-red-200 font-bold',
    chronic: 'bg-blue-50 text-blue-800 border-blue-200 font-semibold',
    new: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    follow_up: 'bg-purple-50 text-purple-700 border-purple-200',
    consultation: 'bg-sky-50 text-sky-700 border-sky-200',
    draft: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[variant] || styles.default
      } ${className}`}
    >
      {variant === 'in_consultation' && (
        <span className="w-1.5 h-1.5 rounded-full bg-clinic-teal animate-ping" />
      )}
      {children}
    </span>
  );
};
