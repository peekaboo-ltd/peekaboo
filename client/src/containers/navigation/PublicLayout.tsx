import { type ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import Footer from '@/components/layout/Footer';

interface PublicLayoutProps {
  children?: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  // NAVIGATION
  const { pathname } = useLocation();

  return (
    <main className="min-h-screen bg-gray-50 relative flex flex-col">
      <PublicNavbar />
      <section className={`flex-1 ${pathname === '/' ? 'pt-0' : 'pt-22'}`}>
        {children || <Outlet />}
      </section>
      <Footer />
    </main>
  );
};

export default PublicLayout;