import { type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';

interface PublicLayoutProps {
  children?: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {

  return (
    <main className="min-h-screen bg-gray-50 relative">
      <Navbar />
      <section className="relative pt-16">
        {children || <Outlet />}
      </section>
    </main>
  );
};

export default PublicLayout;