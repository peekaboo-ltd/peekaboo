import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContextSecure';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'staff' | 'customer' | 'rider';
  fallbackPath?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole,
  fallbackPath = '/auth/login' 
}: ProtectedRouteProps) => {
  const { user, loading, getUserRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <Navigate 
        to={`${fallbackPath}?from=${encodeURIComponent(location.pathname)}`} 
        replace 
      />
    );
  }

  // Get user role only after confirming user exists
  const userRole = getUserRole();

  // Check role-based access if required
  if (requiredRole && userRole !== requiredRole) {
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