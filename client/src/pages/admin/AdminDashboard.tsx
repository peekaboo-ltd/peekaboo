import React, { useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useLazyFetchUsersQuery } from '@/api/queries/users.queries';
import { useLazyFetchOrdersQuery } from '@/api/queries/orders.queries';
import { formatCurrency, formatDate } from '@/utils/strings.util';

export const AdminDashboard: React.FC = () => {
  const [fetchUsers, { data: usersData }] = useLazyFetchUsersQuery();
  const [fetchOrders, { data: ordersData }] = useLazyFetchOrdersQuery();

  useEffect(() => {
    fetchUsers({ page: 1, size: 1000 });
    fetchOrders({ page: 1, size: 1000 });
  }, [fetchUsers, fetchOrders]);

  const users = usersData?.rows || usersData?.data?.rows || [];
  const orders = ordersData?.rows || ordersData?.data?.rows || [];

  const totalUsers = users.length;
  const activeRiders = users.filter((u: any) => 
    u.userRoles?.some((ur: any) => ur.role?.name === 'RIDER') && u.status === 'ACTIVE'
  ).length;
  const totalOrders = orders.length;
  const revenue = orders.reduce((sum: number, o: any) => sum + (Number(o.finalFee) || 0), 0);

  const recentOrders = [...orders]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getLatestStatus = (activities: any[] = []): string => {
    if (!activities || activities.length === 0) return 'PENDING';
    const sorted = [...activities].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return sorted[sorted.length - 1]?.status || 'PENDING';
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard label="Total Users" value={totalUsers.toLocaleString()} />
          <StatCard label="Active Riders" value={activeRiders.toLocaleString()} />
          <StatCard label="Total Orders" value={totalOrders.toLocaleString()} />
          <StatCard label="Revenue" value={formatCurrency(revenue, 'RWF')} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentOrdersCard orders={recentOrders} getLatestStatus={getLatestStatus} />
          <OrderStatusChart orders={orders} getLatestStatus={getLatestStatus} />
        </div>
      </div>
    </AdminLayout>
  );
};

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <p className="text-gray-600 text-sm font-medium">{label}</p>
    <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
  </div>
);

const RecentOrdersCard: React.FC<{ orders: any[]; getLatestStatus: (activities: any[]) => string }> = ({ orders, getLatestStatus }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h2>
    <div className="space-y-4">
      {orders.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No orders yet</p>
      ) : (
        orders.map((order: any) => {
          const status = getLatestStatus(order.activities);
          const statusColor = status === 'DELIVERED' || status === 'COMPLETED' 
            ? 'text-green-600' 
            : status === 'CANCELLED' 
            ? 'text-red-600' 
            : 'text-yellow-600';
          
          return (
            <div key={order.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">Order #{order.referenceId}</p>
                <p className="text-xs text-gray-500">{formatDate(order.createdAt, 'MMM DD, YYYY HH:mm')}</p>
              </div>
              <span className={`text-sm font-medium ${statusColor}`}>{status}</span>
            </div>
          );
        })
      )}
    </div>
  </div>
);

const OrderStatusChart: React.FC<{ orders: any[]; getLatestStatus: (activities: any[]) => string }> = ({ orders, getLatestStatus }) => {
  const statusCounts = {
    PENDING: 0,
    CREATED: 0,
    IN_TRANSIT: 0,
    DELIVERED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };

  orders.forEach((order: any) => {
    const status = getLatestStatus(order.activities);
    if (status in statusCounts) {
      statusCounts[status as keyof typeof statusCounts]++;
    }
  });

  const total = orders.length || 1;
  const statuses = [
    { name: 'Pending', count: statusCounts.PENDING, color: 'bg-yellow-100', barColor: 'bg-yellow-500', textColor: 'text-yellow-600' },
    { name: 'Created', count: statusCounts.CREATED, color: 'bg-blue-100', barColor: 'bg-blue-500', textColor: 'text-blue-600' },
    { name: 'In Transit', count: statusCounts.IN_TRANSIT, color: 'bg-purple-100', barColor: 'bg-purple-500', textColor: 'text-purple-600' },
    { name: 'Delivered', count: statusCounts.DELIVERED, color: 'bg-green-100', barColor: 'bg-green-500', textColor: 'text-green-600' },
    { name: 'Completed', count: statusCounts.COMPLETED, color: 'bg-emerald-100', barColor: 'bg-emerald-500', textColor: 'text-emerald-600' },
    { name: 'Cancelled', count: statusCounts.CANCELLED, color: 'bg-red-100', barColor: 'bg-red-500', textColor: 'text-red-600' },
  ].filter(s => s.count > 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Orders by Status</h2>
      <div className="space-y-4">
        {statuses.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No orders yet</p>
        ) : (
          statuses.map((status) => {
            const percentage = (status.count / total) * 100;
            return (
              <div key={status.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{status.name}</span>
                  <span className={`text-sm font-bold ${status.textColor}`}>{status.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${status.barColor} h-2 rounded-full transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;