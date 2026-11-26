import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function SessionExpiryHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToLogin = () => navigate('/login?reason=session-expired', { replace: true });
    window.addEventListener('clinicxia:session-expired', redirectToLogin);
    return () => window.removeEventListener('clinicxia:session-expired', redirectToLogin);
  }, [navigate]);

  return null;
}
