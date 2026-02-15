import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../states/hooks';
import { UserRole } from '@/types/user.type';
import { localStorageUtil } from '@/utils/localStorage.util';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({
  children,
  allowedRoles = []
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { token, user } = useAppSelector((state) => state.auth);

  // Redirect to login if not authenticated
  if (!token) {
    localStorageUtil.setItem('from', `${location.pathname}${location.search}`);
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !user?.userRoles?.some((role: UserRole) => allowedRoles.includes(role.role.name))) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};