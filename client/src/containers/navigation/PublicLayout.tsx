import { type ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

interface PublicLayoutProps {
  children?: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {

  // NAVIGATION
  const { pathname } = useLocation();

  return (
    <main className="h-screen bg-gray-50 relative">
      <section className={`relative h-[calc(100vh-9vh)] ${pathname === '/' ? 'pt-0' : 'pt-22'}`}>
        {children || <Outlet />}
      </section>
    </main>
  );
};

export default PublicLayout;