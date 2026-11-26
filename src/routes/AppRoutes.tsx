import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { SessionExpiryHandler } from './SessionExpiryHandler';
import { LoginPage } from '../pages/LoginPage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { WelcomePage } from '../pages/WelcomePage';
import { AdminDirectoryPage } from '../pages/AdminDirectoryPage';
import { AdminDashboard } from '../features/admin/AdminDashboard';
import { ReceptionDashboard } from '../features/reception/ReceptionDashboard';
import { DoctorDashboard } from '../features/doctor/DoctorDashboard';
import { DailyRecordPage } from '../pages/DailyRecordPage';
import { PatientsDatabasePage } from '../pages/PatientsDatabasePage';
import { useAuthStore } from '../features/auth/useAuthStore';
import { Role } from '../types';

const allRoles: Role[] = ['DOCTOR', 'RECEPTIONIST', 'ADMIN'];

function RoleBasedHome() {
  const user = useAuthStore((state) => state.user);
  if (user?.role === 'DOCTOR') return <DoctorDashboard />;
  if (user?.role === 'RECEPTIONIST') return <ReceptionDashboard />;
  if (user?.role === 'ADMIN') return <AdminDashboard />;
  return <WelcomePage />;
}

function HomeEntry() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || !user) return <WelcomePage />;
  return <AppLayout><RoleBasedHome /></AppLayout>;
}

export function AppRoutes() {
  return <>
    <SessionExpiryHandler />
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/" element={<HomeEntry />} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="daily-record" element={<ProtectedRoute allowedRoles={allRoles}><DailyRecordPage /></ProtectedRoute>} />
        <Route path="patients" element={<ProtectedRoute allowedRoles={allRoles}><PatientsDatabasePage /></ProtectedRoute>} />
        <Route path="patients/new" element={<ProtectedRoute allowedRoles={['RECEPTIONIST']}><PatientsDatabasePage initialCreate /></ProtectedRoute>} />
        <Route path="examination" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="admin/doctors" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDirectoryPage kind="doctors" /></ProtectedRoute>} />
        <Route path="admin/staff" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDirectoryPage kind="staff" /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>;
}
