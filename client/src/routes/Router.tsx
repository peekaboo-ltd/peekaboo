import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/home';
import { PublicOrderDetails } from '../pages/public/orders';
import PublicOrderTracking from '@/pages/public/orders/PublicOrderTracking';
import PublicLayout from '@/containers/navigation/PublicLayout';
import { NotFoundPage } from '../pages/common';
import { Login } from '@/pages/auth';
import { ProtectedRoute } from './ProtectedRoute';
import { Dashboard } from '@/pages/dashboard';
import { AuthenticatedLayout } from '../containers/navigation/AuthenticatedLayout';
import Register from '@/pages/auth/Register';

const Router = () => {
  return (
    <Routes>
      {/* Public layout routes */}
      <Route path="/" element={<PublicLayout />}>
        {/* Public routes */}
        <Route path="auth">
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<p>Forgot Password</p>} />
        </Route>
        <Route path="" element={<Home />} />
      </Route>
      <Route path="/p" element={<PublicLayout />}>
        <Route path="orders">
          <Route path=":id" element={<PublicOrderDetails />} />
          <Route path=":id/tracking" element={<PublicOrderTracking />} />
        </Route>
      </Route>

      {/* Protected routes */}
      <Route element={<AuthenticatedLayout />}>
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'RIDER', 'CUSTOMER']}>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Route>
      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default Router;
