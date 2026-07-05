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
  // NAVIGATION
  const { pathname } = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const isAuthPage = pathname.startsWith('/auth/');

  return (
    <main className="min-h-screen bg-background relative flex flex-col">
      {!isAuthPage && (isAuthenticated ? <AuthenticatedNavbar /> : <PublicNavbar />)}
      <section className={`flex-1 ${pathname === '/' || isAuthPage ? 'pt-0' : 'pt-22'}`}>
        {children || <Outlet />}
      </section>
      {!isAuthPage && <Footer />}
    </main>
  );
};

export default PublicLayout;
