import { useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, Plus, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContextSecure';
import { useLazyFetchOrdersQuery } from '@/api/queries/orders.queries';
import { useAppSelector, useAppDispatch } from '@/states/hooks';
import { setOrdersList } from '@/states/slices/order.slice';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate as formatDateUtil } from '@/utils/strings.util';

const Dashboard = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { ordersList } = useAppSelector((state) => state.order);
  const [fetchOrders, { isLoading }] = useLazyFetchOrdersQuery();

  useEffect(() => {
    if (user?.id) {
      fetchOrders({ page: 1, size: 10, senderId: user.id, recipientId: user.id }).then((res) => {
        if (res?.data?.data?.rows) {
          dispatch(setOrdersList(res.data.data.rows));
        }
      });
    }
  }, [user?.id, fetchOrders, dispatch]);

  const orders = ordersList || [];

  const getLatestStatus = (activities: any[] = []) => {
    if (!activities || activities.length === 0) return 'PENDING';
    return activities[activities.length - 1]?.status || 'PENDING';
  };

  const getStatusColor = (status: string) => {
    const upperStatus = status?.toUpperCase();
    switch (upperStatus) {
      case 'DELIVERED': 
      case 'COMPLETED': return 'text-green-600 bg-green-50';
      case 'IN_TRANSIT': return 'text-blue-600 bg-blue-50';
      case 'ACCEPTED': return 'text-yellow-600 bg-yellow-50';
      case 'PENDING':
      case 'CREATED': return 'text-gray-600 bg-gray-50';
      case 'CANCELLED': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    const upperStatus = status?.toUpperCase();
    switch (upperStatus) {
      case 'DELIVERED':
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'IN_TRANSIT': return <Clock className="w-4 h-4" />;
      case 'ACCEPTED': return <Package className="w-4 h-4" />;
      case 'PENDING':
      case 'CREATED': return <Clock className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.firstName || user?.email || 'User'}!
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Track and manage your deliveries</p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Order
          </Link>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8" aria-label="Order statistics">
          <article className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center" aria-hidden="true">
                <Package className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-gray-600 text-xs sm:text-sm">Total Orders</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </article>

          <article className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center" aria-hidden="true">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter((o: any) => ['DELIVERED', 'COMPLETED'].includes(getLatestStatus(o.activities))).length}
                </p>
              </div>
            </div>
          </article>

          <article className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center" aria-hidden="true">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter((o: any) => ['PENDING', 'CREATED', 'ACCEPTED', 'IN_TRANSIT'].includes(getLatestStatus(o.activities))).length}
                </p>
              </div>
            </div>
          </article>

          <article className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center" aria-hidden="true">
                <span className="text-primary-600 font-bold text-sm">RWF</span>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(orders.reduce((sum: number, o: any) => sum + (Number(o.finalFee) || 0), 0), 'RWF')}
                </p>
              </div>
            </div>
          </article>
        </section>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link
              to="/orders"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="divide-y divide-gray-200">
            {orders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No orders yet</p>
                <Link
                  to="/"
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Place your first order
                </Link>
              </div>
            ) : (
              orders.slice(0, 5).map((order: any) => {
                const status = getLatestStatus(order.activities);
                return (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Order #{order.referenceId}</p>
                        <p className="text-sm text-gray-600">
                          {order.sender?.phoneNumber || 'N/A'} → {order.recipient?.phoneNumber || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Created: {formatDateUtil(order.createdAt, 'MMM DD, YYYY HH:mm')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {order.finalFee ? formatCurrency(order.finalFee, 'RWF') : 'Pending'}
                        </p>
                        {order.distance && (
                          <p className="text-xs text-gray-500">
                            {order.distance} km
                          </p>
                        )}
                      </div>
                      
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        {status}
                      </div>
                    </div>
                  </div>
                </Link>
              )})
            )}
          </div>
        </div>
      </main>
  );
};

export default Dashboard