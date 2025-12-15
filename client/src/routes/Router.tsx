import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContextSecure';
import { Home } from '../pages/home';
import { PublicOrderDetails } from '../pages/public/orders';
import PublicOrderTracking from '@/pages/public/orders/PublicOrderTracking';
import PublicLayout from '@/containers/navigation/PublicLayout';
import AuthenticatedLayout from '@/containers/navigation/AuthenticatedLayoutNew';
import { NotFoundPage } from '../pages/common';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { PublicRoute } from '../components/PublicRoute';
import { Dashboard } from '@/pages/dashboard';
import { AdminDashboard, AdminSettingsPage } from '@/pages/admin';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminRidersPage } from '@/pages/admin/AdminRidersPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { AdminOrderDetailPage } from '@/pages/admin/AdminOrderDetailPage';
import { OrdersPage, OrderDetailPage } from '@/pages/orders';
import { OrderAssignmentsPage } from '@/pages/order-assignments';
import { RiderDashboard } from '@/pages/rider/RiderDashboard';
import StaffDashboard from '@/pages/staff/StaffDashboard';
import StaffOrderDetailPage from '@/pages/staff/StaffOrderDetailPage';

const Router = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public layout routes */}
        <Route path="/" element={<PublicLayout />}>
          {/* Public routes */}
          <Route path="auth">
            <Route path="login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
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

        <Route path="/orders" element={<PublicLayout />}>
          <Route index element={<OrdersPage />} />
          <Route path=":id" element={<OrderDetailPage />} />
        </Route>

        {/* Protected routes with AuthenticatedLayout */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Dashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/users" element={
          <ProtectedRoute requiredRole="admin">
            <AdminUsersPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/riders" element={
          <ProtectedRoute requiredRole="admin">
            <AdminRidersPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/orders" element={
          <ProtectedRoute requiredRole="admin">
            <AdminOrdersPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/orders/:id" element={
          <ProtectedRoute requiredRole="admin">
            <AdminOrderDetailPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/settings" element={
          <ProtectedRoute requiredRole="admin">
            <AdminSettingsPage />
          </ProtectedRoute>
        } />

        <Route path="/staff/dashboard" element={
          <ProtectedRoute requiredRole="staff">
            <StaffDashboard />
          </ProtectedRoute>
        } />

        <Route path="/staff/orders/:id" element={
          <ProtectedRoute requiredRole="staff">
            <StaffOrderDetailPage />
          </ProtectedRoute>
        } />

        <Route path="/rider/dashboard" element={
          <ProtectedRoute requiredRole="rider">
            <AuthenticatedLayout>
              <RiderDashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />
        

        
        <Route path="/assignments" element={
          <ProtectedRoute requiredRole="staff">
            <OrderAssignmentsPage />
          </ProtectedRoute>
        } />
        
        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
};

export default Router;
