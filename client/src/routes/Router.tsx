import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '../pages/home';
import { PublicOrderDetails, TrackOrder } from '../pages/public/orders';
import PublicOrderTracking from '@/pages/public/orders/PublicOrderTracking';
import PublicOrderPaymentSuccess from '@/pages/public/orders/PublicOrderPaymentSuccess';
import PublicLayout from '@/containers/navigation/PublicLayout';
import { NotFoundPage, UnauthorizedPage } from '../pages/common';
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
import BatchDetailsPage from '@/pages/batches/BatchDetailsPage';
import BatchPreviewPage from '@/pages/batches/BatchPreviewPage';
import OrderAssignmentDetails from '@/pages/order-assignments/OrderAssignmentDetails';
import PaymentDetailsPage from '@/pages/payments/PaymentDetailsPage';

const allRoles = ['ADMIN', 'STAFF', 'BUSINESS', 'RIDER', 'CUSTOMER'] as const;
const batchRoles = ['ADMIN', 'STAFF', 'BUSINESS', 'CUSTOMER'] as const;
const userManagementRoles = ['ADMIN', 'STAFF', 'BUSINESS'] as const;

const Router = () => {
  return (
    <>
      <Routes>
        {/* ─── Public layout ───────────────────────────────────────────────── */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />

          <Route path="auth">
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Navigate to="/auth/login" replace />} />
            <Route path="callback" element={<AuthCallback />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>

          <Route path="onboarding">
            <Route path="organization" element={<OrganizationOnboarding />} />
            <Route path="admin" element={<AdminOnboarding />} />
            <Route path="users" element={<UserManagementOnboarding />} />
            <Route path="complete" element={<CompleteOnboarding />} />
          </Route>

          <Route path="about">
            <Route index element={<About />} />
            <Route path="orders/fees" element={<OrderFees />} />
          </Route>

          <Route path="contact" element={<ContactUsPage />} />
          <Route path="track" element={<TrackOrder />} />
        </Route>

        {/* ─── Public order pages (e.g. /p/orders/123) ───────────────────────── */}
        <Route path="/p" element={<PublicLayout />}>
          <Route path="orders">
            <Route path=":id" element={<PublicOrderDetails />} />
            <Route path=":id/payment-success" element={<PublicOrderPaymentSuccess />} />
            <Route path=":id/tracking" element={<PublicOrderTracking />} />
          </Route>
        </Route>

        {/* ─── Authenticated (protected) routes ─────────────────────────────── */}
        <Route element={<AuthenticatedLayout />}>
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={[...allRoles]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route path="orders">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={[...allRoles]}>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id"
              element={
                <ProtectedRoute allowedRoles={[...allRoles]}>
                  <PublicOrderTracking />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="batches">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={[...batchRoles]}>
                  <BatchesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id"
              element={
                <ProtectedRoute allowedRoles={[...batchRoles]}>
                  <BatchDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id/preview"
              element={
                <ProtectedRoute allowedRoles={[...batchRoles]}>
                  <BatchPreviewPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="assignments">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'RIDER']}>
                  <OrderAssignmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'RIDER']}>
                  <OrderAssignmentDetails />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="users">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={[...userManagementRoles]}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id"
              element={
                <ProtectedRoute allowedRoles={[...userManagementRoles]}>
                  <UserDetailsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route
            path="user-profile"
            element={
              <ProtectedRoute allowedRoles={[...allRoles]}>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="payments"
          >
            <Route index element={<ProtectedRoute allowedRoles={['ADMIN']}>
              <PaymentsPage />
            </ProtectedRoute>} />
            <Route path=":id" element={<PaymentDetailsPage />} />
          </Route>

          <Route path="organizations">
            <Route
              path="invite"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <InviteOrganization />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute allowedRoles={['BUSINESS']}>
                  <OrganizationSettingsPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Route>

        {/* ─── Standalone pages ─────────────────────────────────────────────── */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <SessionExpiredModal />
    </>
  );
};

export default Router;
