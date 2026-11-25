import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? `select-${label.replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full text-right flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-bold text-slate-700">
            {label}
            {props.required && <span className="text-red-500 mr-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus-visible:outline-3 focus-visible:outline-clinic-teal focus-visible:outline-offset-2 cursor-pointer ${
            error
              ? 'border-red-500 bg-red-50/20'
              : 'border-slate-300 hover:border-slate-400'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs font-semibold text-red-600 mt-0.5">{error}</p>}
        {!error && hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
