import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAppSelector } from '../../states/hooks';
import { AppSidebar } from '../../components/navigation/AppSidebar';
import { TopNavBar } from '../../components/navigation/TopNavBar';
import { SidebarProvider, SidebarInset } from '../../components/ui/sidebar';
import { Loader } from '../../components/inputs/Loader';

export const AuthenticatedLayout: React.FC = () => {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col w-full">
          <TopNavBar />
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};