import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { ReceptionDashboard } from '../features/reception/ReceptionDashboard';
import { DoctorDashboard } from '../features/doctor/DoctorDashboard';
import { DailyRecordPage } from '../pages/DailyRecordPage';
import { PatientsDatabasePage } from '../pages/PatientsDatabasePage';
import { useAuthStore } from '../features/auth/useAuthStore';

// Main dashboard router: redirects doctor to DoctorDashboard and receptionist to ReceptionDashboard
const RoleBasedHome: React.FC = () => {
  const { user } = useAuthStore();
  if (user?.role === 'DOCTOR') {
    return <DoctorDashboard />;
  }
  return <ReceptionDashboard />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected App Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RoleBasedHome />} />
        <Route path="daily-record" element={<DailyRecordPage />} />
        <Route path="patients" element={<PatientsDatabasePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
