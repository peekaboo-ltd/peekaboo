import { Outlet } from 'react-router-dom';
import { useAppSelector } from '@/states/hooks';
import { useDispatch } from 'react-redux';
import AuthenticatedSidebar from './AuthenticatedSidebar';
import AuthenticatedNavbar from './AuthenticatedNavbar';
import { useInactivityTimeout } from '@/hooks/common/session.hooks';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { setIsOpen } from '@/states/slices/sidebar.slice';
import { AppDispatch } from '@/states/store';
import { useCallback } from 'react';

export const AuthenticatedLayout = () => {
  const { isOpen: sidebarOpen } = useAppSelector((state) => state.sidebar);
  const dispatch: AppDispatch = useDispatch();

  useInactivityTimeout();

  const handleOpenChange = useCallback(
    (open: boolean) => {
      dispatch(setIsOpen(open));
    },
    [dispatch]
  );

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={handleOpenChange}>
      <section className="flex h-screen w-full overflow-hidden relative">
        <AuthenticatedNavbar />
        <AuthenticatedSidebar />
        <SidebarInset className="flex-1 overflow-y-auto mt-[9vh]">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-sidebar-border md:hidden">
            <SidebarTrigger className="-ml-1" />
          </div>
          <section className="w-full px-3 py-4 sm:px-6 sm:py-6 lg:px-8 mb-4">
            <article className="w-full max-w-6xl mx-auto">
              <Outlet />
            </article>
          </section>
        </SidebarInset>
      </section>
    </SidebarProvider>
  );
};
