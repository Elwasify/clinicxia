import React from 'react';

export interface ClinicxiaLogoProps {
  variant?: 'horizontal' | 'stacked' | 'icon-only' | 'white';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const ClinicxiaLogo: React.FC<ClinicxiaLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  showSubtitle = true,
}) => {
  const isWhite = variant === 'white';

  const iconSizes = {
    sm: 'w-7 h-7 text-lg',
    md: 'w-9 h-9 text-xl',
    lg: 'w-14 h-14 text-3xl',
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
  };

  // SVG representation of the C-cross medical emblem
  const LogoIcon = (
    <div
      className={`${iconSizes[size]} rounded-xl bg-gradient-to-br from-[#0F7C82] via-[#14B8A6] to-[#0B2545] text-white flex items-center justify-center shrink-0 shadow-md relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-white/10 backdrop-blur-xs" />
      <span className="material-symbols-outlined font-black relative z-10 text-white">
        add_circle
      </span>
    </div>
  );

  if (variant === 'icon-only') {
    return LogoIcon;
  }

  if (variant === 'stacked') {
    return (
      <div className="flex flex-col items-center text-center gap-2">
        {LogoIcon}
        <div>
          <span
            className={`font-black tracking-wider block font-cairo ${titleSizes[size]} ${
              isWhite ? 'text-white' : 'text-clinic-navy'
            }`}
          >
            CLINICXIA
          </span>
          <span
            className={`text-xs font-bold block ${
              isWhite ? 'text-teal-200' : 'text-clinic-teal'
            }`}
          >
            كلينيكسيا
          </span>
          {showSubtitle && (
            <span
              className={`text-[10px] block mt-0.5 ${
                isWhite ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              نظام إدارة العيادات الذكي
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      {LogoIcon}
      <div className="flex flex-col text-right">
        <div className="flex items-baseline gap-1.5 leading-none">
          <span
            className={`font-black tracking-wide font-cairo ${titleSizes[size]} ${
              isWhite ? 'text-white' : 'text-clinic-navy'
            }`}
          >
            CLINICXIA
          </span>
          <span
            className={`text-xs font-bold ${
              isWhite ? 'text-teal-300' : 'text-clinic-teal'
            }`}
          >
            كلينيكسيا
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`text-[10px] font-medium mt-1 leading-tight ${
              isWhite ? 'text-slate-300' : 'text-slate-400'
            }`}
          >
            نظام إدارة العيادات الذكي
          </span>
        )}
      </div>
    </div>
  );
};
