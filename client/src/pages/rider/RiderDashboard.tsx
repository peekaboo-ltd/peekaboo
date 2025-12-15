import { RiderLocationTracker } from '@/components/riders/RiderLocationTracker';
import { useFetchOrderAssignmentsQuery } from '@/api/queries/orderAssignments.queries';
import {
  useAcceptOrderAssignmentMutation,
  useRejectOrderAssignmentMutation,
  useCompleteOrderAssignmentMutation,
} from '@/api/mutations/orderAssignments.mutations';
import { useAuth } from '@/contexts/AuthContextSecure';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/strings.util';

export const RiderDashboard = () => {
  const { user } = useAuth();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const {
    data: assignmentsResp,
    isLoading: isAssignmentsLoading,
    isError: isAssignmentsError,
    refetch: refetchAssignments,
  } = useFetchOrderAssignmentsQuery(
    { assignedToId: user?.id as any, page: 1, size: 20 },
    { skip: !user?.id }
  );

  const [acceptAssignment] = useAcceptOrderAssignmentMutation();
  const [rejectAssignment] = useRejectOrderAssignmentMutation();
  const [completeAssignment] = useCompleteOrderAssignmentMutation();

  const assignments = assignmentsResp?.data?.rows || [];

  // Calculate today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayAssignments = assignments.filter((a: any) => {
    const assignmentDate = new Date(a.createdAt);
    assignmentDate.setHours(0, 0, 0, 0);
    return assignmentDate.getTime() === today.getTime();
  });

  const todayDeliveries = todayAssignments.filter((a: any) => a.status === 'COMPLETED').length;
  const todayEarnings = todayAssignments
    .filter((a: any) => a.status === 'COMPLETED')
    .reduce((sum: number, a: any) => sum + (Number(a.order?.finalFee) || 0), 0);

  const pendingOrders = assignments.filter((a: any) => a.status === 'PENDING').length;

  const handleAccept = async (id: string) => {
    setAcceptingId(id);
    try {
      await acceptAssignment({ id: id as any }).unwrap();
      toast.success('Order accepted! Status updated to in transit.');
      refetchAssignments();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to accept order');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Are you sure you want to reject this order?')) return;
    setRejectingId(id);
    try {
      await rejectAssignment({ id: id as any }).unwrap();
      toast.success('Order rejected. New rider will be assigned.');
      refetchAssignments();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to reject order');
    } finally {
      setRejectingId(null);
    }
  };

  const handleComplete = async (id: string) => {
    if (!window.confirm('Mark this delivery as completed?')) return;
    setCompletingId(id);
    try {
      await completeAssignment({ id: id as any }).unwrap();
      toast.success('Delivery completed! Order status updated.');
      refetchAssignments();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to complete order');
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rider Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your availability and orders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Location Tracker */}
          <div className="lg:col-span-2">
            <RiderLocationTracker />
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Deliveries</span>
                <span className="text-2xl font-bold text-blue-600">{todayDeliveries}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Earnings</span>
                <span className="text-2xl font-bold text-green-600">{formatCurrency(todayEarnings, 'RWF')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending orders</span>
                <span className="text-2xl font-bold text-gray-900">{pendingOrders}</span>
              </div>
            </div>
          </div>
        </div>

        {/* My Assignments Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Assignments</h3>
            {assignmentsResp?.data?.totalCount !== undefined && (
              <span className="text-sm text-gray-500">{assignmentsResp.data.totalCount} total</span>
            )}
          </div>

          {isAssignmentsLoading ? (
            <div className="text-center py-8 text-gray-500">Loading assignments...</div>
          ) : isAssignmentsError ? (
            <div className="text-center py-8 text-red-600">Failed to load assignments</div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No assignments yet</p>
              <p className="text-sm mt-1">Go online to receive orders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((a: any) => (
                <div
                  key={a.id}
                  className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  {(() => {
                    const order = a.order || {};
                    const pickupAddress = order.pickupLocation || order.locationFrom?.address || 'Pickup not set';
                    const dropoffAddress = order.deliveryLocation || order.locationTo?.address || 'Drop-off not set';
                    const senderPhone = order.sender?.phoneNumber || order.createdBy?.phoneNumber || 'N/A';
                    const recipientPhone = order.recipient?.phoneNumber || 'N/A';
                    const fee = order.finalFee;

                    return (
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Order #{order.code || a.orderId?.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Assigned: {new Date(a.createdAt).toLocaleString()}
                        </p>

                        <div className="mt-2 space-y-1 text-xs text-gray-700">
                          <p>📍 Pickup: {pickupAddress}</p>
                          <p>🎯 Drop-off: {dropoffAddress}</p>
                          <p>📞 Sender: {senderPhone}</p>
                          <p>📞 Recipient: {recipientPhone}</p>
                          {fee !== undefined && fee !== null && (
                            <p>💰 Final fee: {formatCurrency(fee, 'RWF')}</p>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        a.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : a.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : a.status === 'COMPLETED'
                          ? 'bg-blue-100 text-blue-800'
                          : a.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : a.status === 'CANCELLED'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {a.status}
                    </span>

                    {/* Action Buttons */}
                    {a.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(a.id)}
                          disabled={acceptingId === a.id}
                          className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50"
                        >
                          {acceptingId === a.id ? 'Accepting...' : 'Accept'}
                        </button>
                        <button
                          onClick={() => handleReject(a.id)}
                          disabled={rejectingId === a.id}
                          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50"
                        >
                          {rejectingId === a.id ? 'Rejecting...' : 'Reject'}
                        </button>
                      </div>
                    )}

                    {a.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleComplete(a.id)}
                        disabled={completingId === a.id}
                        className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
                      >
                        {completingId === a.id ? 'Completing...' : 'Mark Delivered'}
                      </button>
                    )}

                    {a.order?.id && (
                      <Link
                        to={`/orders/${a.order.id}`}
                        className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        View Order
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
