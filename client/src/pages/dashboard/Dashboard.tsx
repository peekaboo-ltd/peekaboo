import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContextSecure';

interface Order {
  id: string;
  senderPhone: string;
  recipientPhone: string;
  status: 'pending' | 'picked-up' | 'in-transit' | 'delivered' | 'cancelled';
  createdAt: string;
  estimatedDelivery?: string;
  cost?: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time and set mock data
    const timer = setTimeout(() => {
      // Mock orders data
    const mockOrders: Order[] = [
      {
        id: '001',
        senderPhone: '+250788123456',
        recipientPhone: '+250788654321',
        status: 'delivered',
        createdAt: '2024-12-01T10:00:00Z',
        estimatedDelivery: '2024-12-01T11:30:00Z',
        cost: 2500,
      },
      {
        id: '002',
        senderPhone: '+250788123456',
        recipientPhone: '+250788111222',
        status: 'in-transit',
        createdAt: '2024-12-02T14:00:00Z',
        estimatedDelivery: '2024-12-02T15:30:00Z',
        cost: 3000,
      },
      {
        id: '003',
        senderPhone: '+250788123456',
        recipientPhone: '+250788333444',
        status: 'pending',
        createdAt: '2024-12-02T16:00:00Z',
        cost: 2000,
      },
    ];

      setOrders(mockOrders);
      setLoading(false);
    }, 500); // Small delay to simulate loading

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'in-transit': return 'text-primary-600 bg-primary-50';
      case 'picked-up': return 'text-yellow-600 bg-yellow-50';
      case 'pending': return 'text-gray-600 bg-gray-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'in-transit': return <Clock className="w-4 h-4" />;
      case 'picked-up': return <Package className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Welcome back, {((user as any)?.name) || user?.email || 'User'}!
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Track and manage your deliveries</p>
          </div>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            New Order
          </a>
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
                <p className="text-gray-600 text-xs sm:text-sm">Delivered</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'delivered').length}
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
                <p className="text-gray-600 text-xs sm:text-sm">In Progress</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {orders.filter(o => ['pending', 'picked-up', 'in-transit'].includes(o.status)).length}
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
                <p className="text-gray-600 text-xs sm:text-sm">Total Spent</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {orders.reduce((sum, o) => sum + (o.cost || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </article>
        </section>

        {/* Orders List */}
        <section className="bg-white rounded-lg shadow-sm border">
          <header className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Orders</h2>
          </header>

          <div className="divide-y divide-gray-200">
            {orders.length === 0 ? (
              <div className="px-4 sm:px-6 py-8 sm:py-12 text-center">
                <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" aria-hidden="true" />
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">No orders yet</p>
                <a
                  href="/"
                  className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
                >
                  Place your first order
                </a>
              </div>
            ) : (
              orders.map((order) => (
                <article key={order.id} className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <Package className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base">Order #{order.id}</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {order.senderPhone} → {order.recipientPhone}
                        </p>
                        <p className="text-xs text-gray-500">
                          Created: {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className="font-medium text-gray-900 text-sm sm:text-base">
                          {order.cost ? `RWF ${order.cost.toLocaleString()}` : 'Pending'}
                        </p>
                        {order.estimatedDelivery && (
                          <p className="text-xs text-gray-500">
                            ETA: {formatDate(order.estimatedDelivery)}
                          </p>
                        )}
                      </div>

                      <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="hidden sm:inline">{order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
  );
};

export default Dashboard