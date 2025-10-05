import { Outlet } from 'react-router-dom';
import { useAppSelector } from '@/states/hooks';
import AuthenticatedSidebar from './AuthenticatedSidebar';
import AuthenticatedNavbar from './AuthenticatedNavbar';

export const AuthenticatedLayout = () => {
  const { isOpen: sidebarOpen } = useAppSelector((state) => state.sidebar);

  return (
    <section className="flex h-screen w-full overflow-hidden">
      <AuthenticatedNavbar />
      <AuthenticatedSidebar />
      <main
        className={`
          flex-1
          overflow-y-auto
          bg-gray-50
          transition-all
          duration-300
          ease-in-out
          w-full
          min-h-screen
          ${sidebarOpen ? 'ml-[280px] sm:ml-[300px]' : 'ml-16'}
          md:ml-[${sidebarOpen ? '18vw' : '6vw'}]
        `}
      >
        <section className="container h-[91vh] mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </section>
      </main>
    </section>
  );
};