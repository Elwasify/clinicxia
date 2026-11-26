import { ClinicxiaLogo, ClinicxiaLogoProps } from './ClinicxiaLogo';
import { useClinic } from '../../features/clinic/ClinicContext';

interface ClinicIdentityProps {
  size?: ClinicxiaLogoProps['size'];
  variant?: ClinicxiaLogoProps['variant'];
  showClinicName?: boolean;
  clinicNameClassName?: string;
  showSubtitle?: boolean;
  className?: string;
}

export function ClinicIdentity({
  size = 'md',
  variant = 'horizontal',
  showClinicName = true,
  clinicNameClassName = '',
  showSubtitle = false,
  className = '',
}: ClinicIdentityProps) {
  const { profile } = useClinic();

  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`}>
      <ClinicxiaLogo size={size} variant={variant} showSubtitle={showSubtitle} />
      {profile?.logoUrl && (
        <img
          src={profile.logoUrl}
          alt={profile.name ? `شعار ${profile.name}` : 'شعار العيادة'}
          className="h-9 max-w-20 shrink-0 rounded-lg border border-slate-200 bg-white object-contain p-1"
        />
      )}
      {showClinicName && profile?.name && (
        <span className={`min-w-0 truncate text-sm font-black text-clinic-navy ${clinicNameClassName}`}>{profile.name}</span>
      )}
    </div>
  );
}
