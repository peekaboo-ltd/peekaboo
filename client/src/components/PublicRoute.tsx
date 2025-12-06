import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContextSecure';
import { LoadingSpinner } from './LoadingSpinner';

interface PublicRouteProps {
  children: ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, loading, getUserRole } = useAuth();
  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    const userRole = getUserRole();
    const redirectPath = (() => {
      switch (userRole) {
        case 'admin':
          return '/admin';
        case 'staff':
          return '/staff/dashboard';
        case 'rider':
          return '/rider/dashboard';
        case 'customer':
        default:
          return '/dashboard';
      }
    })();

    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};