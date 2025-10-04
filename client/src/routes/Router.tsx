import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/home';
import { PublicOrderDetails } from '../pages/public/orders';
import PublicOrderTracking from '@/pages/public/orders/PublicOrderTracking';
import PublicLayout from '@/containers/navigation/PublicLayout';
import { NotFoundPage } from '../pages/common';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Unauthorized from '@/pages/common/Unauthorized';
import AuthenticatedLayout from '@/containers/navigation/AuthenticatedLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import AdminDashboard from '@/pages/admin/Dashboard';
import RiderDashboard from '@/pages/rider/Dashboard';
import CustomerDashboard from '@/pages/customer/Dashboard';

const Router = () => {
  return (
    <Routes>
      {/* Public auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={<PublicLayout />}>
        <Route path="" element={<Home />} />
      </Route>
      <Route path="/p" element={<PublicLayout />}>
        <Route path="orders">
          <Route path=":id" element={<PublicOrderDetails />} />
          <Route path=":id/tracking" element={<PublicOrderTracking />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />

      {/* Protected */}
      <Route element={<AuthenticatedLayout />}>
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rider"
          element={
            <ProtectedRoute allowedRoles={['RIDER']}>
              <RiderDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default Router;
