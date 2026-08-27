import { type ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import AuthenticatedNavbar from './AuthenticatedNavbar';
import Footer from '@/components/layout/Footer';
import { useAppSelector } from '@/states/hooks';

interface PublicLayoutProps {
  children?: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const isAuthPage = pathname.startsWith('/auth/');

  return (
    <div className="flex min-h-screen flex-col bg-(--paper) text-(--ink)">
      {!isAuthPage &&
        (isAuthenticated ? <AuthenticatedNavbar /> : <PublicNavbar />)}
      <div className="flex-1">{children || <Outlet />}</div>
      {!isAuthPage && <Footer />}
    </div>
  );
};

export default PublicLayout;
