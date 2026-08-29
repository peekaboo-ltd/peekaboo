import { type ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import AuthenticatedNavbar from './AuthenticatedNavbar';
import Footer from '@/components/layout/Footer';
import { useAppSelector } from '@/states/hooks';

interface PublicLayoutProps {
  children?: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const isAuthPage = pathname.startsWith('/auth/');

  // The order-setup and tracking screens are locked to one viewport, so a site
  // footer underneath them would reintroduce the scroll they exist to avoid.
  // They are task screens — set a route, pay, check status — not pages someone
  // reads to the end and then navigates onward from.
  // Payment pending/success still scroll normally and keep theirs.
  const isViewportOrderPage = /^\/p\/orders\/[^/]+(\/tracking)?$/.test(pathname);

  return (
    <div className="flex min-h-screen flex-col bg-(--paper) text-(--ink)">
      {!isAuthPage &&
        (isAuthenticated ? <AuthenticatedNavbar /> : <PublicNavbar />)}
      <div className="flex-1">{children || <Outlet />}</div>
      {!isAuthPage && !isViewportOrderPage && <Footer />}
    </div>
  );
};

export default PublicLayout;
