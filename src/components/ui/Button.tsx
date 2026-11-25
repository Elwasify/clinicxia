import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'teal' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus-visible:outline-3 focus-visible:outline-clinic-teal focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[34px]',
      md: 'px-4 py-2 text-sm gap-2 min-h-[42px]',
      lg: 'px-6 py-3 text-base gap-2.5 min-h-[48px]',
    };

    const variantStyles = {
      primary: 'bg-clinic-navy text-white hover:bg-clinic-navy-dark shadow-sm hover:shadow',
      teal: 'bg-clinic-teal text-white hover:bg-clinic-teal-light shadow-sm hover:shadow',
      secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200',
      outline: 'bg-white text-clinic-navy border border-slate-300 hover:border-clinic-teal hover:text-clinic-teal shadow-xs',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
      ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-clinic-navy',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        )}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
