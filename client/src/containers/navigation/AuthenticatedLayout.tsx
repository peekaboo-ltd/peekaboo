import { Outlet } from 'react-router-dom';
import AuthenticatedSidebar from './AuthenticatedSidebar';
import AuthenticatedNavbar from './AuthenticatedNavbar';
import { useInactivityTimeout } from '@/hooks/common/session.hooks';
import { useAppSelector } from '@/states/hooks';

export const AuthenticatedLayout = () => {
  const { isOpen: sidebarOpen } = useAppSelector((state) => state.sidebar);
  useInactivityTimeout();

  return (
    <div className="min-h-screen bg-(--paper) text-(--ink)">
      <AuthenticatedNavbar />
      <AuthenticatedSidebar />
      <main className={sidebarOpen ? 'ml-[240px]' : 'ml-[72px]'}>
        <div className="mx-auto min-h-[calc(100vh-64px)] w-full max-w-[1280px] px-5 py-8 sm:px-8 lg:px-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
