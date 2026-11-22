function ClinicLogo({ className = '', variant = 'dark' }) {
  const source = variant === 'light' ? '/clinicxia-logo-light.svg' : '/clinicxia-logo.svg';

  return (
    <span className={`clinic-logo ${className}`}>
      <img src={source} alt="CLINICXIA" />
    </span>
  );
}

export default ClinicLogo;
