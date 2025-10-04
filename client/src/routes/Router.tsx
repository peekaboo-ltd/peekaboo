import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/home';
import { PublicOrderDetails } from '../pages/public/orders';
import PublicOrderTracking from '@/pages/public/orders/PublicOrderTracking';
import PublicLayout from '@/containers/navigation/PublicLayout';
import { NotFoundPage, UnauthorizedPage } from '../pages/common';
import { Login, Register } from '../pages/auth';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminDashboard } from '../pages/admin';
import { RiderDashboard } from '../pages/rider';
import { CustomerDashboard } from '../pages/customer';
import { AuthenticatedLayout } from '../containers/navigation/AuthenticatedLayout';
import { OrdersList, OrderDetails } from '../pages/admin/orders';
import { UsersList, UserDetails, CreateUser } from '../pages/admin/users';

const Router = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      
      {/* Public layout routes */}
      <Route path="/" element={<PublicLayout />}>
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
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'RIDER']}>
            <OrdersList />
          </ProtectedRoute>
        } />
        <Route path="/admin/orders/:id" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'RIDER']}>
            <OrderDetails />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UsersList />
          </ProtectedRoute>
        } />
        <Route path="/admin/users/create" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <CreateUser />
          </ProtectedRoute>
        } />
        <Route path="/admin/users/:id" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UserDetails />
          </ProtectedRoute>
        } />
        <Route path="/rider" element={
          <ProtectedRoute allowedRoles={['RIDER']}>
            <RiderDashboard />
          </ProtectedRoute>
        } />
        <Route path="/customer" element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerDashboard />
          </ProtectedRoute>
        } />
      </Route>
      
      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default Router;
