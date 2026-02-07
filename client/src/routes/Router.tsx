import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '../pages/home';
import { PublicOrderDetails, TrackOrder } from '../pages/public/orders';
import PublicOrderTracking from '@/pages/public/orders/PublicOrderTracking';
import PublicOrderPaymentSuccess from '@/pages/public/orders/PublicOrderPaymentSuccess';
import PublicLayout from '@/containers/navigation/PublicLayout';
import { NotFoundPage } from '../pages/common';
import { Login } from '@/pages/auth';
import AuthCallback from '@/pages/auth/AuthCallback';
import { ProtectedRoute } from './ProtectedRoute';
import { Dashboard } from '@/pages/dashboard';
import { AuthenticatedLayout } from '../containers/navigation/AuthenticatedLayout';
import { OrdersPage } from '@/pages/orders';
import { OrderAssignmentsPage } from '@/pages/order-assignments';
import { UsersPage } from '@/pages/users';
import { About } from '@/pages/about';
import {
  OrganizationOnboarding,
  AdminOnboarding,
  UserManagementOnboarding,
  CompleteOnboarding,
} from '@/pages/onboarding';

const Router = () => {
  return (
    <Routes>
      {/* Public layout routes */}
      <Route path="/" element={<PublicLayout />}>
        {/* Public routes */}
        <Route path="auth">
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Navigate to="/auth/login" replace />} />
          <Route path="callback" element={<AuthCallback />} />
          <Route path="forgot-password" element={<p>Forgot Password</p>} />
        </Route>
        <Route path="onboarding">
          <Route path="organization" element={<OrganizationOnboarding />} />
          <Route path="admin" element={<AdminOnboarding />} />
          <Route path="users" element={<UserManagementOnboarding />} />
          <Route path="complete" element={<CompleteOnboarding />} />
        </Route>
        <Route path="" element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="track" element={<TrackOrder />} />
      </Route>
      <Route path="/p" element={<PublicLayout />}>
        <Route path="orders">
          <Route path=":id" element={<PublicOrderDetails />} />
          <Route path=":id/payment-success" element={<PublicOrderPaymentSuccess />} />
          <Route path=":id/tracking" element={<PublicOrderTracking />} />
        </Route>
      </Route>

      {/* Protected routes */}
      <Route element={<AuthenticatedLayout />}>
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'BUSINESS', 'RIDER', 'CUSTOMER']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'BUSINESS', 'RIDER', 'CUSTOMER']}>
            <OrdersPage />
          </ProtectedRoute>
        } />
        <Route path="/assignments" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'RIDER']}>
            <OrderAssignmentsPage />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'BUSINESS']}>
            <UsersPage />
          </ProtectedRoute>
        } />
      </Route>
      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default Router;
