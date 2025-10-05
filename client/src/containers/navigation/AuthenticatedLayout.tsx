import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAppSelector } from '@/states/hooks';  
import { SidebarProvider, SidebarInset } from '../../components/ui/sidebar';
import { Loader } from '@/components/inputs/Loader';

export const AuthenticatedLayout: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <section className="flex h-screen w-full">
        <SidebarInset className="flex flex-col w-full">
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <Outlet />
          </main>
        </SidebarInset>
      </section>
    </SidebarProvider>
  );
};