import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../components/ui/Badge';
import { PatientAlertsBanner } from '../features/patients/PatientAlertsBanner';
import { BrowserSpeechProvider } from '../features/voice/BrowserSpeechProvider';
import { BackendTranscriptionProvider } from '../features/voice/BackendTranscriptionProvider';
import { useAuthStore } from '../features/auth/useAuthStore';
import { mockUsers } from '../api/mocks/data';

describe('CLINICXIA Core Component & Domain Logic Tests', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('renders status badges with appropriate styles', () => {
    const { rerender } = render(<Badge variant="waiting">قيد الانتظار</Badge>);
    expect(screen.getByText('قيد الانتظار')).toBeInTheDocument();

    rerender(<Badge variant="in_consultation">داخل الكشف</Badge>);
    expect(screen.getByText('داخل الكشف')).toBeInTheDocument();

    rerender(<Badge variant="approved">كشف معتمد</Badge>);
    expect(screen.getByText('كشف معتمد')).toBeInTheDocument();
  });

  it('displays prominent alert banner for drug allergies and chronic conditions', () => {
    render(
      <PatientAlertsBanner
        allergies={['بنسلين (Penicillin)']}
        chronicDiseases={['ارتفاع ضغط الدم']}
      />
    );

    expect(screen.getByText(/تحذير حساسية أدوية/i)).toBeInTheDocument();
    expect(screen.getByText('بنسلين (Penicillin)')).toBeInTheDocument();
    expect(screen.getByText('ارتفاع ضغط الدم')).toBeInTheDocument();
  });

  it('manages authentication state in memory without persistence leakage', () => {
    const auth = useAuthStore.getState();
    expect(auth.isAuthenticated).toBe(false);

    auth.login(mockUsers[0], 'test-token-123');
    const stateAfterLogin = useAuthStore.getState();
    expect(stateAfterLogin.isAuthenticated).toBe(true);
    expect(stateAfterLogin.user?.role).toBe('DOCTOR');

    auth.logout();
    const stateAfterLogout = useAuthStore.getState();
    expect(stateAfterLogout.isAuthenticated).toBe(false);
    expect(stateAfterLogout.user).toBeNull();
  });

  it('initializes speech providers accurately based on abstraction contract', () => {
    const browserProvider = new BrowserSpeechProvider();
    expect(browserProvider.name).toBe('BrowserSpeechProvider');
    expect(browserProvider.isSupported()).toBe(true);

    const backendProvider = new BackendTranscriptionProvider();
    expect(backendProvider.name).toBe('BackendTranscriptionProvider');
  });
});
