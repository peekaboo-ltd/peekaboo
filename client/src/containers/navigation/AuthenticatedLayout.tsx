import { Outlet } from 'react-router-dom';
import { useAppSelector } from '@/states/hooks';
import AuthenticatedSidebar from './AuthenticatedSidebar';
import AuthenticatedNavbar from './AuthenticatedNavbar';

export const AuthenticatedLayout = () => {
  const { isOpen: sidebarOpen } = useAppSelector((state) => state.sidebar);

  return (
    <section className="flex h-screen w-full overflow-hidden relative">
      <AuthenticatedNavbar />
      <AuthenticatedSidebar />
      <main
        className={`
          flex-1
          overflow-y-auto
          transition-all
          duration-300
          ease-in-out
          w-full
          min-h-screen
          mb-4!
          ${sidebarOpen ? 'md:ml-[280px] lg:ml-[300px]' : 'ml-16'}
        `}
      >
        <section className="min-h-[91vh] mt-[9vh] w-full mx-auto px-3 py-4 sm:px-6 sm:py-6 lg:px-8 mb-4!">
          <Outlet />
        </section>
      </main>
    </section>
  );
};