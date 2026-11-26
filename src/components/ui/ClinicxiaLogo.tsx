import React from 'react';

export interface ClinicxiaLogoProps {
  variant?: 'horizontal' | 'stacked' | 'icon-only' | 'white' | 'full-image';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const ClinicxiaLogo: React.FC<ClinicxiaLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const isWhite = variant === 'white';

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  if (variant === 'full-image') {
    return (
      <img
        src="/brand/logo-full-horizontal.jpg"
        alt="CLINICXIA كلينيكسيا"
        className={`object-contain rounded-xl ${className}`}
      />
    );
  }

  const EmblemImage = (
    <img
      src="/brand/logo-emblem.png"
      alt="CLINICXIA Logo"
      className={`${iconSizes[size]} object-contain shrink-0 drop-shadow-xs transition-transform duration-200 hover:scale-105`}
      onError={(e) => {
        // Fallback to app-icon if png has any rendering issue
        (e.target as HTMLImageElement).src = '/brand/app-icon.jpg';
      }}
    />
  );

  if (variant === 'icon-only') {
    return EmblemImage;
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center gap-2.5 ${className}`}>
        {EmblemImage}
        <div>
          <div className="flex items-center justify-center gap-2">
            <span
              className={`font-black tracking-wider font-cairo ${titleSizes[size]} ${
                isWhite ? 'text-white' : 'text-clinic-navy'
              }`}
            >
              CLINIC<span className="text-clinic-teal">X</span>IA
            </span>
            <span
              className={`font-black font-cairo ${titleSizes[size]} ${
                isWhite ? 'text-teal-300' : 'text-clinic-teal'
              }`}
            >
              كلينيكسيا
            </span>
          </div>
          {showSubtitle && (
            <p
              className={`text-xs font-semibold mt-1 tracking-wide ${
                isWhite ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              نظام إدارة العيادات الذكي
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {EmblemImage}
      <div className="flex flex-col text-right">
        <div className="flex items-baseline gap-2 leading-none">
          <span
            className={`font-black tracking-wide font-cairo ${titleSizes[size]} ${
              isWhite ? 'text-white' : 'text-clinic-navy'
            }`}
          >
            CLINIC<span className={isWhite ? 'text-teal-400' : 'text-clinic-teal'}>X</span>IA
          </span>
          <span
            className={`font-black text-xs ${
              isWhite ? 'text-teal-300' : 'text-clinic-teal'
            }`}
          >
            كلينيكسيا
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`text-[11px] font-medium mt-1 leading-tight ${
              isWhite ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            نظام إدارة العيادات الذكي
          </span>
        )}
      </div>
    </div>
  );
};
