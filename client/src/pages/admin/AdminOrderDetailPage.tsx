import { useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { useLazyGetOrderQuery } from '@/api/queries/orders.queries';
import { formatCurrency, formatDate } from '@/utils/strings.util';
import { ArrowLeft, Phone, MapPin, Clock } from 'lucide-react';

const statusColors: Record<string, string> = {
  CREATED: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  IN_TRANSIT: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const getLatestStatus = (activities: any[] = []): string => {
  if (!activities || activities.length === 0) return 'PENDING';
  const sorted = [...activities].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return sorted[sorted.length - 1]?.status || 'PENDING';
};

export const AdminOrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trigger, { data: response, isLoading, error }] = useLazyGetOrderQuery();

  useEffect(() => {
    if (id) {
      trigger({ id: id as any });
    }
  }, [id, trigger]);

  const order = response?.data;
  const currentStatus = getLatestStatus(order?.activities);
  const rider = order?.assignments?.[0]?.assignedTo;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="h-12 bg-gray-200 rounded animate-pulse mb-6" />
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !order) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate('/admin/orders')}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </button>
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">Order not found</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/admin/orders')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </button>

          <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Order #{order.referenceId}</h1>
                  <p className="text-sm text-gray-600 mt-1">{formatDate(order.createdAt, 'MMM DD, YYYY HH:mm')}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[currentStatus] || 'bg-gray-100 text-gray-800'}`}>
                  {currentStatus}
                </span>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Sender Info */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Sender</h3>
                  <div className="space-y-2">
                    <p className="text-gray-900 font-medium">{order.sender?.name || order.senderName || '-'}</p>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Phone className="w-4 h-4 mr-2" />
                      {order.sender?.phoneNumber || order.senderPhone || '-'}
                    </div>
                    {order.senderAddress && (
                      <div className="flex items-start text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{order.senderAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recipient Info */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Recipient</h3>
                  <div className="space-y-2">
                    <p className="text-gray-900 font-medium">{order.recipient?.name || order.recipientName || '-'}</p>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Phone className="w-4 h-4 mr-2" />
                      {order.recipient?.phoneNumber || order.recipientPhone || '-'}
                    </div>
                    {order.recipientAddress && (
                      <div className="flex items-start text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{order.recipientAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-4">Order Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Amount</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(order.finalFee || 0, 'RWF')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Rider</p>
                    <p className="text-gray-900 font-medium">{rider?.name || 'Unassigned'}</p>
                    {rider?.phoneNumber ? (
                      <p className="text-xs text-gray-600 mt-1">{rider.phoneNumber}</p>
                    ) : null}
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Type</p>
                    <p className="text-gray-900 font-medium">{order.type || 'Standard'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Distance</p>
                    <p className="text-gray-900 font-medium">{order.distance ? `${Number(order.distance).toFixed(2)} km` : '-'}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              {order.activities && order.activities.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-4">Timeline</h3>
                  <div className="space-y-4">
                    {[...order.activities]
                      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                      .map((activity: any, index: number) => (
                        <div key={activity.id} className="flex">
                          <div className="flex flex-col items-center mr-4">
                            <div className={`w-3 h-3 rounded-full ${index === order.activities.length - 1 ? 'bg-blue-600' : 'bg-gray-400'}`} />
                            {index < order.activities.length - 1 && <div className="w-0.5 h-12 bg-gray-300 my-2" />}
                          </div>
                          <div className="pb-4">
                            <p className="font-medium text-gray-900">{activity.status}</p>
                            <p className="text-sm text-gray-600 flex items-center mt-1">
                              <Clock className="w-4 h-4 mr-2" />
                              {formatDate(activity.createdAt, 'MMM DD, YYYY HH:mm')}
                            </p>
                            {activity.notes && <p className="text-sm text-gray-700 mt-2">{activity.notes}</p>}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetailPage;
