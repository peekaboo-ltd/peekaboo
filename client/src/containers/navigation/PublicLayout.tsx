import { type ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';

interface PublicLayoutProps {
  children?: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {

  // NAVIGATION
  const { pathname } = useLocation();

  return (
    <main className="min-h-screen relative">
      <PublicNavbar />
      <section className={`relative p-6 ${pathname === '/' ? 'pt-0' : 'pt-22'}`}>
        {children || <Outlet />}
      </section>
    </main>
  );
};

export default PublicLayout;