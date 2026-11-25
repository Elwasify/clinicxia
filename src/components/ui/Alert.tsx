import React from 'react';

export interface AlertProps {
  type?: 'warning' | 'error' | 'info' | 'success';
  title?: string;
  children: React.ReactNode;
  icon?: string;
  action?: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'warning',
  title,
  children,
  icon,
  action,
  className = '',
}) => {
  const styles = {
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      iconColor: 'text-amber-600',
      defaultIcon: 'warning',
    },
    error: {
      bg: 'bg-red-50 border-red-200 text-red-900',
      iconColor: 'text-red-600',
      defaultIcon: 'error',
    },
    info: {
      bg: 'bg-sky-50 border-sky-200 text-sky-900',
      iconColor: 'text-sky-600',
      defaultIcon: 'info',
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      iconColor: 'text-emerald-600',
      defaultIcon: 'check_circle',
    },
  }[type];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-2xl border text-right ${styles.bg} ${className}`}
    >
      <span className={`material-symbols-outlined text-2xl shrink-0 ${styles.iconColor}`}>
        {icon || styles.defaultIcon}
      </span>
      <div className="flex-1 min-w-0">
        {title && <h5 className="text-sm font-bold leading-tight mb-1">{title}</h5>}
        <div className="text-xs leading-relaxed opacity-95">{children}</div>
      </div>
      {action && <div className="shrink-0 ms-2">{action}</div>}
    </div>
  );
};
