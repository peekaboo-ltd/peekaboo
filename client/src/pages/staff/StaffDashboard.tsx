import React, { useEffect } from 'react';
import StaffLayout from '@/components/staff/StaffLayout';
import { useLazyFetchOrdersQuery } from '@/api/queries/orders.queries';
import { useLazyFetchUsersQuery } from '@/api/queries/users.queries';
import { RoleTypes } from '@/types/auth.type';
import { formatCurrency, formatDate } from '@/utils/strings.util';

const StaffDashboard: React.FC = () => {
  const [fetchOrders, { data: ordersData, isLoading: ordersLoading }] = useLazyFetchOrdersQuery();
  const [fetchUsers, { data: usersData, isLoading: usersLoading }] = useLazyFetchUsersQuery();

  useEffect(() => {
    fetchOrders({ page: 1, limit: 50 });
    fetchUsers({ page: 1, limit: 100, roles: [RoleTypes.RIDER] });
  }, [fetchOrders, fetchUsers]);

  const orders = ordersData?.rows || ordersData?.data?.rows || [];
  const riders = (usersData?.rows || usersData?.data?.rows || []).filter((u: any) =>
    u.userRoles?.some((ur: any) => ur.role?.name === RoleTypes.RIDER)
  );

  const getLatestStatus = (activities: any[] = []): string => {
    if (!activities || activities.length === 0) return 'PENDING';
    const sorted = [...activities].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return sorted[sorted.length - 1]?.status || 'PENDING';
  };

  const activeOrders = orders.filter((o: any) => {
    const status = getLatestStatus(o.activities);
    return !['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(status);
  }).length;

  const pendingPickup = orders.filter((o: any) => {
    const status = getLatestStatus(o.activities);
    return ['PENDING', 'CREATED'].includes(status);
  }).length;

  const inTransit = orders.filter((o: any) => getLatestStatus(o.activities) === 'IN_TRANSIT').length;

  const deliveredToday = orders.filter((o: any) => {
    const status = getLatestStatus(o.activities);
    if (!['DELIVERED', 'COMPLETED'].includes(status)) return false;
    const created = new Date(o.createdAt);
    const now = new Date();
    return created.toDateString() === now.toDateString();
  }).length;

  const recentOrders = [...orders]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_TRANSIT':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
      case 'CREATED':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <StaffLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-600 mt-1">Coordinate orders and riders in real time.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Active Orders" value={activeOrders} loading={ordersLoading} />
          <StatCard label="Pending Pickup" value={pendingPickup} loading={ordersLoading} />
          <StatCard label="In Transit" value={inTransit} loading={ordersLoading} />
          <StatCard label="Delivered Today" value={deliveredToday} loading={ordersLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
              <span className="text-sm text-gray-500">Latest 10 orders</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Order</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Sender</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Rider</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentOrders.map((order: any) => {
                    const status = getLatestStatus(order.activities);
                    const rider = order.assignments?.[0]?.assignedTo;
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">#{order.referenceId}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{order.sender?.name || order.senderName || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{rider?.name || 'Unassigned'}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(order.finalFee || 0, 'RWF')}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>{status}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatDate(order.createdAt, 'MMM DD, YYYY')}</td>
                        <td className="px-4 py-3 text-sm">
                          <a
                            href={`/staff/orders/${order.id}`}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Manage
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {recentOrders.length === 0 && !ordersLoading && (
                <p className="p-4 text-center text-sm text-gray-500">No orders yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Active Riders</h2>
              <span className="text-sm text-gray-500">{riders.length} total</span>
            </div>
            <div className="divide-y divide-gray-200">
              {riders.slice(0, 8).map((rider: any) => (
                <div key={rider.id} className="px-4 py-3">
                  <p className="text-sm font-semibold text-gray-900">{rider.name || rider.email || 'Rider'}</p>
                  <p className="text-xs text-gray-600">{rider.phoneNumber || '-'}</p>
                  <p className="text-xs text-gray-500 mt-1">{rider.status === 'ACTIVE' ? 'Active' : 'Inactive'}</p>
                </div>
              ))}
              {riders.length === 0 && !usersLoading && (
                <p className="p-4 text-center text-sm text-gray-500">No riders found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

const StatCard: React.FC<{ label: string; value: number; loading?: boolean }> = ({ label, value, loading }) => (
  <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
    <p className="text-sm text-gray-600 font-medium">{label}</p>
    <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? '...' : value.toLocaleString()}</p>
  </div>
);

export default StaffDashboard;
