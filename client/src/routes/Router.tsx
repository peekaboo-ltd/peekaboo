import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '../pages/home';
import { PublicOrderDetails, TrackOrder } from '../pages/public/orders';
import PublicOrderTracking from '@/pages/public/orders/PublicOrderTracking';
import PublicOrderPaymentSuccess from '@/pages/public/orders/PublicOrderPaymentSuccess';
import PublicLayout from '@/containers/navigation/PublicLayout';
import { NotFoundPage } from '../pages/common';
import { Login } from '@/pages/auth';
import AuthCallback from '@/pages/auth/AuthCallback';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import { ProtectedRoute } from './ProtectedRoute';
import { Dashboard } from '@/pages/dashboard';
import { AuthenticatedLayout } from '../containers/navigation/AuthenticatedLayout';
import { OrdersPage } from '@/pages/orders';
import { OrderAssignmentsPage } from '@/pages/order-assignments';
import { UsersPage, UserProfilePage, UserDetailsPage } from '@/pages/users';
import { About, OrderFees } from '@/pages/about';
import { ContactUsPage } from '@/pages/contact';
import { InviteOrganization, OrganizationSettingsPage } from '@/pages/organizations';
import { PaymentsPage } from '@/pages/payments';
import {
  OrganizationOnboarding,
  AdminOnboarding,
  UserManagementOnboarding,
  CompleteOnboarding,
} from '@/pages/onboarding';
import SessionExpiredModal from '@/components/auth/SessionExpiredModal';
import BatchesPage from '@/pages/batches/BatchesPage';
import BatchPreviewPage from '@/pages/batches/BatchPreviewPage';

const batchRoles = ['ADMIN', 'STAFF', 'BUSINESS', 'CUSTOMER'] as const;

const Router = () => {
  return (
    <>
      <Routes>
        {/* Public layout routes */}
        <Route path="/" element={<PublicLayout />}>
          {/* Public routes */}
          <Route path="auth">
            <Route path="login" element={<Login />} />
            <Route
              path="register"
              element={<Navigate to="/auth/login" replace />}
            />
            <Route path="callback" element={<AuthCallback />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>
          <Route path="onboarding">
            <Route path="organization" element={<OrganizationOnboarding />} />
            <Route path="admin" element={<AdminOnboarding />} />
            <Route path="users" element={<UserManagementOnboarding />} />
            <Route path="complete" element={<CompleteOnboarding />} />
          </Route>
          <Route path="" element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="about/orders/fees" element={<OrderFees />} />
          <Route path="contact" element={<ContactUsPage />} />
          <Route path="track" element={<TrackOrder />} />
        </Route>
        <Route path="/p" element={<PublicLayout />}>
          <Route path="orders">
            <Route path=":id" element={<PublicOrderDetails />} />
            <Route
              path=":id/payment-success"
              element={<PublicOrderPaymentSuccess />}
            />
            <Route path=":id/tracking" element={<PublicOrderTracking />} />
          </Route>
        </Route>

        {/* Protected routes */}
        <Route element={<AuthenticatedLayout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                allowedRoles={[
                  'ADMIN',
                  'STAFF',
                  'BUSINESS',
                  'RIDER',
                  'CUSTOMER',
                ]}
              >
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute
                allowedRoles={[
                  'ADMIN',
                  'STAFF',
                  'BUSINESS',
                  'RIDER',
                  'CUSTOMER',
                ]}
              >
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/batches"
            element={
              <ProtectedRoute allowedRoles={[...batchRoles]}>
                <BatchesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/batches/:id/preview"
            element={
              <ProtectedRoute allowedRoles={[...batchRoles]}>
                <BatchPreviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignments"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'RIDER']}>
                <OrderAssignmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'BUSINESS']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'BUSINESS']}>
                <UserDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-profile"
            element={
              <ProtectedRoute
                allowedRoles={[
                  'ADMIN',
                  'STAFF',
                  'BUSINESS',
                  'RIDER',
                  'CUSTOMER',
                ]}
              >
                <UserProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <PaymentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizations/invite"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <InviteOrganization />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizations/settings"
            element={
              <ProtectedRoute allowedRoles={['BUSINESS']}>
                <OrganizationSettingsPage />
              </ProtectedRoute>
            }
          />
        </Route>
        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {/* Globally accessible components */}
      <SessionExpiredModal />
    </>
  );
};

export default Router;
