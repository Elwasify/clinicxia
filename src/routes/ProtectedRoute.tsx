import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/useAuthStore';
import { Role } from '../types';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
};
