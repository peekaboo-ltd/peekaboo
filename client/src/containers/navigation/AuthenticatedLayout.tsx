import { Outlet } from 'react-router-dom';
import AuthenticatedSidebar from './AuthenticatedSidebar';
import AuthenticatedNavbar from './AuthenticatedNavbar';
import { useInactivityTimeout } from '@/hooks/common/session.hooks';
import { useAppSelector } from '@/states/hooks';

export const AuthenticatedLayout = () => {
  const { isOpen: sidebarOpen } = useAppSelector((state) => state.sidebar);

  useInactivityTimeout();

  return (
    <section className="h-screen w-full overflow-x-hidden bg-[var(--peekaboo-surface)]">
      <AuthenticatedNavbar />
      <AuthenticatedSidebar />
      <main
        className={`mt-20 min-h-[calc(100vh-64px)] overflow-x-hidden transition-all duration-300 ease-in-out ${
          sidebarOpen
            ? 'ml-[220px] lg:ml-[260px]'
            : 'ml-[60px] lg:ml-[80px]'
        }`}
      >
        <article className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <Outlet />
        </article>
      </main>
    </section>
  );
};
