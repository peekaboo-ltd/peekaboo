import { useParams, useNavigate } from 'react-router-dom';
import { useLazyGetOrderQuery } from '@/api/queries/orders.queries';
import { formatCurrency, formatDate } from '@/utils/strings.util';
import { ArrowLeft, Phone, MapPin, Clock } from 'lucide-react';
import { useEffect } from 'react';

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

export const OrderDetailPage = () => {
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

  if (isLoading) {
    return (
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
    );
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Order not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order #{order?.referenceId}</h1>
                <p className="text-sm text-gray-600 mt-1">Created {formatDate(order?.createdAt)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[currentStatus]}`}>
                {currentStatus}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                  Pickup Location
                </h3>
                <p className="text-gray-900 font-medium">{order?.pickupLocation}</p>
                {order?.pickupCoordinates && (
                  <p className="text-xs text-gray-500 mt-1">{order.pickupCoordinates}</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-green-600" />
                  Drop-off Location
                </h3>
                <p className="text-gray-900 font-medium">{order?.deliveryLocation}</p>
                {order?.deliveryCoordinates && (
                  <p className="text-xs text-gray-500 mt-1">{order.deliveryCoordinates}</p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Sender</p>
                  <p className="text-sm font-medium text-gray-900">{order?.sender?.name || 'Not specified'}</p>
                  <a
                    href={`tel:${order?.sender?.phoneNumber}`}
                    className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-flex items-center"
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    {order?.sender?.phoneNumber}
                  </a>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Recipient</p>
                  <p className="text-sm font-medium text-gray-900">{order?.recipient?.name || 'Not specified'}</p>
                  <a
                    href={`tel:${order?.recipient?.phoneNumber}`}
                    className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-flex items-center"
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    {order?.recipient?.phoneNumber}
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Pricing Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Base Fee</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(order?.initialFee, 'RWF')}</span>
                </div>
                {order?.distance && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Distance</span>
                    <span className="text-sm font-medium text-gray-900">{order.distance} km</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-sm font-semibold text-gray-900">Total Amount</span>
                  <span className="text-lg font-bold text-blue-600">{formatCurrency(order?.finalFee, 'RWF')}</span>
                </div>
              </div>
            </div>

            {order?.activities && order.activities.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Activity Timeline
                </h3>
                <div className="space-y-3">
                  {order.activities.map((activity: any, index: number) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        {index < order.activities.length - 1 && <div className="w-0.5 h-8 bg-gray-200 mt-2" />}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-medium text-gray-900">{activity.status}</p>
                        <p className="text-xs text-gray-600">{formatDate(activity.createdAt)}</p>
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
  );
};

export default OrderDetailPage;
