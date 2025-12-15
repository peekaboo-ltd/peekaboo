import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useLazyFetchOrdersQuery } from '@/api/queries/orders.queries';
import { formatCurrency, formatDate } from '@/utils/strings.util';
import { Link } from 'react-router-dom';

export const AdminOrdersPage: React.FC = () => {
  const [fetchOrders, { data: ordersData, isLoading }] = useLazyFetchOrdersQuery();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders({ 
      page, 
      limit: 10, 
      search: search || undefined, 
      status: statusFilter || undefined 
    });
  }, [fetchOrders, page, search, statusFilter]);

  const orders = ordersData?.rows || ordersData?.data?.rows || [];
  const totalPages = ordersData?.totalPages || 0;

  const getLatestStatus = (activities: any[] = []): string => {
    if (!activities || activities.length === 0) return 'PENDING';
    const sorted = [...activities].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return sorted[sorted.length - 1]?.status || 'PENDING';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'IN_TRANSIT':
        return 'bg-blue-100 text-blue-800';
      case 'CREATED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-1">View and manage all orders in the system</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Search by order ID, reference..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CREATED">Created</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="DELIVERED">Delivered</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('');
                  setPage(1);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No orders found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Sender</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Recipient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Rider</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order: any) => {
                      const status = getLatestStatus(order.activities);
                      const rider = order.assignments?.[0]?.assignedTo;
                      return (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            #{order.referenceId}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {order.sender?.name || order.senderName || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {order.sender?.phoneNumber || order.senderPhone || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {order.recipient?.name || order.recipientName || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {formatCurrency(order.finalFee || 0, 'RWF')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {rider?.name || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {formatDate(order.createdAt, 'MMM DD, YYYY')}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <Link
                              to={`/admin/orders/${order.id}`}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  Page {page} of {totalPages || 1}
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={!ordersData || page >= totalPages}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrdersPage;
