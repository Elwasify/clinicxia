import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full text-right flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-slate-700">
            {label}
            {props.required && <span className="text-red-500 mr-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute start-3 flex items-center justify-center text-slate-400 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus-visible:outline-3 focus-visible:outline-clinic-teal focus-visible:outline-offset-2 ${
              icon ? 'ps-10' : ''
            } ${
              error
                ? 'border-red-500 focus-visible:outline-red-500 bg-red-50/20'
                : 'border-slate-300 hover:border-slate-400'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs font-semibold text-red-600 mt-0.5">{error}</p>}
        {!error && hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
