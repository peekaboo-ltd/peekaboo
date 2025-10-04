import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import type { RoleType } from '@/states/slices/auth.slice';
import { authService } from '@/services/auth.service';
import { setUser } from '@/states/slices/auth.slice';

interface ProtectedRouteProps {
  allowedRoles?: RoleType[];
  children: ReactNode;
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (isAuthenticated && !user) {
      authService
        .getCurrentUser()
        .then((u) => dispatch(setUser(u)))
        .catch(() => void 0);
    }
  }, [dispatch, isAuthenticated, user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = user?.roles ?? [];
    const allowed = userRoles.some((r) => allowedRoles.includes(r));
    if (!allowed) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
