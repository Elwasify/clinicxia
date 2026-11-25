import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-white/60 ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <h4 className="text-base font-bold text-slate-800 mb-1">{title}</h4>
      {description && (
        <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="teal" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
