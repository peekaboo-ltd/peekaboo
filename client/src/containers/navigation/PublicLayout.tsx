import { type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../pages/home/components/Footer';

interface PublicLayoutProps {
  children?: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {

  return (
    <main className="min-h-screen bg-gray-50 relative flex flex-col">
      <Navbar />
      <section className="relative pt-16 flex-grow">
        {children || <Outlet />}
      </section>
      <Footer />
    </main>
  );
};

export default PublicLayout;