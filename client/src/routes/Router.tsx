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
import { AdminDashboard } from '@/pages/admin';
import { OrdersPage } from '@/pages/orders';
import { OrderAssignmentsPage } from '@/pages/order-assignments';

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
            <AuthenticatedLayout>
              <AdminDashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/staff/dashboard" element={
          <ProtectedRoute requiredRole="staff">
            <AuthenticatedLayout>
              <Dashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/rider/dashboard" element={
          <ProtectedRoute requiredRole="rider">
            <AuthenticatedLayout>
              <Dashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/orders" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <OrdersPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/assignments" element={
          <ProtectedRoute requiredRole="staff">
            <AuthenticatedLayout>
              <OrderAssignmentsPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />
        
        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
};

export default Router;
